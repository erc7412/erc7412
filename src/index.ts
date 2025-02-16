import * as viem from 'viem'
import IERC7412 from '../out/IERC7412.sol/IERC7412.0.8.27.json'
import { type OracleAdapter } from './types'
import { parseError } from './parseError'

import Debug from 'debug'

import ITrustedMulticallForwarder from '../out/ITrustedMulticallForwarder.sol/ITrustedMulticallForwarder.json'
import { getWETHAddress } from './constants'

const debug = Debug('erc7412')

const TRUSTED_MULTICALL_FORWARDER_ADDRESS: viem.Address = '0xE2C5658cC5C448B48141168f3e475dF8f65A1e3e'

export const LEGACY_ODR_ERROR = [
  { type: 'error', name: 'OracleDataRequired', inputs: [{ type: 'address' }, { type: 'bytes' }] }
]

export type TransactionRequest = Pick<viem.TransactionRequest, 'to' | 'data' | 'value' | 'from'>

export function makeTrustedForwarderMulticall(transactions: TransactionRequest[]): TransactionRequest {
  const totalValue = transactions.reduce((val, txn) => {
    return val + (txn.value ?? BigInt(0))
  }, BigInt(0))

  return {
    from: transactions[transactions.length - 1].from,
    to: TRUSTED_MULTICALL_FORWARDER_ADDRESS,
    value: totalValue,
    data: viem.encodeFunctionData({
      abi: ITrustedMulticallForwarder.abi,
      functionName: 'aggregate3Value',
      args: [
        transactions.map((txn) => ({
          target: txn.to,
          callData: txn.data ?? '0x',
          value: txn.value ?? '0',
          requireSuccess: true
        }))
      ]
    })
  }
}

export async function callWithOffchainData(
  transactions: [TransactionRequest, ...TransactionRequest[]],
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[],
  maxIter = 5
): Promise<[viem.Hex, ...viem.Hex[]]> {
  const client = viem.createPublicClient({ transport: viem.custom(provider, { retryCount: 0 }) })

  const prependedTxns: TransactionRequest[] = []
  for (let i = 0; i < maxIter; i++) {
    let result
    try {
      result = await client.call(makeTrustedForwarderMulticall([...prependedTxns, ...transactions] as TransactionRequest[]))
    } catch (caughtErr) {
      prependedTxns.push(...(await resolvePrependTransaction(caughtErr, client, adapters)))
      continue
    }
    if (result.data === undefined) {
      throw new Error('missing return data from multicall')
    }

    const datas: any[] = viem.decodeFunctionResult({
      abi: ITrustedMulticallForwarder.abi,
      functionName: 'aggregate3Value',
      data: result.data
    }) as any[]
    return datas.slice(-transactions.length) as any
  }

  throw new Error('erc7412 callback repeat exceeded')
}

export function resolveAdapterCalls(
  origError: any,
  provider: Parameters<typeof viem.custom>[0]
): Record<viem.Address, Array<{ query: viem.Hex; fee: bigint }>> {
  try {
    let err
    try {
      err = viem.decodeErrorResult({
        abi: IERC7412.abi,
        data: parseError(origError as viem.CallExecutionError)
      })
    } catch {
      err = viem.decodeErrorResult({
        abi: LEGACY_ODR_ERROR,
        data: parseError(origError as viem.CallExecutionError)
      })
    }
    debug('parsing error of type', err.errorName)
    if (err.errorName === 'Errors') {
      const errorsList = err.args?.[0] as viem.Hex[]

      const adapterCalls: Record<viem.Address, Array<{ query: viem.Hex; fee: bigint }>> = {}
      for (const error of errorsList) {
        const subAdapterCalls = resolveAdapterCalls(error, provider)

        for (const a in subAdapterCalls) {
          if (adapterCalls[a as viem.Address] === undefined) {
            adapterCalls[a as viem.Address] = []
          }

          adapterCalls[a as viem.Address].push(...subAdapterCalls[a as viem.Address])
        }
      }

      return adapterCalls
    } else if (err.errorName === 'OracleDataRequired') {
      const oracleQuery = err.args?.[1] as viem.Hex
      const oracleAddress = err.args?.[0] as viem.Address
      const fee = err.args?.[2] as bigint

      return { [oracleAddress]: [{ query: oracleQuery, fee }] }
    }
  } catch (err) {
    console.error('had unexpected failure', err)
  }

  // if we get to this point then we cant parse the error so we should make sure to send the original
  throw new Error(`could not parse error. can it be decoded elsewhere? ${JSON.stringify(origError)}`)
}

export async function resolvePrependTransaction(
  origError: any,
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[]
): Promise<TransactionRequest[]> {
  const client = viem.createPublicClient({ transport: viem.custom(provider, { retryCount: 0 }) })
  const adapterCalls = resolveAdapterCalls(origError, provider)

  const priceUpdateTxs: TransactionRequest[] = []
  for (const a in adapterCalls) {
    const oracleId = viem.hexToString(
      viem.trim(
        (await client.readContract({
          abi: IERC7412.abi,
          address: a as viem.Address,
          functionName: 'oracleId',
          args: []
        })) as viem.Hex,
        { dir: 'right' }
      )
    )

    const adapter = adapters.find((a) => a.getOracleId() === oracleId)
    if (adapter === undefined) {
      throw new Error(
        `oracle ${oracleId} not supported (supported oracles: ${Array.from(adapters.map((a) => a.getOracleId())).join(',')})`
      )
    }

    const offchainDataCalls = await adapter.fetchOffchainData(client, a as viem.Address, adapterCalls[a as viem.Address])

    for (const call of offchainDataCalls) {
      priceUpdateTxs.push({
        from: getWETHAddress(await client.getChainId()),
        to: a as viem.Address,
        value: call.fee,
        data: viem.encodeFunctionData({
          abi: IERC7412.abi,
          functionName: 'fulfillOracleQuery',
          args: [call.arg]
        })
      })
    }
  }

  debug('adding oracle update calls', priceUpdateTxs.length)

  return priceUpdateTxs
}

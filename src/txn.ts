import { type OracleAdapter, type TransactionRequest } from './types'
import * as viem from 'viem'
import IERC7412 from '../out/IERC7412.sol/IERC7412.json'
import { parseError } from './parseError'

import Debug from 'debug'

const debug = Debug('erc7412')

export const LEGACY_ODR_ERROR = [
  { type: 'error', name: 'OracleDataRequired', inputs: [{ type: 'address' }, { type: 'bytes' }] }
]

export async function resolvePrependTransaction (
  origError: any,
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[]
): Promise<TransactionRequest<Array<{ to: viem.Address, data: viem.Hex, value: bigint }>>> {
  const client = viem.createPublicClient({ transport: viem.custom(provider, { retryCount: 0 }) })
  const adapterCalls = resolveAdapterCalls(origError, provider)

  let priceUpdateTxs: TransactionRequest<Array<{ to: viem.Address, data: viem.Hex, value: bigint }>> = []
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
      priceUpdateTxs = [
        ...priceUpdateTxs,
        {
          // from: getWETHAddress(await client.getChainId()),
          to: a as viem.Address,
          value: call.fee || 0n,
          data: viem.encodeFunctionData({
            abi: IERC7412.abi,
            functionName: 'fulfillOracleQuery',
            args: [call.arg]
          })
        }
      ]
    }
  }

  debug('adding oracle update calls', priceUpdateTxs.length)

  return priceUpdateTxs
}

export function resolveAdapterCalls (
  origError: any,
  provider: Parameters<typeof viem.custom>[0]
): Record<viem.Address, Array<{ query: viem.Hex, fee: bigint }>> {
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

      const adapterCalls: Record<viem.Address, Array<{ query: viem.Hex, fee: bigint }>> = {}
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

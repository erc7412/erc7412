import * as viem from 'viem'
import { type OracleAdapter, type TransactionRequest } from './types'

import ITrustedMulticallForwarder from '../out/ITrustedMulticallForwarder.sol/ITrustedMulticallForwarder.json'

const TRUSTED_MULTICALL_FORWARDER_ADDRESS: viem.Address = '0xE2C5658cC5C448B48141168f3e475dF8f65A1e3e'

import { resolvePrependTransaction } from './txn'

export const LEGACY_ODR_ERROR = [
  { type: 'error', name: 'OracleDataRequired', inputs: [{ type: 'address' }, { type: 'bytes' }] }
]

export function makeTrustedForwarderMulticall<T extends unknown[]>(
  transactions: TransactionRequest<T>
): TransactionRequest<{ to: viem.Address; value: bigint; data: viem.Hex }[]>[0] {
  const totalValue = transactions.reduce((val: bigint, txn) => {
    return val + ((txn as { value: bigint }).value ?? BigInt(0))
  }, BigInt(0))

  return {
    to: TRUSTED_MULTICALL_FORWARDER_ADDRESS,
    value: totalValue,
    data: viem.encodeFunctionData({
      abi: ITrustedMulticallForwarder.abi,
      functionName: 'aggregate3Value',
      args: [
        transactions.map((txn) => {
          const castType = txn as { to: viem.Address; data: viem.Hex; value: bigint }
          return {
            target: castType.to,
            callData: castType.data ?? '0x',
            value: castType.value ?? '0',
            requireSuccess: true
          }
        })
      ]
    })
  }
}

export async function buildTransactionWithOffchainData<T extends unknown[]>(
  transactions: TransactionRequest<T>,
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[],
  maxIter = 5
): Promise<[viem.Hex, ...viem.Hex[]]> {
  const client = viem.createPublicClient({ transport: viem.custom(provider, { retryCount: 0 }) })

  let prependedTxns: TransactionRequest<{ to: viem.Address; data: viem.Hex }[]> = []
  for (let i = 0; i < maxIter; i++) {
    let result
    try {
      // TODO: is there any way to avoid any cast here? its interesting because it only becomes a type error if the spread operator is used
      // when prependedTxns is gone
      result = await client.call(makeTrustedForwarderMulticall([...prependedTxns, ...(transactions as any)]))
    } catch (caughtErr) {
      prependedTxns = [...prependedTxns, ...(await resolvePrependTransaction(caughtErr, client, adapters))]
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

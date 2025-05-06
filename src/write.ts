import * as viem from 'viem'
import { type Batcher, type OracleAdapter, type TransactionRequest } from './types'

import ITrustedMulticallForwarder from '../out/ITrustedMulticallForwarder.sol/ITrustedMulticallForwarder.json'
import { simulateWithOffchainData } from './read'

const TRUSTED_MULTICALL_FORWARDER_ADDRESS: viem.Address = '0xE2C5658cC5C448B48141168f3e475dF8f65A1e3e'

export const LEGACY_ODR_ERROR = [
  { type: 'error', name: 'OracleDataRequired', inputs: [{ type: 'address' }, { type: 'bytes' }] }
]

export function makeTrustedForwarderMulticall<T extends unknown[]> (
  transactions: TransactionRequest<T>
): TransactionRequest<Array<{ to: viem.Address, value: bigint, data: viem.Hex }>>[0] {
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
          const castType = txn as { to: viem.Address, data: viem.Hex, value: bigint }
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

export async function buildTransactionWithOffchainData<T extends unknown[]> (
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[],
  transactions: TransactionRequest<T>,
  batcher: Batcher<T>,
  maxIter = 5
): Promise<{ to: string, data: string, value: bigint }> {
  const { txns } = await simulateWithOffchainData(provider, adapters, transactions, batcher.fromAddress, maxIter)

  // TODO: types are tough here
  return batcher.batch(txns as any)
}
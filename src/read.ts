import { OracleAdapter, TransactionRequest } from './types'
import type { SimulateCallsReturnType } from 'viem/actions'
import * as viem from 'viem'
import { resolvePrependTransaction } from './txn'

export async function simulateWithOffchainData<T extends unknown[]>(
  provider: Parameters<typeof viem.custom>[0],
  adapters: OracleAdapter[],
  transactions: TransactionRequest<T>,
  from: viem.Address = viem.zeroAddress,
  maxIter = 5
): Promise<{ results: SimulateCallsReturnType<T[]>['results']; txns: TransactionRequest<any>[] }> {
  const client = viem.createPublicClient({
    transport: viem.custom(provider, { retryCount: 0 })
  })

  let prependedTxns: TransactionRequest<{ to: viem.Address; data: viem.Hex; value: bigint }[]> = []
  for (let i = 0; i < maxIter; i++) {
    const simulatedCalls = await client.simulateCalls<any>({
      account: from,
      calls: [...prependedTxns, ...transactions]
    })

    console.log('simulated calls result', simulatedCalls)

    let batchNewTxs: typeof prependedTxns = []
    for (const result of simulatedCalls.results) {
      if (result.status !== 'success') {
        const err = result.error
        const newPrependTxs = await resolvePrependTransaction(err, client, adapters)
        batchNewTxs = [...batchNewTxs, ...newPrependTxs]
      }
    }

    if (!batchNewTxs.length) {
      return {
        results: simulatedCalls.results.slice(-transactions.length).map((r: any) => r.result) as any,
        txns: [...prependedTxns, ...transactions]
      }
    }

    prependedTxns = [...batchNewTxs, ...prependedTxns]
  }

  throw new Error('erc7412 callback repeat limit exceeded')
}

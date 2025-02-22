import type { SimulateCallsParameters } from 'viem/actions'
import type { PublicClient, Client, Address, Hex } from 'viem'

export type TransactionRequest<T extends unknown[]> = SimulateCallsParameters<T>['calls']

export interface OracleAdapter {
  getOracleId: () => string
  fetchOffchainData: (
    client: Client,
    oracleContract: Address,
    oracleQuery: Array<{ query: Hex; fee: bigint }>
  ) => Promise<Array<{ arg: Hex; fee?: bigint }>>
}

export interface Batcher<T extends unknown[]> {
  batchable: (client: PublicClient, from: Address, transactions: TransactionRequest<T>) => Promise<boolean>
  batch: (
    from: Address,
    transactions: TransactionRequest<T>
  ) => TransactionRequest<{ to: Address; data: Hex; value: bigint }[]>[0]
}

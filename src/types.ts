import * as viem from 'viem'
import type { SimulateCallsParameters } from 'viem/actions'
import type { PublicClient, Client, Address, Hex } from 'viem'

export type TransactionRequest<T extends unknown[]> = SimulateCallsParameters<T>['calls']

export interface SendCallsWithOffchainDataParameters
  extends viem.SendCallsParameters {
  skipOffchainData?: boolean
}

export interface OracleAdapter {
  getOracleId: () => string
  fetchOffchainData: (
    client: Client,
    oracleContract: Address,
    oracleQuery: Array<{ query: Hex, fee: bigint }>
  ) => Promise<Array<{ arg: Hex, fee?: bigint }>>
}

export interface Batcher<T extends unknown[]> {
  fromAddress: Address
  batchable: (client: PublicClient, transactions: TransactionRequest<T>) => Promise<boolean>
  batch: (transactions: TransactionRequest<T>) => TransactionRequest<Array<{ to: Address, data: Hex, value: bigint }>>[0]
}

import * as viem from 'viem'

import { prepareTransactionRequest as actionPrepareTransactionRequest } from 'viem/actions'

import { resolvePrependTransaction } from '../../txn'
import { simulateWithOffchainData } from '../../read'
import { makeTrustedForwarderMulticall } from '../../write'

import ITrustedMulticallForwarder from '../../../out/ITrustedMulticallForwarder.sol/ITrustedMulticallForwarder.json'

import type { TransactionRequest } from '../..'
import type { OracleAdapter } from '../../types'
import { getAccount } from './actions-public'

/**
 * Extend your viem client with the object returned by this function to automatically apply erc7412
 * required offchain data to your read calls
 */
export function createErc7412WalletActions(adapters: OracleAdapter[]) {
  return (client: viem.PublicClient) => {
    const actions = {
      prepareTransactionRequest: async (
        args: viem.PrepareTransactionRequestParameters
      ): Promise<viem.PrepareTransactionRequestReturnType> => {
        return await actions.prepareMulticallTransactionRequest({ txns: [args] })
      },

      prepareMulticallTransactionRequest: async <T extends unknown[]>(args: {
        txns: viem.PrepareTransactionRequestParameters[]
      }): Promise<viem.PrepareTransactionRequestReturnType> => {
        let prependedTxns: TransactionRequest<{}[]> = []

        if (args.txns.length < 1) {
          throw new Error('must have at least 1 transaction in multicall')
        }

        const payloadTxns: TransactionRequest<{ data: viem.Hex; to: viem.Address; value: bigint }[]> = args.txns.map((t) => {
          const req = {
            data: t.data || '0x',
            to: t.to || viem.zeroAddress,
            value: t.value || BigInt(0)
          }

          return req
        })

        while (true) {
          const multicallTxn: viem.PrepareTransactionRequestParameters =
            payloadTxns.length > 1 || prependedTxns.length > 0
              ? {
                  // TODO: is this doable without any?
                  ...makeTrustedForwarderMulticall([...prependedTxns, ...payloadTxns] as any[]),
                  account: args.txns[0].account,
                  chain: args.txns[0].chain
                }
              : args.txns[0]
          try {
            return await actionPrepareTransactionRequest(client, multicallTxn)
          } catch (err) {
            prependedTxns = [...prependedTxns, ...(await resolvePrependTransaction(err, client, adapters))]
          }
        }
      },
      simulateContract: async (args: viem.SimulateContractParameters): Promise<viem.SimulateContractReturnType> => {
        const baseTxn = {
          from: (args.account as any)?.address ?? viem.zeroAddress,
          to: args.address,
          chain: args.chain,
          data: viem.encodeFunctionData(args),
          value: args.value
        }
        const preparedTxn = await actions.prepareTransactionRequest(baseTxn)
        const execResult = await simulateWithOffchainData(client, adapters, [baseTxn])
        const txnData = preparedTxn.data

        if (preparedTxn.to !== args.address) {
          if (txnData === undefined) {
            throw new Error('prepared txn should have needed data for multicall')
          }
          return {
            request: {
              ...preparedTxn,
              abi: ITrustedMulticallForwarder.abi,
              address: preparedTxn.to,
              functionName: 'aggregate3Value',
              args: viem.decodeFunctionData({ abi: ITrustedMulticallForwarder.abi, data: txnData })
            } as any,
            result: viem.decodeFunctionResult({
              ...args,
              data: execResult.results[0].data
            }) as never
          }
        }

        console.log('execution result', execResult)
        return {
          request: args,
          result: viem.decodeFunctionResult({
            ...args,
            data: execResult.results[0].data
          })
        } as any // TODO
      }

      // NOTE: cant override `sendRawTransaction` because the transaction is
      // already serialized and so its impossible to impart a new multicall
      // in front without breaking permissions
      // `sendTransaction` is not included because its behavior is not supposed to affect the transaction,
      // its just supposed to sign and send
    }

    return actions
  }
}

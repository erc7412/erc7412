import * as viem from 'viem'

import { estimateContractGas as actionEstimateContractGas } from 'viem/actions'

import { createErc7412WalletActions } from './actions-wallet'

import { simulateWithOffchainData } from '../../read'
import type { OracleAdapter } from '../../types'

export function getAccount (account: `0x${string}` | viem.Account | undefined): `0x${string}` {
  if (account === undefined) {
    return viem.zeroAddress
  }
  if (typeof account === 'string') {
    return viem.getAddress(account)
  }
  return viem.getAddress(account.address)
}

/**
 * Extend your viem client with the object returned by this function to automatically apply erc7412
 * required offchain data to your read calls
 */
export function createErc7412PublicActions (adapters: OracleAdapter[]) {
  const actionsWallet = createErc7412WalletActions(adapters)
  return (client: viem.PublicClient) => {
    const actions = {
      call: async (args: viem.CallParameters): Promise<viem.CallReturnType> => {
        return {
          data: (
            await simulateWithOffchainData(client, adapters, [
              {
                // from: getAccount(args.account),
                to: args.to || viem.zeroAddress,
                data: args.data || '0x',
                value: args.value || BigInt(0)
              }
            ])
          ).results[0].data
        }
      },
      readContract: async (args: viem.ReadContractParameters): Promise<viem.ReadContractReturnType> => {
        return {
          data: viem.decodeFunctionResult({
            ...args,
            data: (
              await simulateWithOffchainData(client, adapters, [
                {
                  data: viem.encodeFunctionData(args),
                  to: args.address || viem.zeroAddress,
                  value: BigInt(0)
                }
              ])
            ).results[0].data
          })
        }
      },
      prepareTransactionRequest: async (args: viem.PrepareTransactionRequestParameters) => {
        // the wallet has all the facilities necessary to proceess a possible transaction request
        return await actionsWallet(client).prepareTransactionRequest(args)
      },
      estimateContractGas: async (args: viem.EstimateContractGasParameters) => {
        try {
          return await actionEstimateContractGas(client, args)
        } catch (err) {
          console.log('WARN: erc7412 not implemented for estimateContractGas')
          throw err
        }
      },
      // TODO: types
      simulateContract: async (args: viem.SimulateContractParameters): Promise<any> => {
        return await actionsWallet(client).simulateContract(args)
      },
      multicall: async (args: viem.MulticallParameters): Promise<viem.MulticallReturnType> => {
        if (args.contracts.length < 1) {
          throw new Error('must have at least one call for multicall')
        }

        const retvals = await simulateWithOffchainData(
          // todo: types have a problem with the fact it cannot verify that the array is at least 1 long
          client,
          adapters,
          args.contracts.map((c) => {
            return {
              // from: c.address,
              data: viem.encodeFunctionData(c),
              to: c.address,
              value: BigInt(0)
            }
          })
        )

        return retvals.results.map((r, i) => {
          return { result: viem.decodeFunctionResult({ ...args.contracts[i], data: r.data }), status: 'success' }
        })
      }
      // below functions are not included because they are not applicable
      // writeContract: async (args: viem.WriteContractParameters) => {},
    }

    return actions
  }
}

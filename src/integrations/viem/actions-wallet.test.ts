import * as viem from 'viem'
import type { PublicClient } from 'viem'
import type { OracleAdapter } from '../../types'

import { prepareTransactionRequest as actionPrepareTransactionRequest } from 'viem/actions'

import * as mod from './actions-wallet'

import { simulateWithOffchainData } from '../../read'
import { resolvePrependTransaction } from '../../txn'

jest.mock('../..')
jest.mock('viem/actions')

describe('integrations/viem/actions-wallet', () => {
  const fakeAddress = viem.getContractAddress({ from: viem.zeroAddress, nonce: 0n })

  const fakeMulticallData =
    '0x174dea710000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000160000000000000000000000000ffffffaeff0b96ea8e4f94b2253f31abdd875847000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000006483802968000000000000000000000000000000000000000000000000000000ae9e141b44000000000000000000000000b2f30a7c980f052f02563fb518dcc39e6bf3817500000000000000000000000000000000000000000000000040bb1e69584b020000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffaeff0b96ea8e4f94b2253f31abdd8758470000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000084d3264e43000000000000000000000000000000000000000000000000000000ae9e141b440000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f00000000000000000000000000000000000000000000000040bb1e69584b020000000000000000000000000000000000000000000000000000000000'

  const fakeAdapters: OracleAdapter[] = [
    {
      getOracleId: () => 'FAKE',
      fetchOffchainData: async () => [{ arg: '0x87651234' as viem.Hex, fee: BigInt(100) }]
    }
  ]

  describe('createErc7412WalletActions()', () => {
    const mockPublicClient = {
      getBlockNumber: jest.fn().mockResolvedValue(12345),
      simulateContract: jest.fn().mockResolvedValue({
        /* Mock result */
      }),
      prepareTransactionRequest: jest.fn().mockResolvedValue({}),
      estimateContractGas: jest.fn().mockResolvedValue(12345)
    } as unknown as PublicClient

    const actions = mod.createErc7412WalletActions(fakeAdapters)(mockPublicClient)

    const fakeTxn = {
      to: fakeAddress,
      data: '0x5678',
      value: 203n
    } as const

    const fakeContractRequest = {
      abi: [
        {
          type: 'function',
          name: 'greet',
          inputs: [
            {
              type: 'string',
              name: 'first'
            },
            {
              type: 'string',
              name: 'second'
            }
          ],
          outputs: [
            {
              type: 'uint32',
              name: 'result'
            }
          ],
          stateMutability: 'view'
        }
      ] as viem.Abi,
      address: fakeAddress,
      functionName: 'greet',
      args: ['uno', 'dos']
    }

    describe('prepareMulticallTransactionRequest()', () => {
      it('fails if insufficient arguments', async () => {
        await expect(actions.prepareMulticallTransactionRequest({ txns: [] })).rejects.toThrowErrorMatchingSnapshot()
      })

      it('passes through if there is no error', async () => {
        jest.mocked(resolvePrependTransaction).mockResolvedValue([])
        jest.mocked(actionPrepareTransactionRequest).mockResolvedValue({})
        await expect(
          actions.prepareTransactionRequest({
            account: fakeAddress,
            to: fakeAddress
          } as unknown as viem.PrepareTransactionRequestParameters)
        ).resolves.toEqual({})

        expect(resolvePrependTransaction).toHaveBeenCalledTimes(0)
      })

      it('handles erc7412 error', async () => {
        jest.mocked(resolvePrependTransaction).mockResolvedValue([])
        jest.mocked(actionPrepareTransactionRequest).mockResolvedValue({ done: 'it' })
        jest.mocked(actionPrepareTransactionRequest).mockRejectedValueOnce(new Error('whoops'))
        await expect(
          actions.prepareMulticallTransactionRequest({
            txns: [
              {
                account: fakeAddress,
                to: fakeAddress,
                data: '0xfab'
              } as unknown as viem.PrepareTransactionRequestParameters,
              {
                account: fakeAddress,
                to: fakeAddress,
                data: '0xbaf'
              } as unknown as viem.PrepareTransactionRequestParameters
            ]
          })
        ).resolves.toEqual({ done: 'it' })
        expect(resolvePrependTransaction).toHaveBeenCalledTimes(1)
      })
    })

    describe('simulateContract()', () => {
      it('should pass through a single transaction', async () => {
        // for the prepare call just return exactly what we are given
        jest.mocked(actionPrepareTransactionRequest).mockImplementation(async (c, v) => {
          return v
        })

        jest.mocked(simulateWithOffchainData).mockResolvedValue({
          results: [
            {
              data: '0x0000000000000000000000000000000000000000000000000000000000000009',
              gasUsed: 100000n,
              result: '',
              status: 'success'
            }
          ],
          txns: []
        })

        const result = await actions.simulateContract(fakeContractRequest)
        expect(result).toMatchObject({ result: 9 })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2][0]).toMatchObject({
          data: viem.encodeFunctionData(fakeContractRequest)
        })
      })

      it('handles data field missing from prepared txn', async () => {
        jest.mocked(actionPrepareTransactionRequest).mockResolvedValue({ done: 'it' })
        await expect(actions.simulateContract(fakeContractRequest)).rejects.toMatchSnapshot()
      })

      it('should handle erc7412 error', async () => {
        jest.mocked(actionPrepareTransactionRequest).mockResolvedValue({ to: viem.zeroAddress, data: fakeMulticallData })
        jest.mocked(actionPrepareTransactionRequest).mockRejectedValueOnce(new Error('whoops'))
        jest.mocked(simulateWithOffchainData).mockResolvedValue({
          results: [
            {
              data: '0x0000000000000000000000000000000000000000000000000000000000000008',
              gasUsed: 100000n,
              result: '',
              status: 'success'
            }
          ],
          txns: []
        })

        const result = await actions.simulateContract({
          abi: [
            {
              type: 'function',
              name: 'greet',
              inputs: [
                {
                  type: 'string',
                  name: 'first'
                },
                {
                  type: 'string',
                  name: 'second'
                }
              ],
              outputs: [
                {
                  type: 'uint32',
                  name: 'result'
                }
              ],
              stateMutability: 'view'
            }
          ] as viem.Abi,
          account: { address: fakeAddress } as any,
          address: fakeAddress,
          functionName: 'greet',
          args: ['uno', 'dos']
        })

        expect(jest.mocked(actionPrepareTransactionRequest)).toHaveBeenCalledTimes(2)
        expect(result).toMatchObject({ result: 8 })
      })
    })
  })
})

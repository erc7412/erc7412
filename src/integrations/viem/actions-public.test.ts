import * as viem from 'viem'
import type { PublicClient } from 'viem'
import type { OracleAdapter } from '../../types'

import {
  prepareTransactionRequest as actionPrepareTransactionRequest,
  estimateContractGas as actionEstimateContractGas
} from 'viem/actions'

import * as mod from './actions-public'

import { simulateWithOffchainData } from '../../read'
import { resolvePrependTransaction } from '../../txn'

jest.mock('../../read')
jest.mock('../../txn')
jest.mock('viem/actions')

describe('integrations/viem/actions-public', () => {
  const fakeAddress = viem.getContractAddress({ from: viem.zeroAddress, nonce: 0n })

  const fakeAdapters: OracleAdapter[] = [
    {
      getOracleId: () => 'FAKE',
      fetchOffchainData: async () => [{ arg: '0x87651234' as viem.Hex, fee: BigInt(100) }]
    }
  ]

  describe('getAccount()', () => {
    it('works with string addresses', () => {
      expect(mod.getAccount('0xdd20f2a09b98536c7caba2bc6d3a6cb4c02281db')).toEqual(
        '0xDd20f2a09B98536C7CAbA2BC6D3A6cB4C02281DB'
      )
    })

    it('works with nested address', () => {
      expect(mod.getAccount({ address: '0xdd20f2a09b98536c7caba2bc6d3a6cb4c02281db' } as unknown as viem.Account)).toEqual(
        '0xDd20f2a09B98536C7CAbA2BC6D3A6cB4C02281DB'
      )
    })
  })

  describe('createErc7412PublicActions()', () => {
    const mockPublicClient = {
      getBlockNumber: jest.fn().mockResolvedValue(12345),
      simulateContract: jest.fn().mockResolvedValue({
        /* Mock result */
      }),
      prepareTransactionRequest: jest.fn().mockResolvedValue({}),
      estimateContractGas: jest.fn().mockResolvedValue(12345)
    } as unknown as PublicClient

    const actions = mod.createErc7412PublicActions(fakeAdapters)(mockPublicClient)

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

    describe('call()', () => {
      it('should pass through a single transaction', async () => {
        jest
          .mocked(simulateWithOffchainData)
          .mockResolvedValue({ results: [{ data: '0x83838', gasUsed: 100000n, result: '', status: 'success' }], txns: [] })
        const result = await actions.call(fakeTxn)
        expect(result).toEqual({ data: '0x83838' })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2]).toEqual([{ ...fakeTxn }])
      })
    })

    describe('multicall()', () => {
      it('errors if nothing to multicall', async () => {
        await expect(actions.multicall({ contracts: [] })).rejects.toThrowErrorMatchingSnapshot()
      })
      it('should pass through a set of transactions without erc7412', async () => {
        jest.mocked(simulateWithOffchainData).mockResolvedValue({
          results: [
            { data: '0xfac', gasUsed: 100000n, result: '', status: 'success' },
            { data: '0xcaf', gasUsed: 100000n, result: '', status: 'success' }
          ],
          txns: []
        })
        jest.mocked(simulateWithOffchainData).mockResolvedValue({
          results: [
            {
              data: '0x0000000000000000000000000000000000000000000000000000000000000010',
              gasUsed: 100000n,
              result: '',
              status: 'success'
            },
            {
              data: '0x0000000000000000000000000000000000000000000000000000000000000009',
              gasUsed: 100000n,
              result: '',
              status: 'success'
            }
          ],
          txns: []
        })
        const result = await actions.multicall({ contracts: [fakeContractRequest, fakeContractRequest] })

        // result will only return one object because thats what is returned by the mock, but normally there would be 2
        expect(result).toEqual([
          { result: 16, status: 'success' },
          { result: 9, status: 'success' }
        ])

        // however, the mock should have been called with 2 items
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2][0]).toMatchObject({
          data: viem.encodeFunctionData(fakeContractRequest)
        })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2][1]).toMatchObject({
          data: viem.encodeFunctionData(fakeContractRequest)
        })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][0]).toMatchObject(mockPublicClient)
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][1]).toMatchObject(fakeAdapters)
      })
    })

    describe('readContract()', () => {
      it('should pass through a single transaction', async () => {
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
        const result = await actions.readContract(fakeContractRequest)
        expect(result).toEqual({ data: 9 })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2][0]).toMatchObject({
          data: viem.encodeFunctionData(fakeContractRequest)
        })
      })
    })

    describe('simulateContract()', () => {
      it('should pass through a single transaction', async () => {
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

        // for the prepare call just return exactly what we are given
        jest.mocked(actionPrepareTransactionRequest).mockImplementation(async (c, v) => {
          return v
        })

        const result = await actions.simulateContract(fakeContractRequest)
        expect(result).toMatchObject({ result: 9 })
        expect(jest.mocked(simulateWithOffchainData).mock.calls[0][2][0]).toMatchObject({
          data: viem.encodeFunctionData(fakeContractRequest)
        })
      })
    })

    describe('prepareTransactionRequest()', () => {
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
          actions.prepareTransactionRequest({
            account: fakeAddress,
            to: fakeAddress
          } as unknown as viem.PrepareTransactionRequestParameters)
        ).resolves.toEqual({ done: 'it' })
        expect(resolvePrependTransaction).toHaveBeenCalledTimes(1)
      })
    })

    describe('estimateContractGas()', () => {
      it('passes through if there is no error', async () => {
        jest.mocked(actionEstimateContractGas).mockResolvedValue(BigInt(12345))
        await expect(actions.estimateContractGas(fakeContractRequest)).resolves.toEqual(BigInt(12345))
      })

      it('handles error', async () => {
        jest.mocked(actionEstimateContractGas).mockRejectedValue(new Error('wow'))
        await expect(actions.estimateContractGas(fakeContractRequest)).rejects.toThrow(new Error('wow'))
      })
    })
  })
})

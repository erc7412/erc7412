import * as mod from './txn'

import * as viem from 'viem'

import IERC7412 from '../out/IERC7412.sol/IERC7412.0.8.27.json'

import type { OracleAdapter } from './types'

export const fakeWeb3 = {
  request: jest.fn()
}

const fakeAddress = viem.getContractAddress({ from: viem.zeroAddress, nonce: 0n })

export const fakeAdapters: OracleAdapter[] = [
  {
    getOracleId: () => 'FAKE',
    fetchOffchainData: async (_client, _oracleContract, oracleQuery: any[]) =>
      oracleQuery.map((v) => ({ arg: ('0x8765' + v.query.slice(2)) as viem.Hex, fee: BigInt(100) }))
  }
]

describe('txn.ts', () => {
  let errorCode: viem.Hex = '0x1234'
  beforeEach(() => {
    errorCode = '0x1234'
    fakeWeb3.request.mockImplementation(async ({ method, params }: { method: string; params: any[] }) => {
      if (method === 'eth_chainId') {
        return BigInt(1337)
      } else if (method === 'eth_call') {
        if (params[0].data === viem.encodeFunctionData({ abi: IERC7412.abi, functionName: 'oracleId' })) {
          // getOracleId call
          return viem.encodeFunctionResult({
            abi: IERC7412.abi,
            functionName: 'oracleId',
            result: viem.stringToHex('FAKE', { size: 32 })
          })
        } else if (params[0].data.includes('87651234') === true) {
          return viem.encodeAbiParameters(
            [viem.parseAbiParameter('(bool success, bytes returnData)[]')],
            [
              [
                { success: true, returnData: '0x1234' },
                { success: true, returnData: '0x5678' }
              ]
            ]
          )
        } else {
          /* eslint @typescript-eslint/no-throw-literal: "off" */
          throw {
            data: viem.encodeErrorResult({
              abi: IERC7412.abi,
              errorName: 'OracleDataRequired',
              args: ['0x2345234523452345234523452345234523452345', errorCode, BigInt(0)]
            })
          }
        }
      } else {
        return '0x'
      }
    })
  })

  describe('resolvePrependTransaction()', () => {
    it('passes though error if its not recognized', async () => {
      const origError = '0x08273020'
      await expect(async () => await mod.resolvePrependTransaction(origError, fakeWeb3, fakeAdapters)).rejects.toThrow(
        new Error(`could not parse error. can it be decoded elsewhere? "${origError}"`)
      )
    })

    it('fetches offchain data without fee', async () => {
      const origError = {
        data: viem.encodeErrorResult({
          abi: mod.LEGACY_ODR_ERROR,
          errorName: 'OracleDataRequired',
          args: [fakeAddress, '0x1234']
        })
      }
      fakeWeb3.request.mockResolvedValue(viem.stringToHex('FAKE', { size: 32 }))
      const result = await mod.resolvePrependTransaction(origError, fakeWeb3, fakeAdapters)
      expect(result[0].data).toEqual(
        viem.encodeFunctionData({ abi: IERC7412.abi, functionName: 'fulfillOracleQuery', args: ['0x87651234'] })
      )
    })

    it('fetches offchain data with fee', async () => {
      const origError = {
        error: {
          data: viem.encodeErrorResult({
            abi: IERC7412.abi,
            errorName: 'OracleDataRequired',
            args: [fakeAddress, '0x1234', BigInt(100)]
          })
        }
      }
      fakeWeb3.request.mockResolvedValueOnce(viem.stringToHex('FAKE', { size: 32 }))
      const result = await mod.resolvePrependTransaction(origError, fakeWeb3, fakeAdapters)
      expect(result[0].data).toEqual(
        viem.encodeFunctionData({ abi: IERC7412.abi, functionName: 'fulfillOracleQuery', args: ['0x87651234'] })
      )
      expect(Number(result[0].value)).toEqual(100)
    })

    it('fetches offchain data with multiple errors', async () => {
      const origSubError1 = viem.encodeErrorResult({
        abi: IERC7412.abi,
        errorName: 'OracleDataRequired',
        args: [fakeAddress, '0x1234', BigInt(100)]
      })

      const origSubError2 = viem.encodeErrorResult({
        abi: mod.LEGACY_ODR_ERROR,
        errorName: 'OracleDataRequired',
        args: [fakeAddress, '0x3456']
      })

      const origErrors = {
        data: viem.encodeErrorResult({
          abi: IERC7412.abi,
          errorName: 'Errors',
          args: [[origSubError1, origSubError2]]
        })
      }
      fakeWeb3.request.mockResolvedValue(viem.stringToHex('FAKE', { size: 32 }))
      const result = await mod.resolvePrependTransaction(origErrors, fakeWeb3, fakeAdapters)
      expect(result[0].data).toEqual(
        viem.encodeFunctionData({ abi: IERC7412.abi, functionName: 'fulfillOracleQuery', args: ['0x87651234'] })
      )
      expect(result[1].data).toEqual(
        viem.encodeFunctionData({ abi: IERC7412.abi, functionName: 'fulfillOracleQuery', args: ['0x87653456'] })
      )
      expect(Number(result[0].value)).toEqual(100)
      expect(Number(result[1].value)).toEqual(100)
    })

    it('fails if adapter does not exist', async () => {
      const origError = {
        data: viem.encodeErrorResult({
          abi: IERC7412.abi,
          errorName: 'OracleDataRequired',
          args: [fakeAddress, '0x1234', BigInt(100)]
        })
      }
      fakeWeb3.request.mockResolvedValueOnce(viem.stringToHex('FAKER', { size: 32 }))
      expect(mod.resolvePrependTransaction(origError, fakeWeb3, fakeAdapters)).rejects.toThrow(
        'oracle FAKER not supported (supported oracles: FAKE)'
      )
    })
  })
})

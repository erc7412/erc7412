import * as mod from './read'

import * as viem from 'viem'

import IERC7412 from '../out/IERC7412.sol/IERC7412.0.8.27.json'

import type { OracleAdapter } from './types'

export const fakeWeb3 = {
  request: jest.fn()
}

export const fakeAdapters: OracleAdapter[] = [
  {
    getOracleId: () => 'FAKE',
    fetchOffchainData: async (_client, _oracleContract, oracleQuery: any[]) =>
      oracleQuery.map((v) => ({ arg: ('0x8765' + v.query.slice(2)) as viem.Hex, fee: BigInt(100) }))
  }
]

describe('read.ts', () => {
  let errorCode: viem.Hex = '0x1234'
  beforeEach(() => {
    errorCode = '0x1234'
    fakeWeb3.request.mockImplementation(async ({ method, params }: { method: string; params: any[] }) => {
      if (method === 'eth_chainId') {
        return BigInt(1337)
      } else if (method === 'eth_simulateV1') {
        console.log('block state calls', params[0].blockStateCalls[0])
        if (params[0].blockStateCalls[0].calls[0].data.includes('87651234') === true) {
          return [
            {
              baseFeePerGas: '0x0',
              blobGasUsed: '0x0',
              calls: [
                {
                  returnData: viem.encodeAbiParameters(
                    [viem.parseAbiParameter('(bool success, bytes returnData)[]')],
                    [
                      [
                        { success: true, returnData: '0x1234' },
                        { success: true, returnData: '0x5678' }
                      ]
                    ]
                  ),
                  logs: [],
                  gasUsed: '0x55b3',
                  status: '0x1'
                }
              ],
              difficulty: '0x0',
              excessBlobGas: '0x3220000',
              extraData: '0x',
              gasLimit: '0x1c9c380',
              gasUsed: '0x55b3',
              hash: '0x4342f0ab870175757176d5888e82f27523a6e1d52c0ac20a6ddf599d54ce0e04',
              logsBloom:
                '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
              miner: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
              mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              nonce: '0x0000000000000000',
              number: '0x1455a09',
              parentBeaconBlockRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
              parentHash: '0xb30e288a5518544cc71dd24389a21061adab20f45f17c0907054dccf7bf00c01',
              receiptsRoot: '0x4ce78e593fcb88a20d7bb31c27879f800551f4069371e576f7efad0d9615a960',
              sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
              size: '0x29b',
              stateRoot: '0xcfb988bd139a3f44aa79f9cbaba606429d76749fd18e1e8ca9a6612a4e0c8384',
              timestamp: '0x674f0627',
              totalDifficulty: '0xc70d815d562d3cfa955',
              transactions: params[0].blockStateCalls[0].calls.map(
                () => '0x96c6b7b5b4835fd518fd914feb586452cc797d332f1bd234f72c9e692c4c427a'
              ),
              transactionsRoot: '0xebe30ac336ac6714af65c684e278799f70965b18ae12e9b368056640ac111650',
              uncles: [],
              withdrawals: [],
              withdrawalsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'
            }
          ]
        } else {
          // return a failure response
          return [
            {
              baseFeePerGas: '0x0',
              blobGasUsed: '0x0',
              calls: params[0].blockStateCalls[0].calls.map(() => ({
                returnData: '0x',
                error: {
                  message: 'foo',
                  code: 1,
                  data: viem.encodeErrorResult({
                    abi: IERC7412.abi,
                    errorName: 'OracleDataRequired',
                    args: ['0x2345234523452345234523452345234523452345', errorCode, BigInt(0)]
                  })
                },
                gasUsed: '0x55b3',
                status: '0x0'
              })),

              difficulty: '0x0',
              excessBlobGas: '0x3220000',
              extraData: '0x',
              gasLimit: '0x1c9c380',
              gasUsed: '0x55b3',
              hash: '0x4342f0ab870175757176d5888e82f27523a6e1d52c0ac20a6ddf599d54ce0e04',
              logsBloom:
                '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
              miner: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
              mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              nonce: '0x0000000000000000',
              number: '0x1455a09',
              parentBeaconBlockRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
              parentHash: '0xb30e288a5518544cc71dd24389a21061adab20f45f17c0907054dccf7bf00c01',
              receiptsRoot: '0x4ce78e593fcb88a20d7bb31c27879f800551f4069371e576f7efad0d9615a960',
              sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
              size: '0x29b',
              stateRoot: '0xcfb988bd139a3f44aa79f9cbaba606429d76749fd18e1e8ca9a6612a4e0c8384',
              timestamp: '0x674f0627',
              totalDifficulty: '0xc70d815d562d3cfa955',
              transactions: params[0].blockStateCalls[0].calls.map(
                () => '0x96c6b7b5b4835fd518fd914feb586452cc797d332f1bd234f72c9e692c4c427a'
              ),
              transactionsRoot: '0xebe30ac336ac6714af65c684e278799f70965b18ae12e9b368056640ac111650',
              uncles: [],
              withdrawals: [],
              withdrawalsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'
            }
          ]
        }
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

  describe('simulateWithOffchainData()', () => {
    it('passes a call execution error if its not recognized', async () => {
      const origError = new Error('0x08273020')
      fakeWeb3.request.mockRejectedValue(origError)
      await expect(
        async () =>
          await mod.simulateWithOffchainData(fakeWeb3, fakeAdapters, [
            { to: '0x1234123412341234123412341234123412341234', data: '0x12345678' }
          ])
      ).rejects.toThrowErrorMatchingSnapshot()
    })

    it('resolves offchain data and returns correct data', async () => {
      expect(
        await mod.simulateWithOffchainData(fakeWeb3, fakeAdapters, [
          { to: '0x1234123412341234123412341234123412341234', data: '0x12345678' },
          { to: '0x1234123412341234123412341234123412341234', data: '0x23456789' }
        ])
      ).toMatchObject([
        { returnData: '0x1234', success: true },
        { returnData: '0x5678', success: true }
      ])
    })

    it('fails if call repeat exceeded', async () => {
      // modify the error code so that the OracleDataRequired error continues forever.
      errorCode = '0x5757'

      await expect(
        mod.simulateWithOffchainData(fakeWeb3, fakeAdapters, [
          { to: '0x1234123412341234123412341234123412341234', data: '0x12345678' },
          { to: '0x1234123412341234123412341234123412341234', data: '0x23456789' }
        ])
      ).rejects.toThrow(new Error('erc7412 callback repeat exceeded'))
    })

    it('fails if no data in call response', async () => {
      fakeWeb3.request.mockResolvedValue(undefined)

      await expect(
        mod.simulateWithOffchainData(fakeWeb3, fakeAdapters, [
          { to: '0x1234123412341234123412341234123412341234', data: '0x12345678' },
          { to: '0x1234123412341234123412341234123412341234', data: '0x23456789' }
        ])
      ).rejects.toThrow(new Error('missing return data from multicall'))
    })
  })
})

import * as viem from 'viem'
import axios from 'axios'
import { type OracleAdapter } from '../types'

import { EthCallQueryRequest, QueryProxyQueryResponse } from '@wormhole-foundation/wormhole-query-sdk'

export class WormholeAdapter implements OracleAdapter {
  constructor(
    private readonly apiKey: string,
    private readonly apiUrl: string = 'https://query.wormhole.com/v1/query'
  ) {}

  getOracleId(): string {
    return 'WORMHOLE'
  }

  async fetchOffchainData(
    client: viem.Client,
    requester: viem.Address,
    data: Array<{ query: viem.Hex; fee?: bigint }>
  ): Promise<Array<{ arg: viem.Hex; fee: bigint }>> {
    const chainRequests: { [chainId: string]: { chainId: bigint; target: string; data: string; asOfTimestamp: bigint }[] } =
      {}
    for (const d of data) {
      const [requests] = viem.decodeAbiParameters(
        [
          {
            name: 'query',
            type: 'tuple[]',
            internalType: 'struct WormholeERC7412Wrapper.QueryData',
            components: [
              {
                name: 'chainId',
                type: 'uint256',
                internalType: 'uint256'
              },
              {
                name: 'target',
                type: 'address',
                internalType: 'address'
              },
              {
                name: 'data',
                type: 'bytes',
                internalType: 'bytes'
              },
              {
                name: 'asOfTimestamp',
                type: 'uint256',
                internalType: 'uint256'
              }
            ]
          }
        ],

        d.query
      )

      for (const request of requests) {
        if (!chainRequests[request.chainId.toString()]) {
          chainRequests[request.chainId.toString()] = []
        }
        chainRequests[request.chainId.toString()].push(request)
      }
    }

    const responses = []
    for (const id in chainRequests) {
      const req = new EthCallQueryRequest(
        'latest',
        chainRequests[id].map((r) => ({
          to: r.target,
          data: r.data
        }))
      )

      const res = await queryWormhole(this.apiUrl, this.apiKey, req)

      responses.push({
        arg: viem.encodeAbiParameters(
          [{ type: 'bytes' }, { type: '(bytes32, bytes32, uint8, uint8)[]' }],
          [res.bytes as viem.Hex, res.signatures]
        ) as viem.Hex,
        fee: 0n
      })
    }

    return responses
  }
}

async function queryWormhole(apiUrl: string, apiKey: string, request: EthCallQueryRequest) {
  const serialized = request.serialize()
  return (
    await axios.post<QueryProxyQueryResponse>(
      apiUrl,
      {
        bytes: Buffer.from(serialized).toString('hex')
      },
      { headers: { 'X-API-Key': apiKey } }
    )
  ).data
}

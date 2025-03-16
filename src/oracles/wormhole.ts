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
    const chainRequests: { [chainId: string]: [bigint, string, string, bigint][] } = {}
    for (const d of data) {
      const [requests] = viem.decodeAbiParameters(
        [{ type: '(uint256 chainId, address target, bytes data, uint256 timestampTag)[]' }],
        d.query
      ) as [[bigint, string, string, bigint][]]

      for (const request of requests) {
        if (!chainRequests[request[0].toString()]) {
          chainRequests[request[0].toString()] = []
        }
        chainRequests[request[0].toString()].push(request)
      }
    }

    const responses = []
    for (const id in chainRequests) {
      const req = new EthCallQueryRequest(
        'latest',
        chainRequests[id].map((r) => ({
          to: r[1],
          data: r[2]
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

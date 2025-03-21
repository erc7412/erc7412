import type ChainlinkDataStreamsConsumer from '@hackbg/chainlink-datastreams-consumer'
import { type OracleAdapter } from '../types'
import * as viem from 'viem'
import Debug from 'debug'

const debug = Debug('erc7412:oracles:chainlink-datastreams')

async function sleep (ms: number) {
  return await new Promise((resolve) => setTimeout(resolve, ms))
}

export class ChainlinkAdapter implements OracleAdapter {
  private readonly api: ChainlinkDataStreamsConsumer
  constructor (api: ChainlinkDataStreamsConsumer) {
    this.api = api
  }

  getOracleId (): string {
    return 'CHAINLINK_DATA_STREAMS'
  }

  async fetchOffchainData (
    _client: viem.Client,
    _oracleContract: viem.Address,
    oracleQuery: Array<{ query: viem.Hex, fee?: bigint }>
  ): Promise<Array<{ arg: viem.Hex, fee: bigint }>> {
    debug('fulfill offchain data', oracleQuery)
    // divide needed update timestamp
    const staleFeedIds: Record<string, viem.Hash[]> = {}
    let totalFee = BigInt(0)
    for (const query of oracleQuery) {
      const [, feedId, , timestamp] = viem.decodeAbiParameters(
        [{ type: 'string' }, { type: 'bytes32' }, { type: 'string' }, { type: 'uint' }, { type: 'string' }],
        query.query
      )

      if (staleFeedIds[timestamp.toString()] === undefined) {
        staleFeedIds[timestamp.toString()] = []
      }

      staleFeedIds[timestamp.toString()].push(feedId)
      totalFee += query.fee ?? BigInt(0)
    }

    const reports = []
    await sleep(10000)
    for (const t in staleFeedIds) {
      const feedResults = await this.api.fetchFeeds({
        timestamp: t,
        feeds: staleFeedIds[t]
      })
      debug('fetched feeds feeds', t, staleFeedIds[t], feedResults)

      for (const r in feedResults) {
        reports.push(feedResults[r] as any)
      }
    }

    return reports.map((r) => ({
      // TODO: fix type
      arg: viem.encodeAbiParameters(
        [{ type: 'bytes' }, { type: 'bytes' }],
        [(r as unknown as any).fullReport as viem.Hex, '0x']
      ),
      fee: totalFee / BigInt(reports.length)
    }))
  }
}

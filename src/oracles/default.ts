import { type OracleAdapter } from '../types'
import type * as viem from 'viem'
import fetch from 'node-fetch'

export class DefaultAdapter implements OracleAdapter {
  constructor (private readonly oracleId: string, private readonly url: string) {}

  getOracleId (): string {
    return this.oracleId
  }

  async fetchOffchainData (
    _client: viem.Client,
    _oracleContract: viem.Address,
    oracleQuery: Array<{ query: viem.Hex, fee?: bigint }>
  ): Promise<Array<{ arg: viem.Hex, fee: bigint }>> {
    if (oracleQuery.length > 1) {
      throw new Error('only one query at a time is supported')
    }

    return [{ arg: await this.fetch(oracleQuery[0].query), fee: oracleQuery[0].fee ?? BigInt(0) }]
  }

  private async fetch (data: viem.Hex): Promise<viem.Hex> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: data
    })
    if (response.status !== 200) {
      throw new Error(`error fetching data (${response.status}): ${await response.text()}`)
    }
    return (await response.text()) as viem.Hex
  }
}

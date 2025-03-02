import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'
import { type OracleAdapter } from '../types'
import * as viem from 'viem'
import { type Address } from 'viem'

export class PythAdapter implements OracleAdapter {
  private readonly connection: EvmPriceServiceConnection
  constructor (endpoint: string) {
    this.connection = new EvmPriceServiceConnection(endpoint)
  }

  getOracleId (): string {
    return 'PYTH'
  }

  async fetchOffchainData (
    _client: viem.Client,
    _oracleContract: viem.Address,
    oracleQuery: Array<{ query: viem.Hex, fee?: bigint }>
  ): Promise<Array<{ arg: viem.Hex, fee: bigint }>> {
    // divide by update type
    const stalePriceIds: viem.Hash[] = []
    let stalenessTolerance: bigint = BigInt(86400)
    let staleUpdateFee: bigint = BigInt(0)
    const vaaUpdatePrices: Array<{ arg: viem.Hex, fee: bigint }> = []
    for (const query of oracleQuery) {
      const [updateType] = viem.decodeAbiParameters([{ name: 'updateType', type: 'uint8' }], query.query)
      if (updateType === 1) {
        const [, stalenessOrTime, priceId] = viem.decodeAbiParameters(
          [
            { name: 'updateType', type: 'uint8' },
            { name: 'stalenessTolerance', type: 'uint64' },
            { name: 'priceIds', type: 'bytes32' }
          ],
          query.query
        )
        stalePriceIds.push(priceId)
        stalenessTolerance = stalenessOrTime < stalenessTolerance ? stalenessOrTime : stalenessTolerance
        staleUpdateFee = staleUpdateFee + (query.fee ?? BigInt(1))
      } else if (updateType === 2) {
        const [, requestedTime, priceId] = viem.decodeAbiParameters(
          [
            { name: 'updateType', type: 'uint8' },
            { name: 'requestedTime', type: 'uint64' },
            { name: 'priceIds', type: 'bytes32' }
          ],
          query.query
        )

        const [priceFeedUpdateVaa] = await this.connection.getVaa(
          priceId as string,
          Number((requestedTime as unknown as bigint).toString())
        )

        const priceFeedUpdate = '0x' + Buffer.from(priceFeedUpdateVaa, 'base64').toString('hex')

        vaaUpdatePrices.push({
          arg: viem.encodeAbiParameters(
            [
              { type: 'uint8', name: 'updateType' },
              { type: 'uint64', name: 'timestamp' },
              { type: 'bytes32[]', name: 'priceIds' },
              { type: 'bytes[]', name: 'updateData' }
            ],
            [2, requestedTime, [priceId], [priceFeedUpdate as Address]]
          ),
          fee: query.fee ?? BigInt(1)
        })
      } else {
        throw new Error(`update type ${updateType} not supported`)
      }
    }

    if (stalePriceIds.length > 0) {
      const updateData = (await this.connection.getPriceFeedsUpdateData(stalePriceIds as string[])) as unknown as Address[]

      const stalePriceCall = viem.encodeAbiParameters(
        [
          { type: 'uint8', name: 'updateType' },
          { type: 'uint64', name: 'stalenessTolerance' },
          { type: 'bytes32[]', name: 'priceIds' },
          { type: 'bytes[]', name: 'updateData' }
        ],
        [1, stalenessTolerance, stalePriceIds, updateData]
      )

      return [{ arg: stalePriceCall, fee: staleUpdateFee }, ...vaaUpdatePrices]
    } else {
      return vaaUpdatePrices
    }
  }
}

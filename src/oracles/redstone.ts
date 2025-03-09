import { DataPackagesWrapper } from '@redstone-finance/evm-connector'
import * as viem from 'viem'
import { type OracleAdapter } from '../types'
import { DataPackagesResponse, requestDataPackages } from '@redstone-finance/sdk'

export class RedstoneAdapter implements OracleAdapter {
  constructor(private readonly cacheServiceUrls?: string[]) {}

  getOracleId(): string {
    return 'REDSTONE'
  }

  async fetchOffchainData(
    client: viem.Client,
    requester: viem.Address,
    data: Array<{ query: viem.Hex; fee?: bigint }>
  ): Promise<Array<{ arg: viem.Hex; fee: bigint }>> {
    const feedIds: { [serviceId: string]: viem.Hex[] } = {}
    let uniqueSignersCount = 0
    for (const d of data) {
      const [feedId, singleUniqueSignersCount, dataServiceId] = viem.decodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint8' }, { type: 'string' }],
        d.query
      ) as [viem.Hex, number, string]

      if (!feedIds[dataServiceId]) {
        feedIds[dataServiceId] = []
      }
      feedIds[dataServiceId].push(feedId)
      uniqueSignersCount = Math.max(uniqueSignersCount, singleUniqueSignersCount)
    }

    const responses = []

    for (const serviceId in feedIds) {
      // redstone types appear to have a bug so cast to any
      const dataPackages = await requestDataPackages({
        dataPackagesIds: feedIds[serviceId].map(bytes32ToString),
        dataServiceId: serviceId,
        uniqueSignersCount,
        urls: this.cacheServiceUrls,
        authorizedSigners: (await client.extend(viem.publicActions).readContract({
          abi: [{ type: 'function', name: 'getAuthorisedSigners', outputs: [{ type: 'address[]' }] }],
          address: requester,
          functionName: 'getAuthorisedSigners'
        })) as string[]
      })

      const signedRedstonePayload = await new DataPackagesWrapper(dataPackages).prepareRedstonePayload(true)

      const dataTimestamp = BigInt(chooseDataPackagesTimestamp(dataPackages))
      const encodedDataTimestamp = viem.encodeAbiParameters(
        [{ type: 'bytes32[]' }, { type: 'uint256' }],
        [feedIds[serviceId], dataTimestamp]
      )

      responses.push({ arg: `${encodedDataTimestamp}${signedRedstonePayload}` as viem.Hex, fee: 0n })
    }

    return responses
  }
}

const bytes32ToString = (bytes32: string) => {
  const arrayOfChars = bytes32.slice(2).split('')

  while (arrayOfChars[arrayOfChars.length - 2] === '0') {
    arrayOfChars.pop()
  }

  return Buffer.from(arrayOfChars.join(''), 'hex').toString()
}

export const chooseDataPackagesTimestamp = (dataPackages: DataPackagesResponse) => {
  const dataPackageTimestamps = Object.values(dataPackages).flatMap((dataPackages) =>
    dataPackages!.map((dataPackage) => dataPackage.dataPackage.timestampMilliseconds)
  )
  return Math.min(...dataPackageTimestamps)
}

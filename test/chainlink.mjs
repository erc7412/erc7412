import { callWithOffchainData } from '../dist/src/index.js'
import { ChainlinkAdapter } from '../dist/src/oracles/chainlink-datastreams.js'
import ChainlinkDataStreamsConsumer from '@hackbg/chainlink-datastreams-consumer'

import { Contract, ethers } from 'ethers'

// make an ethers provider like we would have in the browser
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || 'https://arbitrum-sepolia.publicnode.com'
)

;(async () => {
  // send a request directly to the erc7412 datastreams contract (manually deployed for this test)
  const contractData = {
    address:
      process.env.CHAINLINK_DS_ADDRESS ||
      '0xDf185eCa361B40eb8c16BF079bf600074a14b300',
    abi: [
      {
        name: 'getLatestPrice',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'bytes32' }, { type: 'uint32' }],
        outputs: [{ type: 'int192' }]
      }
    ]
  }

  const contract = new Contract(contractData.address, contractData.abi)

  // request price with very strict window to ensure we go through the api
  const data = contract.interface.encodeFunctionData('getLatestPrice', [
    process.env.CHAINLINK_DS_ID ||
      '0x00037da06d56d083fe599397a4769a042d63aa73dc4ef57709d31e9971a5b439',
    60
  ])

  const call = {
    to: contractData.address,
    data
  }

  const adapters = []
  console.log('consumer parameters', {
    hostname: 'api.testnet-dataengine.chain.link',
    wsHostname: 'api.testnet-dataengine.chain.link',
    clientID: process.env.CHAINLINK_DS_API_KEY,
    clientSecret: process.env.CHAINLINK_DS_API_SECRET
  })
  const chainlinkApi = new ChainlinkDataStreamsConsumer({
    hostname: 'api.testnet-dataengine.chain.link',
    wsHostname: 'api.testnet-dataengine.chain.link',
    clientID: process.env.CHAINLINK_DS_API_KEY,
    clientSecret: process.env.CHAINLINK_DS_API_SECRET
  })

  adapters.push(new ChainlinkAdapter(chainlinkApi))

  const result = await callWithOffchainData(
    [call],
    { request: (r) => provider.send(r.method, r.params) },
    adapters
  )
  console.log('completed sucessfully', result)
})()

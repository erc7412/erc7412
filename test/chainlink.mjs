import { simulateWithOffchainData } from '../dist/src/index.js'
import { ChainlinkAdapter } from '../dist/src/oracles/chainlink-datastreams.js'
import ChainlinkDataStreamsConsumer from '@hackbg/chainlink-datastreams-consumer'

import { Contract, ethers } from 'ethers'

// make an ethers provider like we would have in the browser
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || 'https://sepolia.publicnode.com'
)

;(async () => {
  // send a request directly to the erc7412 datastreams contract (manually deployed for this test)
  const contractData = {
    address:
      process.env.CHAINLINK_DS_ADDRESS ||
      '0x3b5370968d9730f7AF1e87C270fe57BDc7794b7e',
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
      '0x000359843a543ee2fe414dc14c7e7920ef10f4372990b79d6361cdc0dd1ba782',
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

  const result = await simulateWithOffchainData(
    { request: (r) => provider.send(r.method, r.params) },
    adapters,
    [call]
  )
  console.log('completed sucessfully', result.results)
})()

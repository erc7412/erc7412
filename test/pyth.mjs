import { simulateWithOffchainData } from '../dist/src/index.js'
import { PythAdapter } from '../dist/src/oracles/pyth.js'
import * as cannon from '@usecannon/builder'

import { Contract, ethers } from 'ethers'

// make an ethers provider like we would have in the browser
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || 'https://sepolia.publicnode.com'
)

;(async () => {
  const networkInfo = await provider.getNetwork()
  const contractData = await cannon.getCannonContract({
    package: 'pyth-erc7412-wrapper',
    chainId: networkInfo.chainId,
    contractName: 'PythERC7412Wrapper'
  })

  const pythFeedId =
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' // ETH/USD from https://www.pyth.network/developers/price-feed-ids

  const contract = new Contract(contractData.address, contractData.abi)
    console.log('contract', contractData.address);

  // request a price for a popular feed with a very low timeout. it will trigger a pull and the price will be ascertained
  const data = contract.interface.encodeFunctionData('getLatestPrice', [
    pythFeedId,
    5
  ])

  const call = {
    to: contractData.address,
    data
  }

  const adapters = []
  adapters.push(new PythAdapter('https://hermes.pyth.network/'))

  const result = await simulateWithOffchainData(
    { request: (r) => provider.send(r.method, r.params) },
    adapters,
    [call]
  )
  console.log('completed sucessfully', result)
})()

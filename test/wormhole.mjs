import { simulateWithOffchainData } from '../dist/src/index.js'
import { WormholeAdapter } from '../dist/src/oracles/wormhole.js'

import { Contract, ethers } from 'ethers'

// make an ethers provider like we would have in the browser
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || 'https://sepolia.publicnode.com'
)

;(async () => {
  // send a request directly to the erc7412 datastreams contract (manually deployed for this test)
  const contractData = {
    address:
      process.env.WORMHOLE_PROXY_ADDRESS ||
      '0xe0dfCeA66d666B45C4329dD9AEb4c2e01d5769C2',
    abi: [
      {
        type: 'function',
        name: 'getCrossChainData',
        inputs: [
          {
            name: 'query',
            type: 'tuple',
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
          },
          {
            name: 'stalenessTolerance',
            type: 'uint256',
            internalType: 'uint256'
          }
        ],
        outputs: [
          {
            name: '',
            type: 'bytes',
            internalType: 'bytes'
          }
        ],
        stateMutability: 'view'
      }
    ]
  }

  const contract = new Contract(contractData.address, contractData.abi)

  // request price with very strict window to ensure we go through the api
  const data = contract.interface.encodeFunctionData('getCrossChainData', [
    {
      chainId: 1,
      target: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      data: '0x18160ddd', // totalSupply() call
      asOfTimestamp: 0
    },
    60
  ])

  console.log('prepared to do a call', data)

  const call = {
    to: contractData.address,
    data
  }

  const adapters = []

  adapters.push(
    new WormholeAdapter(
      process.env.WORMHOLE_TOKEN,
      'https://testnet.query.wormhole.com/v1/query'
    )
  )

  const result = await simulateWithOffchainData(
    { request: (r) => provider.send(r.method, r.params) },
    adapters,
    [call]
  )
  console.log('completed sucessfully', result.results)
})()

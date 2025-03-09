// @ts-nocheck
import cannonCli from '@usecannon/cli'
import { ChainDefinition } from '@usecannon/builder'
import * as viem from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { RedstoneAdapter } from '../dist/src/oracles/redstone.js'
import { simulateWithOffchainData } from '../dist/src/index.js'

const { build, getFoundryArtifact, getProvider, runRpc } = cannonCli

async function generate7412CompatibleCall(client, addressToCall, functionName) {
  const adapters = []
  adapters.push(new RedstoneAdapter())

  return await simulateWithOffchainData(client, adapters, [
    {
      to: addressToCall,
      data: functionName
    }
  ])
}

async function makeTestEnv() {
  const node = await runRpc({ port: 8545, chainId: 13370 })

  const info = await build({
    provider: getProvider(node),
    packageDefinition: { name: 'erc7412redstone', version: '0.0.5' },
    wipe: true,
    getArtifact: getFoundryArtifact,
    def: new ChainDefinition({
      name: 'erc7412redstone',
      version: '0.0.1',
      contract: {
        ERC7412RedstoneFeed: {
          artifact: 'ERC7412RedstoneFeed'
        }
      }
    })
  })

  return info
}

async function runRedstoneExample() {
  const netInfo = await makeTestEnv()
  console.log('TEST ENV complete')

  const senderAddr = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

  const btcFeedId = viem.toHex('BTC', { size: 32 })

  const redstoneFeedAddress =
    netInfo.outputs.contracts.ERC7412RedstoneFeed.address
  const redstoneFeedCallData = viem.encodeFunctionData({
    abi: netInfo.outputs.contracts.ERC7412RedstoneFeed.abi,
    functionName: 'getLatestValue',
    args: [btcFeedId, 60]
  })

  const walletConfig = {
    chain: {
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      id: 13370,
      rpcUrls: { default: { http: ['http://localhost:8545'] } }
    },
    transport: viem.custom(netInfo.provider.transport)
  }

  const client = viem
    .createPublicClient(walletConfig)
    .extend(viem.testActions({ mode: 'anvil' }))

  console.log(
    'CONTRACT ADDR',
    await client.getCode({
      address: netInfo.outputs.contracts.ERC7412RedstoneFeed.address
    }),
    netInfo.outputs.contracts.ERC7412RedstoneFeed.address
  )

  // ensure the timestamp is current
  await client.setNextBlockTimestamp({
    timestamp: Math.floor(Date.now() / 1000)
  })

  const walletClient = viem.createWalletClient({
    account: privateKeyToAccount(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    ),
    transport: walletConfig.transport,
    chain: walletConfig.chain
  })

  const callResult = await generate7412CompatibleCall(
    client,
    redstoneFeedAddress,
    redstoneFeedCallData
  )

  console.log('simulate result', callResult)

  console.log('Sending multicall transaction with oracle data')
  const hash = await walletClient.sendTransaction({
    account: senderAddr,
    to: callResult.txns[0].to,
    data: callResult.txns[0].data,
    value: callResult.txns[0].value
  })

  console.log('Multicall transaction hash: ' + hash)

  const receipt = await client.waitForTransactionReceipt({ hash })
  console.log(`Multicall transaction mined gasUsed=${receipt.gasUsed}`)
  const res = await client.readContract({
    address: redstoneFeedAddress,
    abi: netInfo.outputs.contracts.ERC7412RedstoneFeed.abi,
    functionName: 'getLatestValue',
    args: [btcFeedId, 60]
  })

  console.log(`Oracle data BTC price: "${res}" is available on chain`)

  process.exit(0)
}
runRedstoneExample()

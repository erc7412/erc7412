# Integrating ERC-7412 into a Next.js Frontend

This document explains how to integrate the ERC-7412 library into your web application to handle off-chain data requirements for smart contract interactions. Before proceeding, it's beneficial to understand the core concepts of [EIP-7412](https://eips.ethereum.org/EIPS/eip-7412).

## Prerequisites

- Node.js and npm or yarn installed.
- Familiarity with React and Next.js.
- Basic understanding of Ethereum smart contracts and interacting with them via JavaScript.
- Viem or Ethers.js for blockchain interactions.

## Installation

1.  Install the ERC-7412 library and necessary oracle adapters:

    ```bash
    npm install erc7412 @pythnetwork/pyth-evm-js @pythnetwork/pyth-sdk-solidity viem # or ethers
    ```

    **Note:** Install the appropriate oracle adapters based on your project's requirements.

2.  If you are using other oracles, install their respective peer dependencies. [See a table of required peer dependencies](./peer-dependencies.md).

## Setup and Configuration

1.  **Create Oracle Adapters:**

    - In a suitable location within your Next.js project (e.g., a `lib/erc7412.js` file), create an array of oracle adapters.

    ```javascript
    // lib/erc7412.js
    import { PythAdapter } from 'erc7412'

    export const ERC7412_ADAPTERS = [
      new PythAdapter(
        '[https://hermes.pyth.network/](https://hermes.pyth.network/)'
      )
      // Add other oracle adapters (ex. chainlink, wormhole, redstone) as needed
    ]
    ```

2.  **Integrate with Viem (Recommended):**

    - For seamless integration, use the Viem integration provided by the ERC-7412 library. This approach automatically handles `OracleDataRequired` errors.
    - In your Next.js components or a dedicated utility file, extend your Viem client with the ERC-7412 actions.

    ```javascript
    // lib/viemClient.js
    import { createPublicClient, http } from 'viem'
    import { mainnet } from 'viem/chains'
    import {
      createErc7412PublicActions,
      createErc7412WalletActions
    } from 'erc7412/dist/src/integrations/viem'
    import { ERC7412_ADAPTERS } from './erc7412'

    export const publicClient = createPublicClient({
      chain: mainnet,
      transport: http()
    }).extend(createErc7412PublicActions(ERC7412_ADAPTERS))

    //If you are using a wallet client.
    // export const walletClient = createWalletClient({
    //   chain: mainnet,
    //   transport: http(),
    // }).extend(createErc7412WalletActions(ERC7412_ADAPTERS));
    ```

    - Now, you can use the `publicClient` or `walletClient` as you normally would. The ERC-7412 integration will handle any necessary off-chain data retrieval.

3.  **Integrate with Ethers.js or other web3 library (Alternative):**

    - Currently, the ethers.js integration is under development. In the meantime, you can use the lower level functions directly.
    - For read calls, use `simulateWithOffchainData`.
    - For write calls, use `buildTransactionWithOffchainData` and then send the transaction.

    ```javascript
    // Example using ethers.js (manual handling)
    import { ethers } from 'ethers'
    import {
      simulateWithOffchainData,
      buildTransactionWithOffchainData
    } from 'erc7412'
    import { ERC7412_ADAPTERS } from './erc7412'

    async function readWithOffchainData(
      provider,
      transactions,
      abi,
      functionName
    ) {
      const { results } = await simulateWithOffchainData(
        provider,
        ERC7412_ADAPTERS,
        transactions
      )
      return ethers.utils.defaultAbiCoder.decode(abi, results[0])
    }

    async function writeWithOffchainData(provider, signer, transactions) {
      const transaction = await buildTransactionWithOffchainData(
        provider,
        ERC7412_ADAPTERS,
        transactions
      )
      return signer.sendTransaction(transaction)
    }
    ```

## Example Usage in Next.js Components

1.  **Import and Use the Client:**

    - Import the configured Viem client (or your Ethers.js functions) into your Next.js components.
    - Use the client to interact with your smart contracts.

    ```javascript
    // pages/index.js
    import { publicClient } from '../lib/viemClient'
    import { abi } from '../yourContractAbi' // Import your contract ABI

    async function fetchData() {
      const result = await publicClient.readContract({
        address: '0xYourContractAddress',
        abi: abi,
        functionName: 'yourFunction'
      })
      console.log(result)
    }

    // ... your component code ...
    ```

2.  **Handling Write Transactions:**

    - For write transactions, use the `walletClient` (if using Viem) or the `buildTransactionWithOffchainData` function (if using ethers.js).

## Troubleshooting

- **"Method not found: eth_simulateV1"**: Ensure your RPC provider supports `eth_simulateV1`. This feature is essential for ERC-7412.
- **Oracle Data Errors**: Double-check your oracle adapter configurations and ensure the oracle data is accessible.
- **Viem or Ethers.js Configuration**: Verify that your client is correctly configured and connected to the appropriate network.
- **ABI Errors**: Ensure that the ABI used to decode the data is correct.

By following these steps, you can effectively integrate ERC-7412 into your application, enabling your application to seamlessly handle smart contract interactions that require off-chain data.

# Integrate ERC-7412 into a Backend or Bot

Before starting, it is reccomended to read up on the actual [EIP-7412](https://eips.ethereum.org/EIPS/eip-7412) document in order to understand the basic flow of an ERC-7412 request.

The library is designed to be integratable into an existing project with minimal effort.

1. Install the ERC-7412 repo into your project (ex. for npm):

```
npm install --save erc7412
```

2. Install any oracles which your app may need to respond to (they are peer dependencies of erc7412 package). For example, for pyth:

```
npm install --save @pythnetwork/pyth-evm-js @pythnetwork/pyth-sdk-solidity
```

**NOTE:** Different peer libraries are required for different oracles. To find more information on which libraries to import, [see this table]().

3. Somewhere in your applications global constants, create an array of oracles:

```
const ERC7412_ADAPTERS = []
ERC7412_ADAPTERS.push(new PythAdapter('https://hermes.pyth.network/'))
// ... if you depend on more oracles, place them here
```

4. For any _read call_ which may require offchain data, use the `simulateWithOffchainData` function rather than calling

```
import { simulateWithOffchainData } from 'erc7412';

// build a list of transactions you want to execute. They should be in a prepared transaction format object:
// { to: string, data: string, value: number }
const { results } = await simulateWithOffchainData(provider, ERC7412_ADAPTERS, myTransactions);
const myAnswer = viem.decodeFunctionResult({ functionName: 'myFunc', data: results[0], abi: myContract.abi });
```

**NOTE:** This function can be passed any EIP-1151 compatible provider. So you can pass in an ethers.js provider, viem public client, raw web3, etc.

5. For any _write call_ which may require offchain data, use the `buildTransactionWithOffchainData` function and use `sendTransaction` with the result of that. _NOTE:_ by default this function assumes your contract supports trusted multicall forwarder contract deployed [here](https://usecannon.com/packages/trusted-multicall-forwarder/latest/1-with-oracle-manager). If not using trusted multicall forwarder, oyu may need to supply your own batching mechanism for executing the multicall.

```
import { buildTransactionWithOffchainData } from 'erc7412';

// build a list of transactions you want to execute. They should be in a prepared transaction format object:
// { to: string, data: string, value: number }
const { results } = await simulateWithOffchainData(provider, ERC7412_ADAPTERS, myTransactions);
const myAnswer = viem.decodeFunctionResult({ functionName: 'myFunc', data: results[0], abi: myContract.abi });
```

## Troubleshooting

### RPC returns "Method not found: eth_simulateV1"

The API you are using should support the [`eth_simulateV1`](https://github.com/ethereum/execution-apis/pull/484) call. This function is currently rolling out to bread use throughout the ecosystem, but it may take some more time for certain chains or projects.

## Special Integration for Viem

If you are using viem, it is possible to transparently wrap all of your calls with replacement [actions]() included in the erc7412 library. To use them:

1. Import the erc7412 viem integration:

```
import { createErc7412PublicActions } from 'erc7412/dist/src/integrations/viem';
```

2. Use the special [`extend`](https://viem.sh/docs/clients/custom#extending-with-actions-or-configuration) function to override the actions for your client. For example, if you have a public client, initialize it like this:

```
import * as viem from 'viem';
const publicClient = viem.createPublicClient({ ... });
publicClient.extend(createErc7412PublicActions(ERC7412_ADAPTERS));
```

Wallet client can be extended as well:

```
import * as viem from 'viem';
const walletClient = viem.createPublicClient({ ... });
walletClient.extend(createErc7412WalletActions(ERC7412_ADAPTERS));
```

3. Use the `publicClient` or `walletClient` as normal. Any calls that are modifiable which generate the `OracleDataRequired` error will be automatically wrapped using the pattern above.

### Special Integration for Ethers.js

TBC

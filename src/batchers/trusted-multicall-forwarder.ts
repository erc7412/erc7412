import { type Batcher, type TransactionRequest } from '../types'
import * as viem from 'viem'
import IERC2771Context from '../../out/IERC2771Context.sol/IERC2771Context.json'
import ITrustedMulticallForwarder from '../../out/ITrustedMulticallForwarder.sol/ITrustedMulticallForwarder.json'

const TRUSTED_MULTICALL_FORWARDER_ADDRESS: viem.Address = '0xE2C5658cC5C448B48141168f3e475dF8f65A1e3e'

export class TrustedMulticallForwarderBatcher<T extends unknown[]> implements Batcher<T> {
  isSupported: Map<viem.Address, boolean | undefined>

  readonly fromAddress: viem.Address

  constructor (from: viem.Address = viem.zeroAddress) {
    this.isSupported = new Map()
    this.fromAddress = from
  }

  async batchable (client: viem.PublicClient, transactions: TransactionRequest<T>): Promise<boolean> {
    for (const transaction of transactions) {
      const toAddress = (transaction as { to: viem.Address }).to ?? viem.zeroAddress // Should this default be set further up, or make sure it's set by now with stricter types?

      // Check if the address is already known
      if (this.isSupported.has(toAddress)) {
        // If it's known and not supported, return false
        if (!this.isSupported.get(toAddress)) {
          return false
        }
      } else {
        // If the address is not known, check its support status
        const supported = await this.checkSupport(client, toAddress)
        this.isSupported.set(toAddress, supported)

        // If not supported, return false
        if (!supported) {
          return false
        }
      }
    }

    // If all addresses are supported, return true
    return true
  }

  batch (transactions: TransactionRequest<T>): TransactionRequest<Array<{ to: viem.Address, data: viem.Hex, value: bigint }>>[0] {
    const totalValue = transactions.reduce((val: bigint, txn) => {
      return val + ((txn as { value: bigint }).value ?? BigInt(0))
    }, BigInt(0))

    return {
      to: TRUSTED_MULTICALL_FORWARDER_ADDRESS,
      value: totalValue,
      data: viem.encodeFunctionData({
        abi: ITrustedMulticallForwarder.abi,
        functionName: 'aggregate3Value',
        args: [
          transactions.map((txn) => {
            return {
              target: (txn as { to: viem.Address }).to ?? viem.zeroAddress,
              callData: (txn as { data: viem.Hex }).data ?? '0x',
              value: (txn as { value: bigint }).value ?? '0',
              requireSuccess: true
            }
          })
        ]
      })
    }
  }

  async checkSupport (client: viem.PublicClient, address: viem.Address): Promise<boolean> {
    const resp = await client.readContract({
      abi: IERC2771Context.abi,
      address,
      functionName: 'isTrustedForwarder',
      args: [TRUSTED_MULTICALL_FORWARDER_ADDRESS]
    })

    return resp as boolean
  }
}

import { type Batcher, type TransactionRequest } from '../types'
import * as viem from 'viem'
import ISmartAccount from '../../out/ISmartAccount.sol/ISmartAccount.json'

export class BiconomyBatcher<T extends unknown[]> implements Batcher<T> {
  isSupported: Map<viem.Address, boolean | undefined>

  readonly fromAddress: viem.Address

  constructor (from: viem.Address) {
    this.isSupported = new Map()
    this.fromAddress = from
  }

  async batchable (_client: viem.PublicClient, _transactions: TransactionRequest<T>): Promise<boolean> {
    // we can batch any transaction that is given to this adapter (its assumed the from address that was used to construct this is valid)
    return true
  }

  batch (transactions: TransactionRequest<T>): TransactionRequest<Array<{ to: viem.Address, data: viem.Hex, value: bigint }>>[0] {
    if (transactions.length < 1) {
      throw new Error('empty batch')
    }

    const totalValue = transactions.reduce((val: bigint, txn) => {
      return val + ((txn as { value: bigint }).value ?? BigInt(0))
    }, BigInt(0))

    // https://github.com/bcnmy/scw-contracts/blob/main/contracts/smart-account/SmartAccount.sol#L128C5-L134C6
    // https://docs.walletconnect.com/api/sign/smart-contract-wallet-usage#transactions
    return {
      // from: viem.zeroAddress, // unused in this context?
      to: (transactions[transactions.length - 1] as { to: viem.Address }).to, // `to` will be the RelayerManager contract address, per walletconnect docs?
      value: totalValue,
      data: viem.encodeFunctionData({
        abi: ISmartAccount.abi,
        functionName: 'executeBatch',
        args: [
          transactions.map((txn) => (txn as { to: viem.Address }).to ?? viem.zeroAddress),
          transactions.map((txn) => (txn as { value: bigint }).value ?? '0'),
          transactions.map((txn) => (txn as { data: viem.Hex }).data ?? '0x')
        ]
      })
    }
  }

  async checkSupport (client: viem.PublicClient, address: viem.Address): Promise<boolean> {
    // The ERC-165 implementation only shows support for 165 itself? https://github.com/bcnmy/scw-contracts/blob/main/contracts/smart-account/SmartAccount.sol#L211
    // Maybe we call the address and it works if we don't get a 0x error?
    try {
      await client.call({
        to: address,
        data: viem.encodeFunctionData({
          abi: ISmartAccount.abi,
          functionName: 'executeBatch',
          args: [[viem.zeroAddress], ['0'], ['0x']]
        })
      })
    } catch (e) {
      // TODO: Only return false if '0x error'?
      return false
    }
    return true
  }
}

import * as viem from 'viem';
import { sendCalls as actionSendCalls } from 'viem/actions';
import type { OracleAdapter, SendCallsWithOffchainDataParameters } from '../../types';
import { simulateWithOffchainData } from '../../read';
import { getAccount } from './actions-public';

export function createErc7412SendCalls(adapters: OracleAdapter[]) {
  return (client: viem.WalletClient) => ({
    async sendCalls(
      args: SendCallsWithOffchainDataParameters,
    ): Promise<viem.SendCallsReturnType> {
      const { includeOffchainData, ...rest } = args as any;

      if (!includeOffchainData) {
        // fall back to native behaviour
        return actionSendCalls(client, rest);
      }

      // 1. work out the prepend transactions
      const fromAddress = getAccount(rest.account);
      const { txns } = await simulateWithOffchainData(
        client,                  // provider
        adapters,                // our oracle adapters
        rest.calls,              // user-provided bundle
        fromAddress,             // sender
      );

      // 2. hand off to stock sendCalls
      return actionSendCalls(client, {
        ...rest,
        calls: txns,             // prepend + user calls
        forceAtomic: true,       // Enforce atomic execution
      });
    },
  });
} 
import * as viem from 'viem';
import { sendCalls as actionSendCalls } from 'viem/actions';
import type { Account } from 'viem';
import type { OracleAdapter, SendCallsWithOffchainDataParameters } from '../../types';
import { simulateWithOffchainData } from '../../read';
import { createErc7412SendCalls } from './actions-sendCalls';

jest.mock('../../read');
jest.mock('viem/actions', () => ({
  ...jest.requireActual('viem/actions'),
  sendCalls: jest.fn(),
}));

describe('createErc7412SendCalls', () => {
  const mockWalletClient = {
    account: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', type: 'json-rpc' } as Account,
    // Add any other properties or methods that your client might use
  } as unknown as viem.WalletClient;

  const fakeAdapters: OracleAdapter[] = [
    {
      getOracleId: () => 'FAKE_ORACLE',
      fetchOffchainData: jest.fn().mockResolvedValue([{ arg: '0x1234', fee: 100n }]),
    },
  ];

  const testCalls: viem.SendCallsParameters['calls'] = [
    { to: '0xanotherAddress', data: '0x5678', value: 1n },
  ];

  const walletClient = createErc7412SendCalls([])(mockWalletClient as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call original sendCalls when skipOffchainData is true', async () => {
    const mockArgs = {
      calls: [{ to: '0x123', data: '0x456' }],
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      skipOffchainData: true,
    } as SendCallsWithOffchainDataParameters;
    await walletClient.sendCalls(mockArgs);
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, { calls: mockArgs.calls, account: mockArgs.account });
  });

  it('should process offchain data and call sendCalls with new transactions when skipOffchainData is undefined', async () => {
    const mockArgs = {
      calls: [{ to: '0xoriginalCall', data: '0xabcdef' }],
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account used for fromAddress
      // skipOffchainData is undefined
    } as SendCallsWithOffchainDataParameters;

    const simulatedTxns = [{ to: '0xsimulatedTxn', data: '0x654321' }];
    (simulateWithOffchainData as jest.Mock).mockResolvedValueOnce({
      txns: simulatedTxns,
    });

    // walletClient is initialized with mockWalletClient and [] adapters
    await walletClient.sendCalls(mockArgs);

    expect(simulateWithOffchainData).toHaveBeenCalledWith(
      mockWalletClient,                // The client instance from walletClient
      [],                              // Adapters from walletClient (empty array)
      mockArgs.calls,                  // Original calls from the arguments
      mockArgs.account                   // fromAddress, derived from mockArgs.account
    );

    // Prepare the expected 'rest' arguments for actionSendCalls
    // It's mockArgs without skipOffchainData, with 'calls' updated, and 'forceAtomic' added.
    const expectedActionSendCallsArgs = {
      ...mockArgs, // Includes account and original calls
      calls: simulatedTxns, // Overwrite with simulated transactions
      forceAtomic: true,
    };
    // remove skipOffchainData if it was part of mockArgs (it's not in this specific case)
    delete (expectedActionSendCallsArgs as any).skipOffchainData;


    expect(actionSendCalls).toHaveBeenCalledWith(
      mockWalletClient,
      expectedActionSendCallsArgs
    );
  });

  it('should use simulateWithOffchainData and call sendCalls with new transactions when skipOffchainData is false', async () => {
    const mockProvider = {} as viem.Client;
    const mockAdapters = [{}] as OracleAdapter[];
    const mockValidAccountAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const mockArgs = {
      calls: [{ to: '0x123', data: '0x456' }],
      account: mockValidAccountAddress,
      skipOffchainData: false,
    } as SendCallsWithOffchainDataParameters;

    (simulateWithOffchainData as jest.Mock).mockResolvedValue({
      txns: [{ to: '0x123', data: '0x456' }],
    });

    const mockWalletClientWithAccount = {
      ...mockWalletClient,
      account: { address: mockValidAccountAddress, type: 'json-rpc' },
    } as unknown as viem.WalletClient;

    // Create client with mocked account
    const walletClientWithAccount = createErc7412SendCalls(mockAdapters)(mockWalletClientWithAccount as any);

    const mockArgsWithAccount = {
      calls: [{ to: '0x123', data: '0x456' }],
      account: mockWalletClientWithAccount.account,
      skipOffchainData: false,
    } as SendCallsWithOffchainDataParameters;

    (simulateWithOffchainData as jest.Mock).mockResolvedValue({
      txns: [{ to: '0x123', data: '0x456' }],
    });

    await walletClientWithAccount.sendCalls(mockArgsWithAccount);

    expect(simulateWithOffchainData).toHaveBeenCalledWith(
      mockWalletClientWithAccount,
      mockAdapters,
      mockArgsWithAccount.calls,
      mockWalletClientWithAccount.account!.address,
    );
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClientWithAccount, {
      account: mockWalletClientWithAccount.account,
      calls: [{ to: '0x123', data: '0x456' }],
      forceAtomic: true,
    });
  });

   it('should propagate the result from actionSendCalls', async () => {
    const mockReturnId = { id: 'test-batch-id' };
    (actionSendCalls as jest.Mock).mockResolvedValue(mockReturnId);

    const args: SendCallsWithOffchainDataParameters = {
      account: mockWalletClient.account!,
      calls: testCalls,
      skipOffchainData: true,
    };
    (simulateWithOffchainData as jest.Mock).mockResolvedValue({ txns: testCalls });

    const result = await walletClient.sendCalls(args);
    expect(result).toBe(mockReturnId);
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, { account: args.account, calls: args.calls });
  });
}); 
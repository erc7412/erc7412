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

  const sendCallsAction = createErc7412SendCalls(fakeAdapters)(mockWalletClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call original sendCalls when includeOffchainData is false', async () => {
    const args: SendCallsWithOffchainDataParameters = {
      account: mockWalletClient.account!,
      calls: testCalls,
      includeOffchainData: false,
    };
    await sendCallsAction.sendCalls(args);
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, { account: mockWalletClient.account, calls: testCalls });
    expect(simulateWithOffchainData).not.toHaveBeenCalled();
  });

  it('should call original sendCalls when includeOffchainData is undefined', async () => {
    const args: SendCallsWithOffchainDataParameters = {
        account: mockWalletClient.account!,
        calls: testCalls,
    };
    await sendCallsAction.sendCalls(args);
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, { account: mockWalletClient.account, calls: testCalls });
    expect(simulateWithOffchainData).not.toHaveBeenCalled();
  });

  it('should use simulateWithOffchainData and call sendCalls with new transactions when includeOffchainData is true', async () => {
    const simulatedTxns = [
      { to: '0xoracleAddress', data: '0xoracleData', value: 0n },
      ...testCalls,
    ];
    (simulateWithOffchainData as jest.Mock).mockResolvedValue({ txns: simulatedTxns });

    const args: SendCallsWithOffchainDataParameters = {
      account: mockWalletClient.account!,
      calls: testCalls,
      includeOffchainData: true,
    };
    await sendCallsAction.sendCalls(args);

    expect(simulateWithOffchainData).toHaveBeenCalledWith(
      mockWalletClient,
      fakeAdapters,
      testCalls,
      mockWalletClient.account!.address,
    );
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, {
      account: mockWalletClient.account,
      calls: simulatedTxns,
      forceAtomic: true,
    });
  });

   it('should propagate the result from actionSendCalls', async () => {
    const mockReturnId = { id: 'test-batch-id' };
    (actionSendCalls as jest.Mock).mockResolvedValue(mockReturnId);

    const args: SendCallsWithOffchainDataParameters = {
      account: mockWalletClient.account!,
      calls: testCalls,
      includeOffchainData: true,
    };
    (simulateWithOffchainData as jest.Mock).mockResolvedValue({ txns: testCalls }); // Ensure txns is defined

    const result = await sendCallsAction.sendCalls(args);
    expect(result).toBe(mockReturnId);
    expect(actionSendCalls).toHaveBeenCalledWith(mockWalletClient, expect.objectContaining({ forceAtomic: true }));
  });
}); 
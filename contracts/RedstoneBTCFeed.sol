// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {ERC7412RedstoneFeed} from './redstone-lib/ERC7412RedstoneFeed.sol';

contract RedstoneBTCFeed is ERC7412RedstoneFeed {

  bytes32 constant FEED_ID = bytes32("BTC");

  function getSingleDataFeedId() public override view virtual returns (bytes32) {
    return FEED_ID;  
  }

  function getTTL() internal override pure returns (uint256){
    return 3600;
  }
}
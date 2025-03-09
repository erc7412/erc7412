// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {IERC7412} from "../IERC7412.sol";
import {SinglePriceFeedAdapterV2} from "./SinglePriceFeedAdapterV2.flatten.sol";

contract ERC7412RedstoneFeed is IERC7412, SinglePriceFeedAdapterV2 {
    bytes32 constant ORACLE_ID = bytes32("REDSTONE");

    function oracleId() external pure returns (bytes32) {
        return ORACLE_ID;
    }

    function getLatestValue(bytes32 feedId, uint256 stalenessTolerance) external view returns (uint256) {
        uint256 latestAnswer = getValueForDataFeed(feedId);
        uint256 lastTimestamp = getBlockTimestampFromLatestUpdate();
        if (block.timestamp - lastTimestamp < stalenessTolerance) {
            return latestAnswer;
        }

        revert OracleDataRequired(address(this), abi.encode(feedId, getUniqueSignersThreshold(), getDataServiceId()), 0);
    }

    function fulfillOracleQuery(bytes calldata signedOffchainData) external payable {
        (bytes32[] memory feedIds, uint256 dataTimestamp) = abi.decode(signedOffchainData, (bytes32[], uint256));
        updateDataFeedsValues(feedIds, dataTimestamp);
    }

    function getDataServiceId() public view virtual override returns (string memory) {
        return "redstone-primary-prod";
    }

    function getUniqueSignersThreshold() public view virtual override returns (uint8) {
        return 3;
    }

    function getAuthorisedSigners() public pure returns (address[] memory) {
        address[] memory addrs = new address[](5);

        addrs[0] = 0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774;
        addrs[1] = 0xdEB22f54738d54976C4c0fe5ce6d408E40d88499;
        addrs[2] = 0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202;
        addrs[3] = 0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE;
        addrs[4] = 0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de;

        return addrs;
    }

    function getAuthorisedSignerIndex(address signerAddress) public view virtual override returns (uint8) {
        address[] memory authorizedSigners = getAuthorisedSigners();
        for (uint256 i = 0; i < authorizedSigners.length; i++) {
            if (signerAddress == authorizedSigners[i]) {
                return uint8(i);
            }
        }

        revert SignerNotAuthorised(signerAddress);
    }
}

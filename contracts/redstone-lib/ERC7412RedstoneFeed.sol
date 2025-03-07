// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {IERC7412} from "../IERC7412.sol";
import {SinglePriceFeedAdapterV2} from "./SinglePriceFeedAdapterV2.flatten.sol";

// TODO: review Jakub and Alex

abstract contract ERC7412RedstoneFeed is IERC7412, SinglePriceFeedAdapterV2 {
    bytes32 constant ORACLE_ID = bytes32("REDSTONE");

    function getTTL() internal view virtual returns (uint256);

    function oracleId() external pure returns (bytes32) {
        return ORACLE_ID;
    }

    // jak w price feed
    function getLatestValue() external view returns (uint256) {
        uint256 latestAnswer = getValueForDataFeed(getSingleDataFeedId());
        uint256 lastTimestamp = getBlockTimestampFromLatestUpdate();
        if (block.timestamp - lastTimestamp < getTTL()) {
            return latestAnswer;
        }

        revert OracleDataRequired(
            address(this), abi.encode(getSingleDataFeedId(), getUniqueSignersThreshold(), getDataServiceId()), 0
        );
    }

    function fulfillOracleQuery(bytes calldata signedOffchainData) external payable {
        (uint256 dataTimestamp) = abi.decode(signedOffchainData, (uint256));
        updateDataFeedsValues(dataTimestamp);
    }

    function getDataServiceId() public view virtual override returns (string memory) {
        return "redstone-primary-prod";
    }

    function getUniqueSignersThreshold() public view virtual override returns (uint8) {
        return 3;
    }

    function getAuthorizedSigners() public pure returns (address[] memory) {
        address[] memory addrs = new address[](5);

        addrs[0] = 0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774;
        addrs[1] = 0xdEB22f54738d54976C4c0fe5ce6d408E40d88499;
        addrs[2] = 0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202;
        addrs[3] = 0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE;
        addrs[4] = 0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de;

        return addrs;
    }

    function getAuthorisedSignerIndex(address signerAddress) public view virtual override returns (uint8) {
        if (signerAddress == 0x8BB8F32Df04c8b654987DAaeD53D6B6091e3B774) {
            return 0;
        } else if (signerAddress == 0xdEB22f54738d54976C4c0fe5ce6d408E40d88499) {
            return 1;
        } else if (signerAddress == 0x51Ce04Be4b3E32572C4Ec9135221d0691Ba7d202) {
            return 2;
        } else if (signerAddress == 0xDD682daEC5A90dD295d14DA4b0bec9281017b5bE) {
            return 3;
        } else if (signerAddress == 0x9c5AE89C4Af6aA32cE58588DBaF90d18a855B6de) {
            return 4;
        } else {
            revert SignerNotAuthorised(signerAddress);
        }
    }
}

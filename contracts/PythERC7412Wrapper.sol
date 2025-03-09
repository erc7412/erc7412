// SPDX-License-Identifier: MIT
pragma solidity >=0.8.11 <0.9.0;

import {PythStructs, IPyth} from "./IPyth.sol";
import {IERC7412} from "./IERC7412.sol";

/**
 * @title Benchmark price storage for a specific price id.
 */
library Price {
    struct Data {
        /**
         * @dev The price mapping for timestamps
         */
        mapping(uint64 => PythStructs.Price) benchmarkPrices;
    }

    function load(bytes32 priceId) internal pure returns (Data storage price) {
        bytes32 s = keccak256(abi.encode("io.pyth-erc7412-wrapper.price", priceId));
        assembly {
            price.slot := s
        }
    }
}

contract PythERC7412Wrapper is IERC7412 {
    event ForkBenchmarkPriceSet(bytes32 priceId, uint64 requestedTime, int256 newPrice, int32 expo);
    event ForkLatestPriceSet(bytes32 priceId, int256 newPrice);

    int256 private constant PRECISION = 18;

    error NotSupported(uint8 updateType);

    address public immutable pythAddress;

    // NOTE: this value is only settable on a fork
    mapping(bytes32 => int256) overridePrices;

    constructor(address _pythAddress) {
        pythAddress = _pythAddress;
    }

    function oracleId() external pure returns (bytes32) {
        return bytes32("PYTH");
    }

    function getBenchmarkPrice(bytes32 priceId, uint64 requestedTime) external view returns (int256) {
        PythStructs.Price memory priceData = Price.load(priceId).benchmarkPrices[requestedTime];

        if (priceData.price > 0) {
            return _getScaledPrice(priceData.price, priceData.expo);
        }

        revert OracleDataRequired(
            // solhint-disable-next-line numcast/safe-cast
            address(this),
            abi.encode(
                // solhint-disable-next-line numcast/safe-cast
                uint8(2), // PythQuery::Benchmark tag
                // solhint-disable-next-line numcast/safe-cast
                uint64(requestedTime),
                [priceId]
            ),
            0
        );
    }

    function getLatestPrice(bytes32 priceId, uint256 stalenessTolerance) external view returns (int256) {
        IPyth pyth = IPyth(pythAddress);
        PythStructs.Price memory pythData = pyth.getPriceUnsafe(priceId);

        if (block.timestamp <= stalenessTolerance + pythData.publishTime) {
            return _getScaledPrice(pythData.price, pythData.expo);
        }

        //price too stale
        revert OracleDataRequired(
            address(this),
            abi.encode(
                // solhint-disable-next-line numcast/safe-cast
                uint8(1),
                // solhint-disable-next-line numcast/safe-cast
                uint64(stalenessTolerance),
                [priceId]
            ),
            0
        );
    }

    function fulfillOracleQuery(bytes memory signedOffchainData) external payable {
        IPyth pyth = IPyth(pythAddress);

        uint8 updateType = abi.decode(signedOffchainData, (uint8));

        if (updateType == 1) {
            (
                ,
                ,
                ,
                /* uint8 _updateType */
                /*uint64 stalenessTolerance*/
                /* bytes32[] memory priceIds */
                bytes[] memory updateData
            ) = abi.decode(signedOffchainData, (uint8, uint64, bytes32[], bytes[]));

            try pyth.updatePriceFeeds{value: msg.value}(updateData) {}
            catch (bytes memory reason) {
                if (_isFeeRequired(reason)) {
                    revert FeeRequired(pyth.getUpdateFee(updateData));
                } else {
                    uint256 len = reason.length;
                    assembly {
                        revert(add(reason, 0x20), len)
                    }
                }
            }
        } else if (updateType == 2) {
            (
                ,
                /* uint8 _updateType */
                uint64 timestamp,
                bytes32[] memory priceIds,
                bytes[] memory updateData
            ) = abi.decode(signedOffchainData, (uint8, uint64, bytes32[], bytes[]));

            try pyth.parsePriceFeedUpdatesUnique{value: msg.value}(updateData, priceIds, timestamp, type(uint64).max)
            returns (PythStructs.PriceFeed[] memory priceFeeds) {
                for (uint256 i = 0; i < priceFeeds.length; i++) {
                    Price.load(priceIds[i]).benchmarkPrices[timestamp] = priceFeeds[i].price;
                }
            } catch (bytes memory reason) {
                if (_isFeeRequired(reason)) {
                    revert FeeRequired(pyth.getUpdateFee(updateData));
                } else {
                    uint256 len = reason.length;
                    assembly {
                        revert(add(reason, 0x20), len)
                    }
                }
            }
        } else {
            revert NotSupported(updateType);
        }
    }

    function _isFeeRequired(bytes memory reason) private pure returns (bool) {
        return reason.length == 4 && reason[0] == 0x02 && reason[1] == 0x5d && reason[2] == 0xbd && reason[3] == 0xd4;
    }

    /**
     * @dev Scales up a value.
     *
     * E.g. if value is not a decimal, a scale up by 18 makes it a low precision decimal.
     * If value is a low precision decimal, a scale up by 9 makes it a high precision decimal.
     */
    function _upscale(uint256 x, uint256 factor) internal pure returns (uint256) {
        return x * 10 ** factor;
    }

    /**
     * @dev Scales down a value.
     *
     * E.g. if value is a high precision decimal, a scale down by 9 makes it a low precision decimal.
     * If value is a low precision decimal, a scale down by 9 makes it a regular integer.
     *
     * Scaling down a regular integer would not make sense.
     */
    function _downscale(uint256 x, uint256 factor) internal pure returns (uint256) {
        return x / 10 ** factor;
    }

    /**
     * @dev gets scaled price. Borrowed from PythNode.sol.
     */
    function _getScaledPrice(int64 price, int32 expo) private pure returns (int256) {
        int256 factor = PRECISION + expo;
        return
            int256(factor > 0 ? _upscale(uint64(price), uint256(factor)) : _downscale(uint64(price), uint256(-factor)));
    }
}

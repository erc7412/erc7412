// SPDX-License-Identifier: MIT
pragma solidity >=0.8.11 <0.9.0;

import {IERC7412} from "./IERC7412.sol";
import {IWormhole} from "./wormhole/IWormhole.sol";
import "./wormhole/QueryResponse.sol";

contract WormholeERC7412Wrapper is IERC7412 {
    event CrossChainDataLoaded(uint256 indexed chainId, address indexed target, bytes data, bytes result);

    struct QueryData {
        uint256 chainId;
        address target;
        bytes data;
        uint256 asOfTimestamp;
    }

    struct QueryResult {
        uint256 recordedTimestamp;
        uint256 queryTimestamp;
        bytes result;
    }

    address public immutable wormholeAddress;

    mapping(bytes32 => QueryResult) crossChainData;

    constructor(address _wormholeAddress) {
        wormholeAddress = _wormholeAddress;
    }

    function oracleId() external pure returns (bytes32) {
        return bytes32("WORMHOLE");
    }

    function getCrossChainData(QueryData memory query, uint256 stalenessTolerance)
        external
        view
        returns (bytes memory)
    {
        QueryData[] memory queries = new QueryData[](1);
        queries[0] = query;
        return _getManyCrossChainData(queries, stalenessTolerance)[0];
    }

    function getManyCrossChainData(QueryData[] memory queries, uint256 stalenessTolerance)
        external
        view
        returns (bytes[] memory)
    {
        return _getManyCrossChainData(queries, stalenessTolerance);
    }

    function _getManyCrossChainData(QueryData[] memory queries, uint256 stalenessTolerance)
        internal
        view
        returns (bytes[] memory)
    {
        uint256 i;
        bytes[] memory results = new bytes[](queries.length);
        for (; i < queries.length; i++) {
            QueryResult storage queryResult = crossChainData[_getQueryHash(queries[i])];
            if (
                queryResult.recordedTimestamp != block.timestamp
                    || queryResult.queryTimestamp < block.timestamp - stalenessTolerance
            ) {
                revert OracleDataRequired(
                    // solhint-disable-next-line numcast/safe-cast
                    address(this),
                    abi.encode(queries),
                    0
                );
            }

            results[i] = queryResult.result;

            unchecked {
                ++i;
            }
        }

        return results;
    }

    function fulfillOracleQuery(bytes memory signedOffchainData) external payable {
        (bytes memory response, IWormhole.Signature[] memory signatures) =
            abi.decode(signedOffchainData, (bytes, IWormhole.Signature[]));

        // check with the verifier
        QueryResponse memory r = QueryResponseLib.parseAndVerifyQueryResponse(wormholeAddress, response, signatures);
        uint256 numResponses = r.responses.length;
        for (uint256 i = 0; i < numResponses;) {
            EthCallQueryResponse memory eqr = QueryResponseLib.parseEthCallQueryResponse(r.responses[i]);

            // record
            uint256 j;
            for (; j < eqr.results.length; j++) {
                EthCallRecord memory result = eqr.results[j];
                QueryResult storage queryResult = crossChainData[_getQueryHash(
                    QueryData(r.responses[i].chainId, result.contractAddress, result.callData, 0)
                )];
                queryResult.recordedTimestamp = block.timestamp;
                queryResult.queryTimestamp = eqr.blockTime;
                queryResult.result = result.result;

                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }
    }

    function _getQueryHash(QueryData memory query) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(query.chainId, query.target, query.data, query.asOfTimestamp));
    }
}

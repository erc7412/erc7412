// Sources flattened with hardhat v2.18.2 https://hardhat.org

// SPDX-License-Identifier: BUSL-1.1 AND MIT

// File @openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library AddressUpgradeable {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     *
     * Furthermore, `isContract` will also return true if the target contract within
     * the same transaction is already scheduled for destruction by `SELFDESTRUCT`,
     * which only has an effect at the end of a transaction.
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.0/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success,) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage)
        internal
        returns (bytes memory)
    {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage)
        internal
        returns (bytes memory)
    {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage)
        internal
        view
        returns (bytes memory)
    {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data, string memory errorMessage)
        internal
        returns (bytes memory)
    {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
     * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
     *
     * _Available since v4.8._
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                // only check isContract if the call was successful and the return data is empty
                // otherwise we already know that it was a contract
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason or using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(bool success, bytes memory returndata, string memory errorMessage)
        internal
        pure
        returns (bytes memory)
    {
        if (success) {
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}

// File @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (proxy/utils/Initializable.sol)

pragma solidity ^0.8.2;

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```solidity
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 *
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
    /**
     * @dev Indicates that the contract has been initialized.
     * @custom:oz-retyped-from bool
     */
    uint8 private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Triggered when the contract has been initialized or reinitialized.
     */
    event Initialized(uint8 version);

    /**
     * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
     * `onlyInitializing` functions can be used to initialize parent contracts.
     *
     * Similar to `reinitializer(1)`, except that functions marked with `initializer` can be nested in the context of a
     * constructor.
     *
     * Emits an {Initialized} event.
     */
    modifier initializer() {
        bool isTopLevelCall = !_initializing;
        require(
            (isTopLevelCall && _initialized < 1) || (!AddressUpgradeable.isContract(address(this)) && _initialized == 1),
            "Initializable: contract is already initialized"
        );
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
     * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
     * used to initialize parent contracts.
     *
     * A reinitializer may be used after the original initialization step. This is essential to configure modules that
     * are added through upgrades and that require initialization.
     *
     * When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
     * cannot be nested. If one is invoked in the context of another, execution will revert.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     *
     * WARNING: setting the version to 255 will prevent any future reinitialization.
     *
     * Emits an {Initialized} event.
     */
    modifier reinitializer(uint8 version) {
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     *
     * Emits an {Initialized} event the first time it is successfully executed.
     */
    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");
        if (_initialized != type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }

    /**
     * @dev Returns the highest version that has been initialized. See {reinitializer}.
     */
    function _getInitializedVersion() internal view returns (uint8) {
        return _initialized;
    }

    /**
     * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
     */
    function _isInitializing() internal view returns (bool) {
        return _initializing;
    }
}

// File @openzeppelin/contracts/utils/math/SafeMath.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/SafeMath.sol)

pragma solidity ^0.8.0;

// CAUTION
// This version of SafeMath should only be used with Solidity 0.8 or later,
// because it relies on the compiler's built in overflow checks.

/**
 * @dev Wrappers over Solidity's arithmetic operations.
 *
 * NOTE: `SafeMath` is generally not needed starting with Solidity 0.8, since the compiler
 * now has built in overflow checking.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.
     *
     * _Available since v3.4._
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.
     *
     * _Available since v3.4._
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {trySub}.
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting with custom message when dividing by zero.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryMod}.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}

// File @redstone-finance/evm-connector/contracts/core/RedstoneConstants.sol@v0.3.6

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.4;

/**
 * @title The base contract with helpful constants
 * @author The Redstone Oracles team
 * @dev It mainly contains redstone-related values, which improve readability
 * of other contracts (e.g. CalldataExtractor and RedstoneConsumerBase)
 */
contract RedstoneConstants {
    // === Abbreviations ===
    // BS - Bytes size
    // PTR - Pointer (memory location)
    // SIG - Signature

    // Solidity and YUL constants
    uint256 internal constant STANDARD_SLOT_BS = 32;
    uint256 internal constant FREE_MEMORY_PTR = 0x40;
    uint256 internal constant BYTES_ARR_LEN_VAR_BS = 32;
    uint256 internal constant FUNCTION_SIGNATURE_BS = 4;
    uint256 internal constant REVERT_MSG_OFFSET = 68; // Revert message structure described here: https://ethereum.stackexchange.com/a/66173/106364
    uint256 internal constant STRING_ERR_MESSAGE_MASK =
        0x08c379a000000000000000000000000000000000000000000000000000000000;

    // RedStone protocol consts
    uint256 internal constant SIG_BS = 65;
    uint256 internal constant TIMESTAMP_BS = 6;
    uint256 internal constant DATA_PACKAGES_COUNT_BS = 2;
    uint256 internal constant DATA_POINTS_COUNT_BS = 3;
    uint256 internal constant DATA_POINT_VALUE_BYTE_SIZE_BS = 4;
    uint256 internal constant DATA_POINT_SYMBOL_BS = 32;
    uint256 internal constant DEFAULT_DATA_POINT_VALUE_BS = 32;
    uint256 internal constant UNSIGNED_METADATA_BYTE_SIZE_BS = 3;
    uint256 internal constant REDSTONE_MARKER_BS = 9; // byte size of 0x000002ed57011e0000
    uint256 internal constant REDSTONE_MARKER_MASK = 0x0000000000000000000000000000000000000000000000000002ed57011e0000;

    // Derived values (based on consts)
    uint256 internal constant TIMESTAMP_NEGATIVE_OFFSET_IN_DATA_PACKAGE_WITH_STANDARD_SLOT_BS = 104; // SIG_BS + DATA_POINTS_COUNT_BS + DATA_POINT_VALUE_BYTE_SIZE_BS + STANDARD_SLOT_BS
    uint256 internal constant DATA_PACKAGE_WITHOUT_DATA_POINTS_BS = 78; // DATA_POINT_VALUE_BYTE_SIZE_BS + TIMESTAMP_BS + DATA_POINTS_COUNT_BS + SIG_BS
    uint256 internal constant DATA_PACKAGE_WITHOUT_DATA_POINTS_AND_SIG_BS = 13; // DATA_POINT_VALUE_BYTE_SIZE_BS + TIMESTAMP_BS + DATA_POINTS_COUNT_BS
    uint256 internal constant REDSTONE_MARKER_BS_PLUS_STANDARD_SLOT_BS = 41; // REDSTONE_MARKER_BS + STANDARD_SLOT_BS

    // Error messages
    error CalldataOverOrUnderFlow();
    error IncorrectUnsignedMetadataSize();
    error InsufficientNumberOfUniqueSigners(uint256 receivedSignersCount, uint256 requiredSignersCount);
    error EachSignerMustProvideTheSameValue();
    error EmptyCalldataPointersArr();
    error InvalidCalldataPointer();
    error CalldataMustHaveValidPayload();
    error SignerNotAuthorised(address receivedSigner);
}

// File @redstone-finance/evm-connector/contracts/core/CalldataExtractor.sol@v0.3.6

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.4;

/**
 * @title The base contract with the main logic of data extraction from calldata
 * @author The Redstone Oracles team
 * @dev This contract was created to reuse the same logic in the RedstoneConsumerBase
 * and the ProxyConnector contracts
 */
contract CalldataExtractor is RedstoneConstants {
    using SafeMath for uint256;

    error DataPackageTimestampMustNotBeZero();
    error DataPackageTimestampsMustBeEqual();
    error RedstonePayloadMustHaveAtLeastOneDataPackage();

    function extractTimestampsAndAssertAllAreEqual() public pure returns (uint256 extractedTimestamp) {
        uint256 calldataNegativeOffset = _extractByteSizeOfUnsignedMetadata();
        uint256 dataPackagesCount = _extractDataPackagesCountFromCalldata(calldataNegativeOffset);

        if (dataPackagesCount == 0) {
            revert RedstonePayloadMustHaveAtLeastOneDataPackage();
        }

        calldataNegativeOffset += DATA_PACKAGES_COUNT_BS;
        for (uint256 dataPackageIndex = 0; dataPackageIndex < dataPackagesCount; dataPackageIndex++) {
            uint256 dataPackageByteSize = _getDataPackageByteSize(calldataNegativeOffset);

            // Extracting timestamp for the current data package
            uint48 dataPackageTimestamp; // uint48, because timestamp uses 6 bytes
            uint256 timestampNegativeOffset =
                (calldataNegativeOffset + TIMESTAMP_NEGATIVE_OFFSET_IN_DATA_PACKAGE_WITH_STANDARD_SLOT_BS);
            uint256 timestampOffset = msg.data.length - timestampNegativeOffset;
            assembly {
                dataPackageTimestamp := calldataload(timestampOffset)
            }

            if (dataPackageTimestamp == 0) {
                revert DataPackageTimestampMustNotBeZero();
            }

            if (extractedTimestamp == 0) {
                extractedTimestamp = dataPackageTimestamp;
            } else if (dataPackageTimestamp != extractedTimestamp) {
                revert DataPackageTimestampsMustBeEqual();
            }

            calldataNegativeOffset += dataPackageByteSize;
        }
    }

    function _getDataPackageByteSize(uint256 calldataNegativeOffset) internal pure returns (uint256) {
        (uint256 dataPointsCount, uint256 eachDataPointValueByteSize) =
            _extractDataPointsDetailsForDataPackage(calldataNegativeOffset);

        return
            dataPointsCount * (DATA_POINT_SYMBOL_BS + eachDataPointValueByteSize) + DATA_PACKAGE_WITHOUT_DATA_POINTS_BS;
    }

    function _extractByteSizeOfUnsignedMetadata() internal pure returns (uint256) {
        // Checking if the calldata ends with the RedStone marker
        bool hasValidRedstoneMarker;
        assembly {
            let calldataLast32Bytes := calldataload(sub(calldatasize(), STANDARD_SLOT_BS))
            hasValidRedstoneMarker := eq(REDSTONE_MARKER_MASK, and(calldataLast32Bytes, REDSTONE_MARKER_MASK))
        }
        if (!hasValidRedstoneMarker) {
            revert CalldataMustHaveValidPayload();
        }

        // Using uint24, because unsigned metadata byte size number has 3 bytes
        uint24 unsignedMetadataByteSize;
        if (REDSTONE_MARKER_BS_PLUS_STANDARD_SLOT_BS > msg.data.length) {
            revert CalldataOverOrUnderFlow();
        }
        assembly {
            unsignedMetadataByteSize := calldataload(sub(calldatasize(), REDSTONE_MARKER_BS_PLUS_STANDARD_SLOT_BS))
        }
        uint256 calldataNegativeOffset = unsignedMetadataByteSize + UNSIGNED_METADATA_BYTE_SIZE_BS + REDSTONE_MARKER_BS;
        if (calldataNegativeOffset + DATA_PACKAGES_COUNT_BS > msg.data.length) {
            revert IncorrectUnsignedMetadataSize();
        }
        return calldataNegativeOffset;
    }

    // We return uint16, because unsigned metadata byte size number has 2 bytes
    function _extractDataPackagesCountFromCalldata(uint256 calldataNegativeOffset)
        internal
        pure
        returns (uint16 dataPackagesCount)
    {
        uint256 calldataNegativeOffsetWithStandardSlot = calldataNegativeOffset + STANDARD_SLOT_BS;
        if (calldataNegativeOffsetWithStandardSlot > msg.data.length) {
            revert CalldataOverOrUnderFlow();
        }
        assembly {
            dataPackagesCount := calldataload(sub(calldatasize(), calldataNegativeOffsetWithStandardSlot))
        }
        return dataPackagesCount;
    }

    function _extractDataPointValueAndDataFeedId(
        uint256 calldataNegativeOffsetForDataPackage,
        uint256 defaultDataPointValueByteSize,
        uint256 dataPointIndex
    ) internal pure virtual returns (bytes32 dataPointDataFeedId, uint256 dataPointValue) {
        uint256 negativeOffsetToDataPoints = calldataNegativeOffsetForDataPackage + DATA_PACKAGE_WITHOUT_DATA_POINTS_BS;
        uint256 dataPointNegativeOffset = negativeOffsetToDataPoints.add(
            (1 + dataPointIndex).mul((defaultDataPointValueByteSize + DATA_POINT_SYMBOL_BS))
        );
        uint256 dataPointCalldataOffset = msg.data.length.sub(dataPointNegativeOffset);
        assembly {
            dataPointDataFeedId := calldataload(dataPointCalldataOffset)
            dataPointValue := calldataload(add(dataPointCalldataOffset, DATA_POINT_SYMBOL_BS))
        }
    }

    function _extractDataPointsDetailsForDataPackage(uint256 calldataNegativeOffsetForDataPackage)
        internal
        pure
        returns (uint256 dataPointsCount, uint256 eachDataPointValueByteSize)
    {
        // Using uint24, because data points count byte size number has 3 bytes
        uint24 dataPointsCount_;

        // Using uint32, because data point value byte size has 4 bytes
        uint32 eachDataPointValueByteSize_;

        // Extract data points count
        uint256 negativeCalldataOffset = calldataNegativeOffsetForDataPackage + SIG_BS;
        uint256 calldataOffset = msg.data.length.sub(negativeCalldataOffset + STANDARD_SLOT_BS);
        assembly {
            dataPointsCount_ := calldataload(calldataOffset)
        }

        // Extract each data point value size
        calldataOffset = calldataOffset.sub(DATA_POINTS_COUNT_BS);
        assembly {
            eachDataPointValueByteSize_ := calldataload(calldataOffset)
        }

        // Prepare returned values
        dataPointsCount = dataPointsCount_;
        eachDataPointValueByteSize = eachDataPointValueByteSize_;
    }
}

// File @redstone-finance/evm-connector/contracts/libs/NumericArrayLib.sol@v0.3.6

// Original license: SPDX_License_Identifier: MIT

pragma solidity ^0.8.4;

library NumericArrayLib {
    // This function sort array in memory using bubble sort algorithm,
    // which performs even better than quick sort for small arrays

    uint256 constant BYTES_ARR_LEN_VAR_BS = 32;
    uint256 constant UINT256_VALUE_BS = 32;

    error CanNotPickMedianOfEmptyArray();

    // This function modifies the array
    function pickMedian(uint256[] memory arr) internal pure returns (uint256) {
        if (arr.length == 0) {
            revert CanNotPickMedianOfEmptyArray();
        }
        sort(arr);
        uint256 middleIndex = arr.length / 2;
        if (arr.length % 2 == 0) {
            uint256 sum = SafeMath.add(arr[middleIndex - 1], arr[middleIndex]);
            return sum / 2;
        } else {
            return arr[middleIndex];
        }
    }

    function sort(uint256[] memory arr) internal pure {
        assembly {
            let arrLength := mload(arr)
            let valuesPtr := add(arr, BYTES_ARR_LEN_VAR_BS)
            let endPtr := add(valuesPtr, mul(arrLength, UINT256_VALUE_BS))
            for { let arrIPtr := valuesPtr } lt(arrIPtr, endPtr) { arrIPtr := add(arrIPtr, UINT256_VALUE_BS) } {
                // arrIPtr += 32
                for { let arrJPtr := valuesPtr } lt(arrJPtr, arrIPtr) { arrJPtr := add(arrJPtr, UINT256_VALUE_BS) } {
                    // arrJPtr += 32
                    let arrI := mload(arrIPtr)
                    let arrJ := mload(arrJPtr)
                    if lt(arrI, arrJ) {
                        mstore(arrIPtr, arrJ)
                        mstore(arrJPtr, arrI)
                    }
                }
            }
        }
    }
}

// File @redstone-finance/evm-connector/contracts/core/RedstoneDefaultsLib.sol@v0.3.6

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.4;

/**
 * @title Default implementations of virtual redstone consumer base functions
 * @author The Redstone Oracles team
 */
library RedstoneDefaultsLib {
    uint256 constant DEFAULT_MAX_DATA_TIMESTAMP_DELAY_SECONDS = 3 minutes;
    uint256 constant DEFAULT_MAX_DATA_TIMESTAMP_AHEAD_SECONDS = 1 minutes;

    error TimestampFromTooLongFuture(uint256 receivedTimestampSeconds, uint256 blockTimestamp);
    error TimestampIsTooOld(uint256 receivedTimestampSeconds, uint256 blockTimestamp);

    function validateTimestamp(uint256 receivedTimestampMilliseconds) internal view {
        // Getting data timestamp from future seems quite unlikely
        // But we've already spent too much time with different cases
        // Where block.timestamp was less than dataPackage.timestamp.
        // Some blockchains may case this problem as well.
        // That's why we add MAX_BLOCK_TIMESTAMP_DELAY
        // and allow data "from future" but with a small delay
        uint256 receivedTimestampSeconds = receivedTimestampMilliseconds / 1000;

        if (block.timestamp < receivedTimestampSeconds) {
            if ((receivedTimestampSeconds - block.timestamp) > DEFAULT_MAX_DATA_TIMESTAMP_AHEAD_SECONDS) {
                revert TimestampFromTooLongFuture(receivedTimestampSeconds, block.timestamp);
            }
        } else if ((block.timestamp - receivedTimestampSeconds) > DEFAULT_MAX_DATA_TIMESTAMP_DELAY_SECONDS) {
            revert TimestampIsTooOld(receivedTimestampSeconds, block.timestamp);
        }
    }

    function aggregateValues(uint256[] memory values) internal pure returns (uint256) {
        return NumericArrayLib.pickMedian(values);
    }
}

// File @redstone-finance/evm-connector/contracts/libs/BitmapLib.sol@v0.3.6

// Original license: SPDX_License_Identifier: MIT

pragma solidity ^0.8.4;

library BitmapLib {
    function setBitInBitmap(uint256 bitmap, uint256 bitIndex) internal pure returns (uint256) {
        return bitmap | (1 << bitIndex);
    }

    function getBitFromBitmap(uint256 bitmap, uint256 bitIndex) internal pure returns (bool) {
        uint256 bitAtIndex = bitmap & (1 << bitIndex);
        return bitAtIndex > 0;
    }
}

// File @redstone-finance/evm-connector/contracts/libs/SignatureLib.sol@v0.3.6

// Original license: SPDX_License_Identifier: MIT

pragma solidity ^0.8.4;

library SignatureLib {
    uint256 constant ECDSA_SIG_R_BS = 32;
    uint256 constant ECDSA_SIG_S_BS = 32;

    function recoverSignerAddress(bytes32 signedHash, uint256 signatureCalldataNegativeOffset)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            let signatureCalldataStartPos := sub(calldatasize(), signatureCalldataNegativeOffset)
            r := calldataload(signatureCalldataStartPos)
            signatureCalldataStartPos := add(signatureCalldataStartPos, ECDSA_SIG_R_BS)
            s := calldataload(signatureCalldataStartPos)
            signatureCalldataStartPos := add(signatureCalldataStartPos, ECDSA_SIG_S_BS)
            v := byte(0, calldataload(signatureCalldataStartPos)) // last byte of the signature memory array
        }
        return ecrecover(signedHash, v, r, s);
    }
}

// File @redstone-finance/evm-connector/contracts/core/RedstoneConsumerBase.sol@v0.3.6

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.4;

/**
 * @title The base contract with the main Redstone logic
 * @author The Redstone Oracles team
 * @dev Do not use this contract directly in consumer contracts, take a
 * look at `RedstoneConsumerNumericBase` and `RedstoneConsumerBytesBase` instead
 */
abstract contract RedstoneConsumerBase is CalldataExtractor {
    using SafeMath for uint256;

    error GetDataServiceIdNotImplemented();

    /* ========== VIRTUAL FUNCTIONS (MAY BE OVERRIDDEN IN CHILD CONTRACTS) ========== */

    /**
     * @dev This function must be implemented by the child consumer contract.
     * It should return dataServiceId which DataServiceWrapper will use if not provided explicitly .
     * If not overridden, value will always have to be provided explicitly in DataServiceWrapper.
     * @return dataServiceId being consumed by contract
     */
    function getDataServiceId() public view virtual returns (string memory) {
        revert GetDataServiceIdNotImplemented();
    }

    /**
     * @dev This function must be implemented by the child consumer contract.
     * It should return a unique index for a given signer address if the signer
     * is authorised, otherwise it should revert
     * @param receivedSigner The address of a signer, recovered from ECDSA signature
     * @return Unique index for a signer in the range [0..255]
     */
    function getAuthorisedSignerIndex(address receivedSigner) public view virtual returns (uint8);

    /**
     * @dev This function may be overridden by the child consumer contract.
     * It should validate the timestamp against the current time (block.timestamp)
     * It should revert with a helpful message if the timestamp is not valid
     * @param receivedTimestampMilliseconds Timestamp extracted from calldata
     */
    function validateTimestamp(uint256 receivedTimestampMilliseconds) public view virtual {
        RedstoneDefaultsLib.validateTimestamp(receivedTimestampMilliseconds);
    }

    /**
     * @dev This function should be overridden by the child consumer contract.
     * @return The minimum required value of unique authorised signers
     */
    function getUniqueSignersThreshold() public view virtual returns (uint8) {
        return 1;
    }

    /**
     * @dev This function may be overridden by the child consumer contract.
     * It should aggregate values from different signers to a single uint value.
     * By default, it calculates the median value
     * @param values An array of uint256 values from different signers
     * @return Result of the aggregation in the form of a single number
     */
    function aggregateValues(uint256[] memory values) public view virtual returns (uint256) {
        return RedstoneDefaultsLib.aggregateValues(values);
    }

    /* ========== FUNCTIONS WITH IMPLEMENTATION (CAN NOT BE OVERRIDDEN) ========== */

    /**
     * @dev This is an internal helpful function for secure extraction oracle values
     * from the tx calldata. Security is achieved by signatures verification, timestamp
     * validation, and aggregating values from different authorised signers into a
     * single numeric value. If any of the required conditions (e.g. too old timestamp or
     * insufficient number of authorised signers) do not match, the function will revert.
     *
     * Note! You should not call this function in a consumer contract. You can use
     * `getOracleNumericValuesFromTxMsg` or `getOracleNumericValueFromTxMsg` instead.
     *
     * @param dataFeedIds An array of unique data feed identifiers
     * @return An array of the extracted and verified oracle values in the same order
     * as they are requested in dataFeedIds array
     */
    function _securelyExtractOracleValuesFromTxMsg(bytes32[] memory dataFeedIds)
        internal
        view
        returns (uint256[] memory)
    {
        // Initializing helpful variables and allocating memory
        uint256[] memory uniqueSignerCountForDataFeedIds = new uint256[](dataFeedIds.length);
        uint256[] memory signersBitmapForDataFeedIds = new uint256[](dataFeedIds.length);
        uint256[][] memory valuesForDataFeeds = new uint256[][](dataFeedIds.length);
        for (uint256 i = 0; i < dataFeedIds.length; i++) {
            // The line below is commented because newly allocated arrays are filled with zeros
            // But we left it for better readability
            // signersBitmapForDataFeedIds[i] = 0; // <- setting to an empty bitmap
            valuesForDataFeeds[i] = new uint256[](getUniqueSignersThreshold());
        }

        // Extracting the number of data packages from calldata
        uint256 calldataNegativeOffset = _extractByteSizeOfUnsignedMetadata();
        uint256 dataPackagesCount = _extractDataPackagesCountFromCalldata(calldataNegativeOffset);
        calldataNegativeOffset += DATA_PACKAGES_COUNT_BS;

        // Saving current free memory pointer
        uint256 freeMemPtr;
        assembly {
            freeMemPtr := mload(FREE_MEMORY_PTR)
        }

        // Data packages extraction in a loop
        for (uint256 dataPackageIndex = 0; dataPackageIndex < dataPackagesCount; dataPackageIndex++) {
            // Extract data package details and update calldata offset
            uint256 dataPackageByteSize = _extractDataPackage(
                dataFeedIds,
                uniqueSignerCountForDataFeedIds,
                signersBitmapForDataFeedIds,
                valuesForDataFeeds,
                calldataNegativeOffset
            );
            calldataNegativeOffset += dataPackageByteSize;

            // Shifting memory pointer back to the "safe" value
            assembly {
                mstore(FREE_MEMORY_PTR, freeMemPtr)
            }
        }

        // Validating numbers of unique signers and calculating aggregated values for each dataFeedId
        return _getAggregatedValues(valuesForDataFeeds, uniqueSignerCountForDataFeedIds);
    }

    /**
     * @dev This is a private helpful function, which extracts data for a data package based
     * on the given negative calldata offset, verifies them, and in the case of successful
     * verification updates the corresponding data package values in memory
     *
     * @param dataFeedIds an array of unique data feed identifiers
     * @param uniqueSignerCountForDataFeedIds an array with the numbers of unique signers
     * for each data feed
     * @param signersBitmapForDataFeedIds an array of signer bitmaps for data feeds
     * @param valuesForDataFeeds 2-dimensional array, valuesForDataFeeds[i][j] contains
     * j-th value for the i-th data feed
     * @param calldataNegativeOffset negative calldata offset for the given data package
     *
     * @return An array of the aggregated values
     */
    function _extractDataPackage(
        bytes32[] memory dataFeedIds,
        uint256[] memory uniqueSignerCountForDataFeedIds,
        uint256[] memory signersBitmapForDataFeedIds,
        uint256[][] memory valuesForDataFeeds,
        uint256 calldataNegativeOffset
    ) private view returns (uint256) {
        uint256 signerIndex;

        (uint256 dataPointsCount, uint256 eachDataPointValueByteSize) =
            _extractDataPointsDetailsForDataPackage(calldataNegativeOffset);

        // We use scopes to resolve problem with too deep stack
        {
            uint48 extractedTimestamp;
            address signerAddress;
            bytes32 signedHash;
            bytes memory signedMessage;
            uint256 signedMessageBytesCount;

            signedMessageBytesCount = dataPointsCount.mul(eachDataPointValueByteSize + DATA_POINT_SYMBOL_BS)
                + DATA_PACKAGE_WITHOUT_DATA_POINTS_AND_SIG_BS; //DATA_POINT_VALUE_BYTE_SIZE_BS + TIMESTAMP_BS + DATA_POINTS_COUNT_BS

            uint256 timestampCalldataOffset = msg.data.length.sub(
                calldataNegativeOffset + TIMESTAMP_NEGATIVE_OFFSET_IN_DATA_PACKAGE_WITH_STANDARD_SLOT_BS
            );

            uint256 signedMessageCalldataOffset =
                msg.data.length.sub(calldataNegativeOffset + SIG_BS + signedMessageBytesCount);

            assembly {
                // Extracting the signed message
                signedMessage := extractBytesFromCalldata(signedMessageCalldataOffset, signedMessageBytesCount)

                // Hashing the signed message
                signedHash := keccak256(add(signedMessage, BYTES_ARR_LEN_VAR_BS), signedMessageBytesCount)

                // Extracting timestamp
                extractedTimestamp := calldataload(timestampCalldataOffset)

                function initByteArray(bytesCount) -> ptr {
                    ptr := mload(FREE_MEMORY_PTR)
                    mstore(ptr, bytesCount)
                    ptr := add(ptr, BYTES_ARR_LEN_VAR_BS)
                    mstore(FREE_MEMORY_PTR, add(ptr, bytesCount))
                }

                function extractBytesFromCalldata(offset, bytesCount) -> extractedBytes {
                    let extractedBytesStartPtr := initByteArray(bytesCount)
                    calldatacopy(extractedBytesStartPtr, offset, bytesCount)
                    extractedBytes := sub(extractedBytesStartPtr, BYTES_ARR_LEN_VAR_BS)
                }
            }

            // Validating timestamp
            validateTimestamp(extractedTimestamp);

            // Verifying the off-chain signature against on-chain hashed data
            signerAddress = SignatureLib.recoverSignerAddress(signedHash, calldataNegativeOffset + SIG_BS);
            signerIndex = getAuthorisedSignerIndex(signerAddress);
        }

        // Updating helpful arrays
        {
            bytes32 dataPointDataFeedId;
            uint256 dataPointValue;
            for (uint256 dataPointIndex = 0; dataPointIndex < dataPointsCount; dataPointIndex++) {
                // Extracting data feed id and value for the current data point
                (dataPointDataFeedId, dataPointValue) = _extractDataPointValueAndDataFeedId(
                    calldataNegativeOffset, eachDataPointValueByteSize, dataPointIndex
                );

                for (uint256 dataFeedIdIndex = 0; dataFeedIdIndex < dataFeedIds.length; dataFeedIdIndex++) {
                    if (dataPointDataFeedId == dataFeedIds[dataFeedIdIndex]) {
                        uint256 bitmapSignersForDataFeedId = signersBitmapForDataFeedIds[dataFeedIdIndex];

                        if (
                            !BitmapLib.getBitFromBitmap(bitmapSignersForDataFeedId, signerIndex) /* current signer was not counted for current dataFeedId */
                                && uniqueSignerCountForDataFeedIds[dataFeedIdIndex] < getUniqueSignersThreshold()
                        ) {
                            // Increase unique signer counter
                            uniqueSignerCountForDataFeedIds[dataFeedIdIndex]++;

                            // Add new value
                            valuesForDataFeeds[dataFeedIdIndex][uniqueSignerCountForDataFeedIds[dataFeedIdIndex] - 1] =
                                dataPointValue;

                            // Update signers bitmap
                            signersBitmapForDataFeedIds[dataFeedIdIndex] =
                                BitmapLib.setBitInBitmap(bitmapSignersForDataFeedId, signerIndex);
                        }

                        // Breaking, as there couldn't be several indexes for the same feed ID
                        break;
                    }
                }
            }
        }

        // Return total data package byte size
        return
            DATA_PACKAGE_WITHOUT_DATA_POINTS_BS + (eachDataPointValueByteSize + DATA_POINT_SYMBOL_BS) * dataPointsCount;
    }

    /**
     * @dev This is a private helpful function, which aggregates values from different
     * authorised signers for the given arrays of values for each data feed
     *
     * @param valuesForDataFeeds 2-dimensional array, valuesForDataFeeds[i][j] contains
     * j-th value for the i-th data feed
     * @param uniqueSignerCountForDataFeedIds an array with the numbers of unique signers
     * for each data feed
     *
     * @return An array of the aggregated values
     */
    function _getAggregatedValues(
        uint256[][] memory valuesForDataFeeds,
        uint256[] memory uniqueSignerCountForDataFeedIds
    ) private view returns (uint256[] memory) {
        uint256[] memory aggregatedValues = new uint256[](valuesForDataFeeds.length);
        uint256 uniqueSignersThreshold = getUniqueSignersThreshold();

        for (uint256 dataFeedIndex = 0; dataFeedIndex < valuesForDataFeeds.length; dataFeedIndex++) {
            if (uniqueSignerCountForDataFeedIds[dataFeedIndex] < uniqueSignersThreshold) {
                revert InsufficientNumberOfUniqueSigners(
                    uniqueSignerCountForDataFeedIds[dataFeedIndex], uniqueSignersThreshold
                );
            }
            uint256 aggregatedValueForDataFeedId = aggregateValues(valuesForDataFeeds[dataFeedIndex]);
            aggregatedValues[dataFeedIndex] = aggregatedValueForDataFeedId;
        }

        return aggregatedValues;
    }
}

// File @redstone-finance/evm-connector/contracts/core/RedstoneConsumerNumericBase.sol@v0.3.6

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.4;

/**
 * @title The base contract for Redstone consumers' contracts that allows to
 * securely calculate numeric redstone oracle values
 * @author The Redstone Oracles team
 * @dev This contract can extend other contracts to allow them
 * securely fetch Redstone oracle data from transactions calldata
 */
abstract contract RedstoneConsumerNumericBase is RedstoneConsumerBase {
    /**
     * @dev This function can be used in a consumer contract to securely extract an
     * oracle value for a given data feed id. Security is achieved by
     * signatures verification, timestamp validation, and aggregating values
     * from different authorised signers into a single numeric value. If any of the
     * required conditions do not match, the function will revert.
     * Note! This function expects that tx calldata contains redstone payload in the end
     * Learn more about redstone payload here: https://github.com/redstone-finance/redstone-oracles-monorepo/tree/main/packages/evm-connector#readme
     * @param dataFeedId bytes32 value that uniquely identifies the data feed
     * @return Extracted and verified numeric oracle value for the given data feed id
     */
    function getOracleNumericValueFromTxMsg(bytes32 dataFeedId) internal view virtual returns (uint256) {
        bytes32[] memory dataFeedIds = new bytes32[](1);
        dataFeedIds[0] = dataFeedId;
        return getOracleNumericValuesFromTxMsg(dataFeedIds)[0];
    }

    /**
     * @dev This function can be used in a consumer contract to securely extract several
     * numeric oracle values for a given array of data feed ids. Security is achieved by
     * signatures verification, timestamp validation, and aggregating values
     * from different authorised signers into a single numeric value. If any of the
     * required conditions do not match, the function will revert.
     * Note! This function expects that tx calldata contains redstone payload in the end
     * Learn more about redstone payload here: https://github.com/redstone-finance/redstone-oracles-monorepo/tree/main/packages/evm-connector#readme
     * @param dataFeedIds An array of unique data feed identifiers
     * @return An array of the extracted and verified oracle values in the same order
     * as they are requested in the dataFeedIds array
     */
    function getOracleNumericValuesFromTxMsg(bytes32[] memory dataFeedIds)
        internal
        view
        virtual
        returns (uint256[] memory)
    {
        return _securelyExtractOracleValuesFromTxMsg(dataFeedIds);
    }

    /**
     * @dev This function works similarly to the `getOracleNumericValuesFromTxMsg` with the
     * only difference that it allows to request oracle data for an array of data feeds
     * that may contain duplicates
     *
     * @param dataFeedIdsWithDuplicates An array of data feed identifiers (duplicates are allowed)
     * @return An array of the extracted and verified oracle values in the same order
     * as they are requested in the dataFeedIdsWithDuplicates array
     */
    function getOracleNumericValuesWithDuplicatesFromTxMsg(bytes32[] memory dataFeedIdsWithDuplicates)
        internal
        view
        returns (uint256[] memory)
    {
        // Building an array without duplicates
        bytes32[] memory dataFeedIdsWithoutDuplicates = new bytes32[](dataFeedIdsWithDuplicates.length);
        bool alreadyIncluded;
        uint256 uniqueDataFeedIdsCount = 0;

        for (uint256 indexWithDup = 0; indexWithDup < dataFeedIdsWithDuplicates.length; indexWithDup++) {
            // Checking if current element is already included in `dataFeedIdsWithoutDuplicates`
            alreadyIncluded = false;
            for (uint256 indexWithoutDup = 0; indexWithoutDup < uniqueDataFeedIdsCount; indexWithoutDup++) {
                if (dataFeedIdsWithoutDuplicates[indexWithoutDup] == dataFeedIdsWithDuplicates[indexWithDup]) {
                    alreadyIncluded = true;
                    break;
                }
            }

            // Adding if not included
            if (!alreadyIncluded) {
                dataFeedIdsWithoutDuplicates[uniqueDataFeedIdsCount] = dataFeedIdsWithDuplicates[indexWithDup];
                uniqueDataFeedIdsCount++;
            }
        }

        // Overriding dataFeedIdsWithoutDuplicates.length
        // Equivalent to: dataFeedIdsWithoutDuplicates.length = uniqueDataFeedIdsCount;
        assembly {
            mstore(dataFeedIdsWithoutDuplicates, uniqueDataFeedIdsCount)
        }

        // Requesting oracle values (without duplicates)
        uint256[] memory valuesWithoutDuplicates = getOracleNumericValuesFromTxMsg(dataFeedIdsWithoutDuplicates);

        // Preparing result values array
        uint256[] memory valuesWithDuplicates = new uint256[](dataFeedIdsWithDuplicates.length);
        for (uint256 indexWithDup = 0; indexWithDup < dataFeedIdsWithDuplicates.length; indexWithDup++) {
            for (uint256 indexWithoutDup = 0; indexWithoutDup < dataFeedIdsWithoutDuplicates.length; indexWithoutDup++)
            {
                if (dataFeedIdsWithDuplicates[indexWithDup] == dataFeedIdsWithoutDuplicates[indexWithoutDup]) {
                    valuesWithDuplicates[indexWithDup] = valuesWithoutDuplicates[indexWithoutDup];
                    break;
                }
            }
        }

        return valuesWithDuplicates;
    }
}

// File contracts/core/IRedstoneAdapter.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.14;

/**
 * @title Interface of RedStone adapter
 * @author The Redstone Oracles team
 */
interface IRedstoneAdapter {
    /**
     * @notice Updates values of all data feeds supported by the Adapter contract
     * @dev This function requires an attached redstone payload to the transaction calldata.
     * It also requires each data package to have exactly the same timestamp
     * @param dataPackagesTimestamp Timestamp of each signed data package in the redstone payload
     */
    function updateDataFeedsValues(bytes32[] memory feedIds, uint256 dataPackagesTimestamp) external;

    /**
     * @notice Returns the latest properly reported value of the data feed
     * @param dataFeedId The identifier of the requested data feed
     * @return value The latest value of the given data feed
     */
    function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256);

    /**
     * @notice Returns the latest properly reported values for several data feeds
     * @param requestedDataFeedIds The array of identifiers for the requested feeds
     * @return values Values of the requested data feeds in the corresponding order
     */
    function getValuesForDataFeeds(bytes32[] memory requestedDataFeedIds) external view returns (uint256[] memory);

    /**
     * @notice Returns data timestamp from the latest update
     * @dev It's virtual, because its implementation can sometimes be different
     * (e.g. SinglePriceFeedAdapterWithClearing)
     * @return lastDataTimestamp Timestamp of the latest reported data packages
     */
    function getDataTimestampFromLatestUpdate() external view returns (uint256 lastDataTimestamp);

    /**
     * @notice Returns block timestamp of the latest successful update
     * @return blockTimestamp The block timestamp of the latest successful update
     */
    function getBlockTimestampFromLatestUpdate() external view returns (uint256 blockTimestamp);

    /**
     * @notice Returns timestamps of the latest successful update
     * @return dataTimestamp timestamp (usually in milliseconds) from the signed data packages
     * @return blockTimestamp timestamp of the block when the update has happened
     */
    function getTimestampsFromLatestUpdate() external view returns (uint128 dataTimestamp, uint128 blockTimestamp);

    /**
     * @notice Returns minimal required interval (usually in seconds) between subsequent updates
     * @return interval The required interval between updates
     */
    function getMinIntervalBetweenUpdates() external view returns (uint256);

    /**
     * @notice Reverts if the proposed timestamp of data packages it too old or too new
     * comparing to the block.timestamp. It also ensures that the proposed timestamp is newer
     * Then the one from the previous update
     * @param dataPackagesTimestamp The proposed timestamp (usually in milliseconds)
     */
    function validateProposedDataPackagesTimestamp(uint256 dataPackagesTimestamp) external view;

    /**
     * @notice Reverts if the updater is not authorised
     * @dev This function should revert if msg.sender is not allowed to update data feed values
     * @param updater The address of the proposed updater
     */
    function requireAuthorisedUpdater(address updater) external view;
}

// File contracts/core/RedstoneAdapterBase.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.14;

/**
 * @title Core logic of Redstone Adapter Contract
 * @author The Redstone Oracles team
 * @dev This contract is used to repeatedly push Redstone data to blockchain storage
 * More details here: https://docs.redstone.finance/docs/smart-contract-devs/get-started/redstone-classic
 *
 * Key details about the contract:
 * - Values for data feeds can be updated using the `updateDataFeedsValues` function
 * - All data feeds must be updated within a single call, partial updates are not allowed
 * - There is a configurable minimum interval between updates
 * - Updaters can be restricted by overriding `requireAuthorisedUpdater` function
 * - The contract is designed to force values validation, by default it prevents returning zero values
 * - All data packages in redstone payload must have the same timestamp,
 *    equal to `dataPackagesTimestamp` argument of the `updateDataFeedsValues` function
 * - Block timestamp abstraction - even though we call it blockTimestamp in many places,
 *    it's possible to have a custom logic here, e.g. use block number instead of a timestamp
 */
abstract contract RedstoneAdapterBase is RedstoneConsumerNumericBase, IRedstoneAdapter {
    // We don't use storage variables to avoid potential problems with upgradable contracts
    bytes32 internal constant LATEST_UPDATE_TIMESTAMPS_STORAGE_LOCATION =
        0x3d01e4d77237ea0f771f1786da4d4ff757fcba6a92933aa53b1dcef2d6bd6fe2; // keccak256("RedStone.lastUpdateTimestamp");
    uint256 internal constant MIN_INTERVAL_BETWEEN_UPDATES = 3 seconds;
    uint256 internal constant BITS_COUNT_IN_16_BYTES = 128;
    uint256 internal constant MAX_NUMBER_FOR_128_BITS =
        0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff;

    error DataTimestampShouldBeNewerThanBefore(
        uint256 receivedDataTimestampMilliseconds, uint256 lastDataTimestampMilliseconds
    );

    error MinIntervalBetweenUpdatesHasNotPassedYet(
        uint256 currentBlockTimestamp, uint256 lastUpdateTimestamp, uint256 minIntervalBetweenUpdates
    );

    error DataPackageTimestampMismatch(uint256 expectedDataTimestamp, uint256 dataPackageTimestamp);

    error DataFeedValueCannotBeZero(bytes32 dataFeedId);

    error DataFeedIdNotFound(bytes32 dataFeedId);

    error DataTimestampIsTooBig(uint256 dataTimestamp);

    error BlockTimestampIsTooBig(uint256 blockTimestamp);

    /**
     * @notice Reverts if the updater is not authorised
     * @dev This function should revert if msg.sender is not allowed to update data feed values
     * @param updater The address of the proposed updater
     */
    function requireAuthorisedUpdater(address updater) public view virtual {
        // By default, anyone can update data feed values, but it can be overridden
    }

    /**
     * @dev Note! This function is not called directly, it's called for each data package    .
     * in redstone payload and just verifies if each data package has the same timestamp
     * as the one that was saved in the storage
     * @param receivedTimestampMilliseconds Timestamp from a data package
     */
    function validateTimestamp(uint256 receivedTimestampMilliseconds) public view virtual override {
        // It means that we are in the special view context and we can skip validation of the
        // timestamp. It can be useful for calling view functions, as they can not modify the contract
        // state to pass the timestamp validation below
        if (msg.sender == address(0)) {
            return;
        }

        uint256 expectedDataPackageTimestamp = getDataTimestampFromLatestUpdate();
        if (receivedTimestampMilliseconds != expectedDataPackageTimestamp) {
            revert DataPackageTimestampMismatch(expectedDataPackageTimestamp, receivedTimestampMilliseconds);
        }
    }

    function updateDataFeedsValues(bytes32[] memory feedIds, uint256 dataPackagesTimestamp) public {
        requireAuthorisedUpdater(msg.sender);
        _assertMinIntervalBetweenUpdatesPassed();
        validateProposedDataPackagesTimestamp(dataPackagesTimestamp);
        _saveTimestampsOfCurrentUpdate(dataPackagesTimestamp);

        // It will trigger timestamp validation for each data package
        uint256[] memory oracleValues = getOracleNumericValuesFromTxMsg(feedIds);

        _validateAndUpdateDataFeedsValues(feedIds, oracleValues);
    }

    /**
     * @dev This function should be implemented by the actual contract
     * and should contain the logic of values validation and reporting.
     * Usually, values reporting is based on saving them to the contract storage,
     * e.g. in PriceFeedsAdapter, but some custom implementations (e.g. GMX keeper adapter
     * or Mento Sorted Oracles adapter) may handle values updating in a different way
     * @param dataFeedIdsArray Array of the data feeds identifiers (it will always be all data feed ids)
     * @param values The reported values that should be validated and reported
     */
    function _validateAndUpdateDataFeedsValues(bytes32[] memory dataFeedIdsArray, uint256[] memory values)
        internal
        virtual;

    /**
     * @dev This function reverts if not enough time passed since the latest update
     */
    function _assertMinIntervalBetweenUpdatesPassed() private view {
        uint256 currentBlockTimestamp = getBlockTimestamp();
        uint256 blockTimestampFromLatestUpdate = getBlockTimestampFromLatestUpdate();
        uint256 minIntervalBetweenUpdates = getMinIntervalBetweenUpdates();
        if (currentBlockTimestamp < blockTimestampFromLatestUpdate + minIntervalBetweenUpdates) {
            revert MinIntervalBetweenUpdatesHasNotPassedYet(
                currentBlockTimestamp, blockTimestampFromLatestUpdate, minIntervalBetweenUpdates
            );
        }
    }

    /**
     * @notice Returns minimal required interval (usually in seconds) between subsequent updates
     * @dev You can override this function to change the required interval between udpates.
     * Please do not set it to 0, as it may open many attack vectors
     * @return interval The required interval between updates
     */
    function getMinIntervalBetweenUpdates() public view virtual returns (uint256) {
        return MIN_INTERVAL_BETWEEN_UPDATES;
    }

    /**
     * @notice Reverts if the proposed timestamp of data packages it too old or too new
     * comparing to the block.timestamp. It also ensures that the proposed timestamp is newer
     * Then the one from the previous update
     * @param dataPackagesTimestamp The proposed timestamp (usually in milliseconds)
     */
    function validateProposedDataPackagesTimestamp(uint256 dataPackagesTimestamp) public view {
        _preventUpdateWithOlderDataPackages(dataPackagesTimestamp);
        validateDataPackagesTimestampOnce(dataPackagesTimestamp);
    }

    /**
     * @notice Reverts if the proposed timestamp of data packages it too old or too new
     * comparing to the current block timestamp
     * @param dataPackagesTimestamp The proposed timestamp (usually in milliseconds)
     */
    function validateDataPackagesTimestampOnce(uint256 dataPackagesTimestamp) public view virtual {
        uint256 receivedTimestampSeconds = dataPackagesTimestamp / 1000;

        (uint256 maxDataAheadSeconds, uint256 maxDataDelaySeconds) = getAllowedTimestampDiffsInSeconds();

        uint256 blockTimestamp = getBlockTimestamp();

        if (blockTimestamp < receivedTimestampSeconds) {
            if ((receivedTimestampSeconds - blockTimestamp) > maxDataAheadSeconds) {
                revert RedstoneDefaultsLib.TimestampFromTooLongFuture(receivedTimestampSeconds, blockTimestamp);
            }
        } else if ((blockTimestamp - receivedTimestampSeconds) > maxDataDelaySeconds) {
            revert RedstoneDefaultsLib.TimestampIsTooOld(receivedTimestampSeconds, blockTimestamp);
        }
    }

    /**
     * @dev This function can be overriden, e.g. to use block.number instead of block.timestamp
     * It can be useful in some L2 chains, as sometimes their different blocks can have the same timestamp
     * @return timestamp Timestamp or Block number or any other number that can identify time in the context
     * of the given blockchain
     */
    function getBlockTimestamp() public view virtual returns (uint256) {
        return block.timestamp;
    }

    /**
     * @dev Helpful function for getting values for timestamp validation
     * @return  maxDataAheadSeconds Max allowed number of seconds ahead of block.timrstamp
     * @return  maxDataDelaySeconds Max allowed number of seconds for data delay
     */
    function getAllowedTimestampDiffsInSeconds()
        public
        view
        virtual
        returns (uint256 maxDataAheadSeconds, uint256 maxDataDelaySeconds)
    {
        maxDataAheadSeconds = RedstoneDefaultsLib.DEFAULT_MAX_DATA_TIMESTAMP_AHEAD_SECONDS;
        maxDataDelaySeconds = RedstoneDefaultsLib.DEFAULT_MAX_DATA_TIMESTAMP_DELAY_SECONDS;
    }

    /**
     * @dev Reverts if proposed data packages are not newer than the ones used previously
     * @param dataPackagesTimestamp Timestamp od the data packages (usually in milliseconds)
     */
    function _preventUpdateWithOlderDataPackages(uint256 dataPackagesTimestamp) internal view {
        uint256 dataTimestampFromLatestUpdate = getDataTimestampFromLatestUpdate();

        if (dataPackagesTimestamp <= dataTimestampFromLatestUpdate) {
            revert DataTimestampShouldBeNewerThanBefore(dataPackagesTimestamp, dataTimestampFromLatestUpdate);
        }
    }

    /**
     * @notice Returns data timestamp from the latest update
     * @dev It's virtual, because its implementation can sometimes be different
     * (e.g. SinglePriceFeedAdapterWithClearing)
     * @return lastDataTimestamp Timestamp of the latest reported data packages
     */
    function getDataTimestampFromLatestUpdate() public view virtual returns (uint256 lastDataTimestamp) {
        (lastDataTimestamp,) = getTimestampsFromLatestUpdate();
    }

    /**
     * @notice Returns block timestamp of the latest successful update
     * @return blockTimestamp The block timestamp of the latest successful update
     */
    function getBlockTimestampFromLatestUpdate() public view returns (uint256 blockTimestamp) {
        (, blockTimestamp) = getTimestampsFromLatestUpdate();
    }

    /**
     * @dev Returns 2 timestamps packed into a single uint256 number
     * @return packedTimestamps a single uin256 number with 2 timestamps
     */
    function getPackedTimestampsFromLatestUpdate() public view returns (uint256 packedTimestamps) {
        assembly {
            packedTimestamps := sload(LATEST_UPDATE_TIMESTAMPS_STORAGE_LOCATION)
        }
    }

    /**
     * @notice Returns timestamps of the latest successful update
     * @return dataTimestamp timestamp (usually in milliseconds) from the signed data packages
     * @return blockTimestamp timestamp of the block when the update has happened
     */
    function getTimestampsFromLatestUpdate()
        public
        view
        virtual
        returns (uint128 dataTimestamp, uint128 blockTimestamp)
    {
        return _unpackTimestamps(getPackedTimestampsFromLatestUpdate());
    }

    /**
     * @dev A helpful function to unpack 2 timestamps from one uin256 number
     * @param packedTimestamps a single uin256 number
     * @return dataTimestamp fetched from left 128 bits
     * @return blockTimestamp fetched from right 128 bits
     */
    function _unpackTimestamps(uint256 packedTimestamps)
        internal
        pure
        returns (uint128 dataTimestamp, uint128 blockTimestamp)
    {
        dataTimestamp = uint128(packedTimestamps >> 128); // left 128 bits
        blockTimestamp = uint128(packedTimestamps); // right 128 bits
    }

    /**
     * @dev Logic of saving timestamps of the current update
     * By default, it stores packed timestamps in one storage slot (32 bytes)
     * to minimise gas costs
     * But it can be overriden (e.g. in SinglePriceFeedAdapter)
     * @param   dataPackagesTimestamp  .
     */
    function _saveTimestampsOfCurrentUpdate(uint256 dataPackagesTimestamp) internal virtual {
        uint256 blockTimestamp = getBlockTimestamp();

        if (blockTimestamp > MAX_NUMBER_FOR_128_BITS) {
            revert BlockTimestampIsTooBig(blockTimestamp);
        }

        if (dataPackagesTimestamp > MAX_NUMBER_FOR_128_BITS) {
            revert DataTimestampIsTooBig(dataPackagesTimestamp);
        }

        assembly {
            let timestamps := or(shl(BITS_COUNT_IN_16_BYTES, dataPackagesTimestamp), blockTimestamp)
            sstore(LATEST_UPDATE_TIMESTAMPS_STORAGE_LOCATION, timestamps)
        }
    }

    /**
     * @notice Returns the latest properly reported value of the data feed
     * @param dataFeedId The identifier of the requested data feed
     * @return value The latest value of the given data feed
     */
    function getValueForDataFeed(bytes32 dataFeedId) public view returns (uint256) {
        // "unsafe" here means "without validation"
        uint256 valueForDataFeed = getValueForDataFeedUnsafe(dataFeedId);

        //validateDataFeedValue(dataFeedId, valueForDataFeed);
        return valueForDataFeed;
    }

    /**
     * @notice Returns the latest properly reported values for several data feeds
     * @param dataFeedIds The array of identifiers for the requested feeds
     * @return values Values of the requested data feeds in the corresponding order
     */
    function getValuesForDataFeeds(bytes32[] memory dataFeedIds) public view returns (uint256[] memory) {
        uint256[] memory values = getValuesForDataFeedsUnsafe(dataFeedIds);
        for (uint256 i = 0; i < dataFeedIds.length;) {
            bytes32 dataFeedId = dataFeedIds[i];
            validateDataFeedValue(dataFeedId, values[i]);
            unchecked {
                i++;
            } // reduces gas costs
        }
        return values;
    }

    /**
     * @dev Reverts if proposed value for the proposed data feed id is invalid
     * By default, it just checks if the value is not equal to 0, but it can be extended
     * @param dataFeedId The data feed identifier
     * @param valueForDataFeed Proposed value for the data feed
     */
    function validateDataFeedValue(bytes32 dataFeedId, uint256 valueForDataFeed) public pure virtual {
        if (valueForDataFeed == 0) {
            revert DataFeedValueCannotBeZero(dataFeedId);
        }
    }

    /**
     * @dev [HIGH RISK] Returns the latest value for a given data feed without validation
     * Important! Using this function instead of `getValueForDataFeed` may cause
     * significant risk for your smart contracts
     * @param dataFeedId The data feed identifier
     * @return dataFeedValue Unvalidated value of the latest successful update
     */
    function getValueForDataFeedUnsafe(bytes32 dataFeedId) public view virtual returns (uint256);

    /**
     * @notice [HIGH RISK] Returns the latest properly reported values for several data feeds without validation
     * Important! Using this function instead of `getValuesForDataFeeds` may cause
     * significant risk for your smart contracts
     * @param requestedDataFeedIds The array of identifiers for the requested feeds
     * @return values Unvalidated values of the requested data feeds in the corresponding order
     */
    function getValuesForDataFeedsUnsafe(bytes32[] memory requestedDataFeedIds)
        public
        view
        virtual
        returns (uint256[] memory values)
    {
        values = new uint256[](requestedDataFeedIds.length);
        for (uint256 i = 0; i < requestedDataFeedIds.length;) {
            values[i] = getValueForDataFeedUnsafe(requestedDataFeedIds[i]);
            unchecked {
                i++;
            } // reduces gas costs
        }
        return values;
    }
}

// File contracts/price-feeds/PriceFeedsAdapterBase.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.14;

/**
 * @title Common logic of the price feeds adapter contracts
 * @author The Redstone Oracles team
 */
abstract contract PriceFeedsAdapterBase is RedstoneAdapterBase, Initializable {
    /**
     * @dev Helpful function for upgradable contracts
     */
    function initialize() public virtual initializer {
        // We don't have storage variables, but we keep this function
        // Because it is used for contract setup in upgradable contracts
    }

    /**
     * @dev This function is virtual and may contain additional logic in the derived contract
     * E.g. it can check if the updating conditions are met (e.g. if at least one
     * value is deviated enough)
     * @param dataFeedIdsArray Array of all data feeds identifiers
     * @param values The reported values that are validated and reported
     */
    function _validateAndUpdateDataFeedsValues(bytes32[] memory dataFeedIdsArray, uint256[] memory values)
        internal
        virtual
        override
    {
        for (uint256 i = 0; i < dataFeedIdsArray.length;) {
            _validateAndUpdateDataFeedValue(dataFeedIdsArray[i], values[i]);
            unchecked {
                i++;
            } // reduces gas costs
        }
    }

    /**
     * @dev Helpful virtual function for handling value validation and saving in derived
     * Price Feed Adapters contracts
     * @param dataFeedId The data feed identifier
     * @param dataFeedValue Proposed value for the data feed
     */
    function _validateAndUpdateDataFeedValue(bytes32 dataFeedId, uint256 dataFeedValue) internal virtual;
}

// File contracts/price-feeds/without-rounds/SinglePriceFeedAdapterV2.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.14;

/**
 * @title Price feed adapter for one specific data feed without rounds support
 * @author The Redstone Oracles team
 * @dev This version works only with a single data feed. It's abstract and
 * the following functions should be implemented in the actual contract
 * before deployment:
 * - getUniqueSignersThreshold
 * - getAuthorisedSignerIndex
 *
 * This contract stores the value along with timestamps in a single storage slot
 * 32 bytes = 6 bytes (Data timestamp ) + 6 bytes (Block timestamp) + 20 bytes (Value)
 */
abstract contract SinglePriceFeedAdapterV2 is PriceFeedsAdapterBase {
    struct DataFeedState {
        // 32 bytes packed
        uint48 dataTimestamp; // 6 bytes
        uint48 blockTimestamp; // 6 bytes
        uint160 value; // 20 bytes
    }

    uint256 internal constant MAX_VALUE_WITH_20_BYTES =
        0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff;
    uint256 internal constant MAX_VALUE_WITH_6_BYTES =
        0x0000000000000000000000000000000000000000000000000000ffffffffffff;

    DataFeedState internal currentState;

    error DataFeedValueTooBig(uint256 valueForDataFeed);

    /**
     * @dev [HIGH RISK] Returns the latest value for a given data feed without validation
     * Important! Using this function instead of `getValueForDataFeed` may cause
     * significant risk for your smart contracts
     * @return dataFeedValue Unvalidated value of the latest successful update
     */
    function getValueForDataFeedUnsafe(bytes32) public view virtual override returns (uint256 dataFeedValue) {
        dataFeedValue = currentState.value;
    }

    /**
     * @notice Returns timestamps of the latest successful update
     * @dev Timestamps here use only 6 bytes each and are packed together with the value
     * @return dataTimestamp timestamp (usually in milliseconds) from the signed data packages
     * @return blockTimestamp timestamp of the block when the update has happened
     */
    function getTimestampsFromLatestUpdate()
        public
        view
        virtual
        override
        returns (uint128 dataTimestamp, uint128 blockTimestamp)
    {
        dataTimestamp = uint128(currentState.dataTimestamp); // first 48 bits
        blockTimestamp = uint128(currentState.blockTimestamp); // next 48 bits
    }

    /**
     * @dev Validates and saves the value in the contract storage
     * Reverts if proposed value for the proposed data feed id is invalid
     * By default, it checks if the value is not equal to 0 and if it fits to 20 bytes
     * Because other 12 bytes are used for storing the packed timestamps
     * @param dataFeedId The data feed identifier
     * @param dataFeedValue Proposed value for the data feed
     */
    function _validateAndUpdateDataFeedValue(bytes32 dataFeedId, uint256 dataFeedValue) internal virtual override {
        if (dataFeedValue == 0) {
            revert DataFeedValueCannotBeZero(dataFeedId);
        }
        if (dataFeedValue > MAX_VALUE_WITH_20_BYTES) {
            revert DataFeedValueTooBig(dataFeedValue);
        }
        currentState.value = uint160(dataFeedValue);
    }

    /**
     * @dev Helpful function that packs and saves timestamps in the 12 left bytes of the
     * storage slot reserved for storing details about the latest update
     * @param dataPackagesTimestamp Timestamp from the signed data packages,
     * extracted from the RedStone payload in calldata
     */
    function _saveTimestampsOfCurrentUpdate(uint256 dataPackagesTimestamp) internal virtual override {
        uint256 blockTimestamp = getBlockTimestamp();

        if (dataPackagesTimestamp > MAX_VALUE_WITH_6_BYTES) {
            revert DataTimestampIsTooBig(dataPackagesTimestamp);
        }

        if (blockTimestamp > MAX_VALUE_WITH_6_BYTES) {
            revert BlockTimestampIsTooBig(blockTimestamp);
        }

        currentState.dataTimestamp = uint48(dataPackagesTimestamp);
        currentState.blockTimestamp = uint48(blockTimestamp);
    }
}

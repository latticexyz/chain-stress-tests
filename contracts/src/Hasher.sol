// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Hasher {
    bytes32 private _lastHash;

    function getHash() external view returns (bytes32) {
        return _lastHash;
    }

    // Hash _lastHash nn times
    function hash(uint256 nn) public {
        bytes32 currentHash = _lastHash;
        for (uint256 ii = 0; ii < nn; ii++) {
            currentHash = keccak256(abi.encode(currentHash));
        }
        _lastHash = currentHash;
    }
}

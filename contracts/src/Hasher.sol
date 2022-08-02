// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Hasher {
    bytes32 public lastHash;

    // Hash lastHash nn times
    function hash(uint256 nn) public {
        bytes32 currentHash = lastHash;
        for (uint256 ii = 0; ii < nn; ii++) {
            currentHash = keccak256(abi.encode(currentHash));
        }
        lastHash = currentHash;
    }
}

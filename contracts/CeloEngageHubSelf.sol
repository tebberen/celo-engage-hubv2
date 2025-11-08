// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@selfxyz/contracts/SelfVerificationRoot.sol";

contract CeloEngageHub is SelfVerificationRoot {
    mapping(address => bool) public verifiedUsers;

    event SelfVerified(address indexed user);

    function verifySelfProof(bytes calldata proof, bytes calldata publicSignals) external {
        bool verified = _verifySelfProof(proof, publicSignals);
        if (!verified) {
            revert("Self verification failed");
        }
        verifiedUsers[msg.sender] = true;
        emit SelfVerified(msg.sender);
    }

    function isVerified(address user) public view returns (bool) {
        return verifiedUsers[user];
    }

    modifier onlyVerified() {
        require(isVerified(msg.sender), "User not verified with Self ID");
        _;
    }

    function gatedAction() external onlyVerified {
        // Example of a gated hub action for verified accounts.
    }
}

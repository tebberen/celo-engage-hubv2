# Contracts Folder

On-chain components that back Celo Engage Hub.

## File Overview
- **CeloEngageHubSelf.sol**: Solidity contract extending `SelfVerificationRoot` to record wallet self-verification. It stores verified addresses in the `verifiedUsers` mapping, emits `SelfVerified`, and exposes `verifySelfProof`, `isVerified`, and a sample `gatedAction` protected by the `onlyVerified` modifier.

## Relationships
- Relies on the `@selfxyz/contracts` package for zk-proof verification via `_verifySelfProof`.
- Intended to complement the off-chain verification service in `server/index.js` and the identity UI in `src/services/identityService.js`.

## Contributor Notes
- Add new modules as separate `.sol` files here and update ABI/address references in `src/utils/constants.js` if used by the front-end.
- Keep access control consistent; reuse `onlyVerified` for actions that should require Self ID proof.

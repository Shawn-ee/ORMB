# Contract Threat Model

## Scope

This threat model covers the current ORMB smart contract demo baseline:

- `contracts/ORMBToken.sol`
- `contracts/MockUSDT.sol`
- Base Sepolia Hardhat configuration
- Contract deployment and operations scripts
- Contract tests

ORMB remains testnet-only and mock-asset-only. This document does not approve mainnet deployment, real stablecoin issuance, real USDT/RMB/CNH handling, custody, redemption value, or production payment activity.

## Assets

Protected demo assets:

- ORMBToken mint permission.
- Whitelist control over allowed token holders and transfer counterparties.
- Pause control for emergency demo shutdown.
- Demo supply integrity on testnet.
- Contract script environment variables and testnet deployer key, if a human owner later supplies one.

Non-assets:

- MockUSDT has no real value and no collateral claim.
- ORMB has no real redemption right or production settlement value.

## Trust Boundaries

| Boundary | Current Control | Gap |
| --- | --- | --- |
| Contract roles | OpenZeppelin `AccessControl` gates mint, whitelist, and pause. | Initial admin receives every role; role separation is not yet enforced by deployment process. |
| Token transfers | Both sender and recipient must be whitelisted for normal transfers. | Whitelist governance policy is documented but not operationalized. |
| Minting | Minter can mint only to whitelisted wallets and only while unpaused. | No on-chain cap, per-mint limit, or multisig/timelock policy. |
| Burning | Holders can burn their own ORMB through `ERC20Burnable`. | Burn is permissionless for holders; redemption worker must verify source wallet, chain, amount, and duplicate event. |
| Pausing | Pauser can pause and unpause token movement. | Emergency runbook and role separation are not yet complete. |
| Testnet scripts | Scripts require `ORMB_CONFIRM_TESTNET_DEPLOY=YES` and Base Sepolia chain ID. | Scripts are not integrated with typed env validation yet. |

## Threats And Current Mitigations

### Unauthorized Mint

Threat: A non-minter attempts to mint ORMB.

Current mitigation:

- `mint()` is gated by `MINTER_ROLE`.
- Tests cover non-minter rejection.

Remaining pilot gap:

- Minter role custody and rotation are not yet documented in a dedicated role runbook.

### Mint To Unapproved Wallet

Threat: A minter attempts to mint to a non-whitelisted wallet.

Current mitigation:

- `mint()` checks recipient whitelist.
- `_update()` also blocks mint to non-whitelisted recipient.
- Tests cover non-whitelisted mint rejection.

Remaining pilot gap:

- Whitelist approval evidence, expiry, removal reason, and periodic review are not modeled.

### Unauthorized Whitelist Change

Threat: A non-admin changes whitelist state.

Current mitigation:

- `setWhitelisted()` is gated by `WHITELIST_ADMIN_ROLE`.
- Zero address is rejected.
- Event is emitted and tested.

Remaining pilot gap:

- No on-chain reason code or off-chain evidence reference is emitted.

### Transfer Outside Whitelist

Threat: ORMB moves to or from a non-whitelisted wallet.

Current mitigation:

- `_update()` requires both sender and recipient to be whitelisted for normal transfers.
- Burn to zero address is allowed so redemption burn can work.
- Tests cover transfer rejection to non-whitelisted wallet and rejection after de-whitelisting.

Remaining pilot gap:

- No sanctions/compliance provider integration exists; current whitelist is a demo control only.

### Pause Abuse Or Failure To Pause

Threat: Pauser cannot respond to a bad mint, or pauser abuses pause controls.

Current mitigation:

- `PAUSER_ROLE` gates pause/unpause.
- `whenNotPaused` blocks mint and transfer paths.
- Tests cover non-pauser rejection and paused transfer rejection.

Remaining pilot gap:

- Emergency pause authority, communication, and unpause criteria are not yet in an operator runbook.

### Role Centralization

Threat: One admin key controls default admin, mint, pause, and whitelist roles.

Current mitigation:

- Current deployment is testnet demo only.
- No mainnet deployment is approved.

Remaining pilot gap:

- Enterprise pilot preparation should separate admin, minter, pauser, and whitelist roles, preferably through multisig-controlled addresses in any approved testnet pilot.

### MockUSDT Misrepresentation

Threat: Public mint/faucet MockUSDT is mistaken for real USDT or collateral.

Current mitigation:

- MockUSDT is named mock, has public mint/faucet only for demo, and is documented as valueless.
- Legal/security docs prohibit representing it as real USDT.

Remaining pilot gap:

- Hosted/demo UI and docs must keep mock-asset disclaimers visible.

### Script Misconfiguration

Threat: A script runs against the wrong chain or with unsafe credentials.

Current mitigation:

- Hardhat network is Base Sepolia.
- Scripts require `ORMB_CONFIRM_TESTNET_DEPLOY=YES`.
- Scripts check chain ID against Base Sepolia.

Remaining pilot gap:

- Scripts should adopt `parseOrmbEnvironment()` from `src/lib/config/env.ts` in a focused follow-up branch.

## Required Follow-Up Branches

1. `agent/213-mint-role-runbook-hardening`
   - Define role separation, minter/hot-wallet assumptions, emergency pause, key rotation, and testnet operations.

2. `agent/212-contract-permission-hardening`
   - Consider adding tests or docs for role admin changes, role revocation, and deployment role assignment.

3. `agent/260-enterprise-pilot-playbook`
   - Define human approval gates and pilot participant responsibilities.

4. `agent/263-incident-response-runbook`
   - Define response for key exposure, bad mint, bad whitelist, or script misfire.

## Current Verdict

The contract baseline is acceptable for local/testnet portfolio demo use. It is not sufficient for enterprise pilot preparation until role operations, incident response, and whitelist governance are documented and reviewed.

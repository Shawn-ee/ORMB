# Contract Security Review

## Review Date

2026-06-18

## Scope

Reviewed:

- `contracts/ORMBToken.sol`
- `contracts/MockUSDT.sol`
- `test/contracts/ormb-token.test.ts`
- Contract-related security documentation

## Findings

### ORMBToken

Status: no blocking issues found for the current testnet demo scope.

Reviewed properties:

- `MINTER_ROLE` gates minting.
- Minting requires a whitelisted recipient.
- `WHITELIST_ADMIN_ROLE` gates whitelist updates.
- `PAUSER_ROLE` gates pause and unpause.
- Normal transfers require both sender and recipient to be whitelisted.
- Pause state blocks token movement through the shared ERC-20 update path.
- Burn reduces total supply.
- No upgradeability mechanism exists in the current implementation.

Audit improvements added:

- Test for non-whitelist-admin whitelist rejection.
- Test for whitelist update event emission.
- Test for transfer rejection after de-whitelisting.
- Test for non-pauser pause rejection.

### MockUSDT

Status: accepted for testnet demo scope only.

MockUSDT has public demo mint and faucet functions. This is intentional for local/testnet demo flows and must not be represented as real USDT, collateral, custody, redemption value, or production asset behavior.

## Release Requirements

Before demo release:

- Re-run contract tests.
- Re-run full CI.
- Confirm no mainnet deployment scripts or real keys are introduced.
- Confirm UI and docs continue to identify MockUSDT and ORMB as testnet-only demo assets.

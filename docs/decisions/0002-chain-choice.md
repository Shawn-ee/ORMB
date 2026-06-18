# 0002: Chain Choice

## Status

Accepted

## Context

The project needs a testnet environment suitable for demonstrating stablecoin infrastructure, smart contract deployment, and chain event indexing.

## Decision

Base Sepolia is the target chain for the ORMB demo.

## Rationale

- It is a testnet and supports the project boundary of no real funds.
- It aligns with modern Ethereum L2 development patterns.
- It is suitable for viem and Hardhat-based workflows.
- It is relevant to payment infrastructure and stablecoin engineering demonstrations.

## Consequences

- Deployment scripts must default to testnet-safe behavior.
- Mainnet deployments are prohibited unless explicitly approved by the human owner.
- Documentation and CI should make network assumptions explicit.

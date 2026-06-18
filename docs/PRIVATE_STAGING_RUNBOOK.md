# Private Interactive Testnet Staging Runbook

## Scope

This runbook is for an owner-only Base Sepolia staging environment. It is not a production launch, public service, public stablecoin, custody system, payment processor, real payout rail, or real RMB/CNH product.

Hard boundaries:

- No real funds.
- No real USDT.
- No real RMB or CNH.
- No mainnet.
- No customer data.
- No public mint/burn operation.
- No production claims.
- No secrets committed to the repository.

## Required Local State

Start from reviewed `dev` only:

```bash
git checkout dev
git pull --ff-only origin dev
npm ci
npm run test:ci
npm run test:e2e
```

Use one local `.env.local` or server environment file per machine. Do not copy real values into docs, issues, PRs, agent reports, or chat.

## Required Environment Values

Private staging requires:

```env
ORMB_ENV_MODE=private-staging
ORMB_READ_ONLY_DEMO_MODE=false
DATABASE_URL=
BASE_SEPOLIA_RPC_URL=
BASE_SEPOLIA_CHAIN_ID=84532
ORMB_CONTRACT_ADDRESS=
BASE_SEPOLIA_MINTER_PRIVATE_KEY=
BASE_SEPOLIA_BURNER_PRIVATE_KEY=
STAGING_BASIC_AUTH_USERNAME=
STAGING_BASIC_AUTH_PASSWORD=
```

Values must be local/server-only. Use testnet-only keys with no mainnet, production, customer, or real-funds use.

## Local Database

For local development:

```bash
npm run db:up
npm run db:migrate:local
npm run db:seed
```

For server staging:

```bash
npm run db:deploy
```

Do not run destructive reset commands against a server staging database.

## Access Guard

Private staging uses Basic Auth for:

- `/admin`
- `/api/admin/**`
- `/api/staging/**`

A hidden URL is not access protection. Use Basic Auth plus private server access controls. Do not expose mutation routes publicly.

## Contract Setup Checklist

Before any testnet transaction:

1. Confirm target chain is Base Sepolia `84532`.
2. Confirm the contract address is the intended ORMB Base Sepolia deployment.
3. Confirm minter and burner keys are testnet-only.
4. Confirm the staging minter has `MINTER_ROLE`.
5. Confirm test wallets are whitelisted.
6. Run `npm run test:ci`.
7. Record the action in an agent report or operator log without secrets.

## Simulated Deposit To Mint

The current repository has the core boundaries for:

- manual simulated deposit confirmation
- pending mint request creation
- Base Sepolia mint gateway preflight
- audit-log interfaces

Future API/UI wiring must keep these rules:

- Manual deposits are simulated staging records only.
- Mint request creation is idempotent by `manualReference`.
- Mint execution requires manual approval.
- No route may mint when env validation, Basic Auth, chain ID, role, whitelist, idempotency, or audit checks fail.

## Redemption To Burn And Simulated Payout

The current repository has the core boundaries for:

- redemption request and approval
- Base Sepolia burn evidence validation
- duplicate burn protection
- simulated payout completion after burn verification

Future API/UI wiring must keep these rules:

- Cashout is simulated only.
- Burn evidence must be Base Sepolia-only.
- Burn source wallet and amount must match the approved redemption.
- Simulated payout cannot happen before burn verification.
- No real payout, banking, custody, RMB/CNH settlement, or payment processing is allowed.

## systemd Outline

Example service shape:

```ini
[Unit]
Description=ORMB private staging
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/ormb
EnvironmentFile=/etc/ormb/private-staging.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3100
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Use the owner server paths and Node/npm paths. Keep `/etc/ormb/private-staging.env` readable only by the service user.

## Nginx Outline

Use Nginx as a TLS reverse proxy to the local Next server:

```nginx
server {
  listen 443 ssl;
  server_name staging.example.com;

  location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

Use the owner-managed domain and certificate. Do not rely on domain obscurity as access control.

## Deployment Update

```bash
git checkout dev
git pull --ff-only origin dev
npm ci
npm run db:deploy
npm run test:ci
npm run build
sudo systemctl restart ormb-private-staging
sudo systemctl status ormb-private-staging
```

Run Playwright from a development machine when UI behavior changes.

## Logs And Recovery

```bash
sudo journalctl -u ormb-private-staging -n 200 --no-pager
sudo systemctl restart ormb-private-staging
sudo systemctl status ormb-private-staging
```

If env validation fails, fix server environment values outside the repo. Do not weaken validation to make the server start.

## Stop Conditions

Stop immediately if any step requires:

- real funds
- real USDT/RMB/CNH
- mainnet
- real payout
- custody
- customer data
- committed secrets
- bypassing CI
- disabling Basic Auth for private staging
- production/public stablecoin claims

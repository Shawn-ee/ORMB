# Local Docker PostgreSQL

This guide supports local development and private staging preparation for the ORMB demo database. It uses placeholder-only local credentials and does not support real funds, real customer deposits, mainnet activity, custody, payment processing, or live mint/burn operations.

## Local Setup

Copy the placeholder environment file for local development:

```bash
cp .env.example .env
```

The local database placeholders are:

```text
DATABASE_URL="postgresql://ormb_user:ormb_password@localhost:5432/ormb?schema=public"
POSTGRES_USER=ormb_user
POSTGRES_PASSWORD=ormb_password
POSTGRES_DB=ormb
POSTGRES_PORT=5432
```

These values are local-only placeholders. Do not replace them with production credentials in committed files.

## Start PostgreSQL

Validate the Docker Compose file:

```bash
docker compose config
```

Start the local Postgres container:

```bash
npm run db:up
```

Stop the local container without deleting the database volume:

```bash
npm run db:down
```

## Prisma Workflow

Validate the Prisma schema:

```bash
npm run prisma:validate
```

Apply local development migrations:

```bash
npm run db:migrate:local
```

Seed placeholder demo records:

```bash
npm run db:seed
```

The seed script creates demo companies, demo whitelisted wallets, and a worker state row for local/private demo preparation only. It does not represent real USDT, RMB, CNH, customer funds, deposits, payments, custody, or live mint/burn behavior.

## Safe Local Reset

Only run reset commands against the local Docker database URL from `.env.example`.

Check the target first:

```bash
echo "$DATABASE_URL"
```

Reset the local database, replay migrations, and run the demo seed after confirming Prisma's prompt:

```bash
npm run db:reset:local
```

Do not use local reset commands against private staging, shared databases, or any environment that contains data another operator expects to keep.

## Private Staging Migration Guidance

Private staging must receive its database URL through the staging host or secret manager. Do not commit staging credentials or production-like secrets.

For private staging schema updates, use Prisma's deployment migration path:

```bash
npm run db:deploy
```

Private staging must not use `prisma migrate reset`, `npm run db:reset:local`, or any destructive database reset flow. Seed data should only be loaded in private staging when the human owner explicitly approves the demo dataset and target database.

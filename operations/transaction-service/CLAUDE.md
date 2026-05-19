# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode, hot reload)
npm run start:dev

# Build
npm run build

# Start production
npm run start:prod

# Run all tests
npm test

# Run a single test file
npx jest src/blockchain/blockchain.service.spec.ts

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint (auto-fix)
npm run lint

# Format
npm run format
```

## Environment Setup

Copy `.env.example` to `.env`. Required variables:

- `WALLET_PRIVATE_KEY_<CLIENT_ID>` — private key per client (e.g. `WALLET_PRIVATE_KEY_myapp`)
- `RPC_URL` — blockchain RPC endpoint (WSO2 chain ID: 10000)
- `MAIN_CONTRACT_ADDRESS` — default ERC20 token contract address

The client-to-wallet mapping lives in `src/config/client-address-mapping.json` (not committed; path is hardcoded in `WalletConfigService`). Each entry maps a `clientId` to `PUBLIC_WALLET_ADDRESS` and optionally `CONTRACT_ADDRESS`.

## Architecture

**NestJS REST API** running on port 4000. No database — all state lives on-chain via ethers.js.

### Module structure

- **AppModule** → imports `ConfigModule` and `BlockchainModule`
- **BlockchainModule** — all blockchain logic
  - `BlockchainController` — REST endpoints under `/api/v1/blockchain/`
  - `BlockchainService` — ethers.js interactions (balance queries, token transfers, tx lookups)
  - `dto/` — request/response DTOs with class-validator and Swagger decorators
- **CommonModule** — shared services (exported for use in BlockchainModule)
  - `HttpResponseService` — wraps all responses in a standard envelope; handles BigInt serialization from ethers.js
  - `WalletConfigService` — loads and caches the client→wallet JSON mapping file
  - `JwtClientIdMiddleware` — extracts `client_id` claim from `x-jwt-assertion` header; attaches to `req.clientId`. Falls back to `local-dev` when no header is present (applied globally in `main.ts`)
- **config/blockchain.config.ts** — smart contract ABI, RPC URL, chain ID (10000)

### Multi-client pattern

Each API caller is identified by a `client_id` extracted from their JWT (via middleware). The `WalletConfigService` maps this ID to:
- A public wallet address (used for balance checks)
- An optional per-client contract address (falls back to global default)
- A private key read from `process.env[WALLET_PRIVATE_KEY_${clientId}]` (only during transfers)

### API endpoints

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/v1/` | None (health) |
| `GET` | `/api/v1/blockchain/master-wallet-balance` | JWT (`x-jwt-assertion`) |
| `GET` | `/api/v1/blockchain/get-balance/:walletAddress` | None |
| `POST` | `/api/v1/blockchain/transfer-token` | JWT (`x-jwt-assertion`) |
| `POST` | `/api/v1/blockchain/transactions/search` | None |
| `GET` | `/api/v1/blockchain/get-transaction-details/:txHash` | None |

Swagger UI is available at `/api` when the app is running.

### Key implementation details

- **BigInt serialization**: ethers.js returns `BigInt` values which cannot be `JSON.stringify`'d natively. `HttpResponseService.send()` converts them to strings via a custom serializer.
- **Zero gas price**: Token transfers use `gasPrice: '0'` — the WSO2 private chain does not charge gas fees.
- **Transaction search**: `browseTransactions` uses binary search to convert time filters to block ranges, then a single `eth_getLogs` call. Pagination is offset-based over the full event set (see TODO in code about scaling).
- **No unit tests**: No `.spec.ts` files exist yet. The test commands in the scripts section are scaffolded but there are no tests to run.

### Deployment

Deployed via WSO2 Choreo (see `.choreo/component.yaml`). The `openapi.yaml` in the root is used by Choreo for API management — keep it in sync with controller changes.

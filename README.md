# Wealth Tracking Framework (WTF)

A full-stack, Dockerized app for tracking crypto, stocks/ETFs, fixed savings, and alternative assets (e.g., whiskey, property). JWT-secured API, automated data fetchers, CI/CD, and Cypress E2E.

> **Status:** **Local development is temporarily disabled.** **Allure reporting is WIP** (not enabled in this submission).

---

## Overview

- Track crypto, equities/ETFs, and savings accounts
- Live pricing (CoinGecko, Finnhub)
- P/L, current value, basic analytics
- JWT auth (1h)
- Ansible playbooks for automated server setup
- Jenkins CI (build/test/deploy)
- **Allure:** planned/WIP

**Stack:** React + Tailwind • Node/Express • PostgreSQL • Docker Compose • Ansible • Jenkins

---

## Server Quick Start

1) **Clone**
    ```bash
    git clone https://github.com/AaronMcKinley/wealth-tracking-framework.git
    cd wealth-tracking-framework/ansible
    ```

2) **Provision Ubuntu server**
    ```bash
    ansible-playbook -i <server-ip>, setup-ubuntu.yml       --ask-vault-pass --ask-become-pass -u root --private-key <ssh-key>
    ```

3) **Deploy stack**
    ```bash
    ansible-playbook -i <server-ip>, start-on-server.yml       --ask-vault-pass --ask-become-pass -u root --private-key <ssh-key>
    ```

> Local workflow (`start-locally.yml`) is currently disabled.

---

## Access (Server)

- **Frontend:** https://wealth-tracking-framework.com
- **API:** proxied under `/api` on the frontend domain (health: `/api/health`)
- **Jenkins:** https://jenkins.wealth-tracking-framework.com

If you use different domains/ports, update NGINX and `.env` accordingly.

---

## Environment

Generated from Ansible Vault into `.env` on the server.



Edit secrets:
```bash
ansible-vault edit secrets.yml
```

---

## API Snapshot

- `POST /api/login` – returns JWT
- `POST /api/signup` – create user, returns JWT
- `GET /api/investments` – holdings + prices/P&L
- `POST /api/investments` – record buy/sell
- `GET /api/transactions/:ticker` – user transactions
- `GET /api/assets/:ticker` – current price
- `GET /api/savings` – savings with computed `next_payout`
- `POST /api/savings` – create/update/remove savings
- `GET /api/user` / `PUT /api/user` / `DELETE /api/user`

**Auth:** `Authorization: Bearer <token>` (expires in 1h)

---

## Data Fetchers

- **Crypto (CoinGecko → EUR)** → UPSERT `cryptocurrencies`, saves `./data/wtfCoins.json`
- **Stocks/ETFs (Finnhub → USD→EUR)** → UPSERT `stocks_and_funds`, saves `./data/assets-chunk.json`

Run via npm scripts or directly with Node/ts-node.

---

## Savings Interest

- Per-period interest computed based on `daily|weekly|monthly|yearly`.
- UI displays `next_payout` per account.
- **Note:** Refinements to persistence/rounding are **in progress**.

---

## Testing & CI

- **Cypress:** headless smoke tests in CI (artifacts archived in Jenkins).
- **Allure:** WIP (not enabled).

Example run:
```bash
npx cypress run --browser chrome --headless
```

---

## Operational Notes

- Backend refuses to start if `JWT_SECRET` is missing.
- NGINX serves the frontend and proxies `/api/*` to the backend.
- UPSERTs (`ON CONFLICT`) make fetcher runs idempotent.
- Fetchers rate-limit requests and rotate through ticker chunks.

---

## Troubleshooting

- **JWT secret missing** → set `JWT_SECRET` via Vault → `.env`.
- **DB connection** → verify `PG*` vars and Docker network.
- **Finnhub 429s** → confirm `FINNHUB_API_KEY`, slow the fetch cadence.
- **No test report** → Allure is WIP; rely on Cypress artifacts in Jenkins.

---

## Roadmap

- Savings interest persistence/rounding improvements
- Filtering/analytics and portfolio visualizations
- Expanded test coverage / Allure enablement

---

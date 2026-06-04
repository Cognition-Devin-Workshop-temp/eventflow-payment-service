# EventFlow Payment Service

**System 2** in the EventFlow event-driven architecture demo.

A FastAPI service that consumes `OrderCreated` events from Azure Service Bus and processes payments. This service contains a known bug with zero-decimal currencies (JPY, KRW) that demonstrates the demo's incident response narrative.

## Architecture Role

```
Azure Service Bus → [Payment Service] → Payment Processing
                          ↓
                   Application Insights
                          ↓
                   Alert Rule (on error spike)
                          ↓
                   Devin API (investigate + fix)
```

## Features

- Azure Service Bus consumer for `OrderCreated` events
- Payment processing with currency conversion
- Health check and readiness endpoints
- Structured logging with correlation IDs
- OpenTelemetry instrumentation for Azure Monitor

## The Bug (Demo Narrative)

The payment processor converts amounts from smallest currency unit to display amounts by dividing by 100 (assuming all currencies have two decimal places). This works for USD, EUR, GBP but **fails for zero-decimal currencies** like JPY and KRW where the amount is already in the base unit.

When a JPY order arrives:
- Amount `15800` (yen) gets divided by 100 → `158.00`
- Validation expects amount ≥ smallest billable unit in display currency
- The converted amount fails a downstream consistency check → **unhandled exception**

This bug is intentionally present on the `main` branch to demonstrate:
1. CI tests passing (they only cover USD/EUR)
2. Production crash on JPY input
3. Devin AI investigating logs and opening a fix PR

## Tech Stack

- Python 3.11+
- FastAPI
- Azure Service Bus SDK
- OpenTelemetry + Azure Monitor
- Pydantic v2

## Local Development

```bash
pip install poetry
poetry install

cp .env.example .env
# Edit .env with your values

# Run the service
poetry run uvicorn app.main:app --reload --port 8002

# Run tests
poetry run pytest -v
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `AZURE_SERVICEBUS_CONNECTION_STRING` | Service Bus connection string | *(required)* |
| `AZURE_SERVICEBUS_QUEUE_NAME` | Queue name for order events | `order-events` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string | *(optional)* |
| `LOG_LEVEL` | Logging level | `INFO` |
| `ENVIRONMENT` | Deployment environment | `development` |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Readiness check |
| `GET` | `/api/payments` | List processed payments |
| `GET` | `/api/payments/{payment_id}` | Get payment by ID |
| `POST` | `/api/tokens` | Tokenize a bank account |
| `GET` | `/api/tokens?customer_id=...` | List tokens for a customer |
| `GET` | `/api/tokens/{token_id}` | Get a specific token |

## Account Tokenization

The service includes a tokenization layer that converts sensitive bank account/routing numbers into opaque tokens. Raw numbers are never stored — only masked versions (last 4 digits) and the SHA-256-derived token.

### Flow

1. Client POSTs `account_number`, `routing_number`, `customer_id` to `/api/tokens`
2. Service generates a deterministic `tok_`-prefixed token from the SHA-256 of the account+routing pair
3. Only masked values (`****1234`) and the token are persisted (in-memory)
4. Duplicate tokenization of the same account+routing is detected and returns the existing token

### Validation Rules

- Account number: 8–17 digits, numeric only
- Routing number: exactly 9 digits, numeric only

## Angular Frontend (`payment-token-app/`)

An Angular 19 + Material application that provides a UI for tokenizing accounts and managing saved payment methods.

### Running the Frontend

```bash
cd payment-token-app
npm install
npm start
```

The Angular dev server runs on `http://localhost:4200` and expects the FastAPI backend on port 8000.

### Features

- **Tokenize New Account** form with inline validation
- **My Saved Payment Methods** table with token list per customer
- **Selected Payment Method** display confirming the token to use for a transaction

## Docker

```bash
docker build -t eventflow-payment-service .
docker run -p 8002:8002 --env-file .env eventflow-payment-service
```

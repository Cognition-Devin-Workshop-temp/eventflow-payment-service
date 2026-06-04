"""Token service — generates and manages tokenized bank accounts."""

import hashlib
import uuid
from datetime import UTC, datetime

from app.token_models import TokenizedAccount, TokenizeRequest

# In-memory store keyed by token_id
token_store: dict[str, TokenizedAccount] = {}

# Map from hash → token_id to prevent duplicates
_hash_to_token: dict[str, str] = {}


def generate_token(account_number: str, routing_number: str) -> str:
    """Return a deterministic token: SHA-256 hash, prefixed ``tok_``, truncated to 24 hex chars."""
    raw = f"{account_number}:{routing_number}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return f"tok_{digest[:24]}"


def create_tokenized_account(request: TokenizeRequest) -> TokenizedAccount:
    """Create a tokenized account record, preventing duplicates by hash."""
    token_hash = generate_token(request.account_number, request.routing_number)

    if token_hash in _hash_to_token:
        existing_id = _hash_to_token[token_hash]
        return token_store[existing_id]

    token_id = str(uuid.uuid4())
    account = TokenizedAccount(
        token_id=token_id,
        masked_account=f"****{request.account_number[-4:]}",
        masked_routing=f"****{request.routing_number[-4:]}",
        customer_id=request.customer_id,
        created_at=datetime.now(UTC),
        is_active=True,
    )
    token_store[token_id] = account
    _hash_to_token[token_hash] = token_id
    return account


def get_tokens_for_customer(customer_id: str) -> list[TokenizedAccount]:
    """Return all tokens belonging to *customer_id*."""
    return [t for t in token_store.values() if t.customer_id == customer_id]


def get_token_by_id(token_id: str) -> TokenizedAccount | None:
    """Return a single token by its UUID, or ``None``."""
    return token_store.get(token_id)

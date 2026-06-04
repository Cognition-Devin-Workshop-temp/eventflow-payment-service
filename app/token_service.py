"""Tokenization logic — generates tokens for bank accounts without storing raw numbers."""

import hashlib
import uuid
from datetime import UTC, datetime

from app.token_models import TokenizedAccount, TokenizeRequest

# In-memory store keyed by token_id
token_store: dict[str, TokenizedAccount] = {}

# Track generated hashes to prevent duplicate tokenization
_hash_to_token_id: dict[str, str] = {}


def generate_token(account_number: str, routing_number: str) -> str:
    """Generate a deterministic SHA-256 based token from account + routing."""
    raw = f"{account_number}:{routing_number}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return f"tok_{digest[:24]}"


def create_tokenized_account(request: TokenizeRequest) -> TokenizedAccount:
    """Create a tokenized account entry. Raises ValueError on duplicate."""
    token_hash = generate_token(request.account_number, request.routing_number)

    if token_hash in _hash_to_token_id:
        existing_id = _hash_to_token_id[token_hash]
        return token_store[existing_id]

    token_id = str(uuid.uuid4())
    masked_account = f"****{request.account_number[-4:]}"
    masked_routing = f"****{request.routing_number[-4:]}"

    account = TokenizedAccount(
        token_id=token_id,
        masked_account=masked_account,
        masked_routing=masked_routing,
        customer_id=request.customer_id,
        created_at=datetime.now(UTC),
        is_active=True,
    )

    token_store[token_id] = account
    _hash_to_token_id[token_hash] = token_id
    return account


def get_tokens_for_customer(customer_id: str) -> list[TokenizedAccount]:
    """Return all tokens belonging to a customer."""
    return [t for t in token_store.values() if t.customer_id == customer_id]

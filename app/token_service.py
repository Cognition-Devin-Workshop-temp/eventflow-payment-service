"""In-memory tokenization service for bank accounts."""

import hashlib
import uuid
from datetime import UTC, datetime

from app.token_models import TokenizedAccount, TokenizeRequest

# In-memory store: token_id -> TokenizedAccount
token_store: dict[str, TokenizedAccount] = {}

# Map from hash -> token_id for duplicate detection
_hash_index: dict[str, str] = {}


def generate_token(account_number: str, routing_number: str) -> str:
    """Generate a deterministic token from account + routing via SHA-256."""
    raw = f"{account_number}:{routing_number}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return f"tok_{digest[:24]}"


def create_tokenized_account(request: TokenizeRequest) -> TokenizedAccount:
    """Create and store a tokenized account. Prevents duplicates."""
    token_hash = generate_token(request.account_number, request.routing_number)

    if token_hash in _hash_index:
        return token_store[_hash_index[token_hash]]

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
    _hash_index[token_hash] = token_id
    return account


def get_tokens_for_customer(customer_id: str) -> list[TokenizedAccount]:
    """Return all tokens belonging to a customer."""
    return [t for t in token_store.values() if t.customer_id == customer_id]


def get_token_by_id(token_id: str) -> TokenizedAccount | None:
    """Retrieve a single token by its ID."""
    return token_store.get(token_id)

"""Pydantic models for account tokenization."""

from datetime import datetime

from pydantic import BaseModel


class TokenizeRequest(BaseModel):
    """Request to tokenize a bank account."""

    account_number: str
    routing_number: str
    customer_id: str


class TokenizedAccount(BaseModel):
    """Tokenized representation of a bank account. Raw numbers are never stored."""

    token_id: str
    masked_account: str
    masked_routing: str
    customer_id: str
    created_at: datetime
    is_active: bool

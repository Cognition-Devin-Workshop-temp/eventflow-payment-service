"""Pydantic models for account tokenization."""

from datetime import UTC, datetime

from pydantic import BaseModel, Field


class TokenizeRequest(BaseModel):
    """Request body for tokenizing a bank account."""

    account_number: str
    routing_number: str
    customer_id: str


class TokenizedAccount(BaseModel):
    """A tokenized bank account record."""

    token_id: str
    masked_account: str
    masked_routing: str
    customer_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    is_active: bool = True

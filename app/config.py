"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Payment Service configuration."""

    # Azure Service Bus
    azure_servicebus_connection_string: str = ""
    azure_servicebus_queue_name: str = "order-events"

    # Azure Monitor
    applicationinsights_connection_string: str = ""

    # Order service callback
    order_service_url: str = ""

    # Email notification (SMTP)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    notification_sender_email: str = ""
    notification_recipient_email: str = ""

    # Application
    log_level: str = "INFO"
    environment: str = "development"
    service_name: str = "eventflow-payment-service"
    service_version: str = "1.0.0"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

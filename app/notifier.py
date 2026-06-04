"""Email notification for payment processing failures."""

import logging
import smtplib
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_failure_email(order_id: str, error_message: str) -> None:
    """Send an email notification when a payment fails.

    Args:
        order_id: The ID of the order whose payment failed.
        error_message: Description of the failure.
    """
    if not settings.smtp_host or not settings.notification_recipient_email:
        logger.debug("SMTP not configured — skipping failure email notification")
        return

    subject = f"Payment Failed — Order {order_id}"
    body = (
        f"Payment processing failed for order {order_id}.\n\n"
        f"Error: {error_message}\n\n"
        f"Service: {settings.service_name}\n"
        f"Environment: {settings.environment}\n"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.notification_sender_email or settings.smtp_username
    msg["To"] = settings.notification_recipient_email

    try:
        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)

        server.sendmail(
            msg["From"],
            [settings.notification_recipient_email],
            msg.as_string(),
        )
        server.quit()
        logger.info("Failure notification email sent for order %s", order_id)
    except Exception:
        logger.exception("Failed to send failure notification email for order %s", order_id)

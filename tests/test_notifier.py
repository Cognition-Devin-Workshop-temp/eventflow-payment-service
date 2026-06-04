"""Tests for the email notification module."""

from unittest.mock import MagicMock, patch

import pytest

from app.notifier import send_failure_email


class TestSendFailureEmail:
    """Tests for send_failure_email."""

    def test_skips_when_smtp_not_configured(self):
        """Should skip gracefully when SMTP host is not configured."""
        with patch("app.notifier.settings") as mock_settings:
            mock_settings.smtp_host = ""
            mock_settings.notification_recipient_email = "admin@example.com"

            # Should not raise
            send_failure_email("order-123", "some error")

    def test_skips_when_recipient_not_configured(self):
        """Should skip gracefully when recipient email is not configured."""
        with patch("app.notifier.settings") as mock_settings:
            mock_settings.smtp_host = "smtp.example.com"
            mock_settings.notification_recipient_email = ""

            send_failure_email("order-123", "some error")

    def test_sends_email_when_configured(self):
        """Should call smtplib.SMTP and send email when fully configured."""
        with (
            patch("app.notifier.settings") as mock_settings,
            patch("app.notifier.smtplib.SMTP") as mock_smtp_class,
        ):
            mock_settings.smtp_host = "smtp.example.com"
            mock_settings.smtp_port = 587
            mock_settings.smtp_use_tls = True
            mock_settings.smtp_username = "user@example.com"
            mock_settings.smtp_password = "secret"
            mock_settings.notification_sender_email = "sender@example.com"
            mock_settings.notification_recipient_email = "admin@example.com"
            mock_settings.service_name = "eventflow-payment-service"
            mock_settings.environment = "test"

            mock_server = MagicMock()
            mock_smtp_class.return_value = mock_server

            send_failure_email("order-456", "Payment gateway timeout")

            mock_smtp_class.assert_called_once_with("smtp.example.com", 587)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("user@example.com", "secret")
            mock_server.sendmail.assert_called_once()
            mock_server.quit.assert_called_once()

            # Verify sendmail args
            call_args = mock_server.sendmail.call_args[0]
            assert call_args[0] == "sender@example.com"
            assert call_args[1] == ["admin@example.com"]
            assert "order-456" in call_args[2]
            assert "Payment gateway timeout" in call_args[2]

    def test_sends_email_without_tls(self):
        """Should connect without TLS when smtp_use_tls is False."""
        with (
            patch("app.notifier.settings") as mock_settings,
            patch("app.notifier.smtplib.SMTP") as mock_smtp_class,
        ):
            mock_settings.smtp_host = "smtp.example.com"
            mock_settings.smtp_port = 25
            mock_settings.smtp_use_tls = False
            mock_settings.smtp_username = ""
            mock_settings.smtp_password = ""
            mock_settings.notification_sender_email = ""
            mock_settings.notification_recipient_email = "admin@example.com"
            mock_settings.service_name = "eventflow-payment-service"
            mock_settings.environment = "test"

            mock_server = MagicMock()
            mock_smtp_class.return_value = mock_server

            send_failure_email("order-789", "Invalid amount")

            mock_smtp_class.assert_called_once_with("smtp.example.com", 25)
            mock_server.starttls.assert_not_called()
            mock_server.login.assert_not_called()
            mock_server.sendmail.assert_called_once()

    def test_catches_smtp_exception(self):
        """Should catch and log SMTP errors without raising."""
        with (
            patch("app.notifier.settings") as mock_settings,
            patch("app.notifier.smtplib.SMTP") as mock_smtp_class,
        ):
            mock_settings.smtp_host = "smtp.example.com"
            mock_settings.smtp_port = 587
            mock_settings.smtp_use_tls = True
            mock_settings.smtp_username = ""
            mock_settings.smtp_password = ""
            mock_settings.notification_sender_email = "sender@example.com"
            mock_settings.notification_recipient_email = "admin@example.com"
            mock_settings.service_name = "eventflow-payment-service"
            mock_settings.environment = "test"

            mock_smtp_class.side_effect = ConnectionRefusedError("Connection refused")

            # Should not raise
            send_failure_email("order-999", "Some failure")


class TestConsumerEmailIntegration:
    """Tests verifying send_failure_email is called from _process_message."""

    def test_email_sent_on_value_error(self):
        """send_failure_email should be called when ValueError is raised."""
        with (
            patch("app.consumer.send_failure_email") as mock_email,
            patch("app.consumer.process_order_payment") as mock_process,
            patch("app.consumer._update_order_status"),
        ):
            mock_process.side_effect = ValueError("Invalid payment amount")

            message_body = (
                '{"event_id": "evt-001", "event_type": "OrderCreated", '
                '"timestamp": "2024-01-01T00:00:00Z", "data": {'
                '"order_id": "order-001", "customer_id": "cust-001", '
                '"currency": "USD", "amount": 100, '
                '"items": [{"product_id": "p1", "name": "Item", "quantity": 1, "unit_price": 100}]'
                "}}"
            )

            with pytest.raises(ValueError):
                from app.consumer import _process_message

                _process_message(message_body)

            mock_email.assert_called_once_with("order-001", "Invalid payment amount")

    def test_email_sent_on_generic_exception(self):
        """send_failure_email should be called when a generic Exception is raised."""
        with (
            patch("app.consumer.send_failure_email") as mock_email,
            patch("app.consumer.process_order_payment") as mock_process,
        ):
            mock_process.side_effect = RuntimeError("Something unexpected")

            message_body = (
                '{"event_id": "evt-002", "event_type": "OrderCreated", '
                '"timestamp": "2024-01-01T00:00:00Z", "data": {'
                '"order_id": "order-002", "customer_id": "cust-002", '
                '"currency": "EUR", "amount": 500, '
                '"items": [{"product_id": "p2", "name": "Item2", "quantity": 1, "unit_price": 500}]'
                "}}"
            )

            with pytest.raises(RuntimeError):
                from app.consumer import _process_message

                _process_message(message_body)

            mock_email.assert_called_once_with("order-002", "Something unexpected")

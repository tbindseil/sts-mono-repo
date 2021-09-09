import unittest
from unittest.mock import MagicMock, patch

from src.notifications import notifications


class TestNotification(unittest.TestCase):

    def setUp(self):
        notifications.client = MagicMock()

    def test_send_notification(self):
        notifications.send_notification("recipients", "body_html", "body_text", "subject")

    def test_send_notification_rethrows(self):
        def throw_client_error(**kwargs):
            raise Exception()

        # notifications.client.send_email = MagicMock(side_effect=throw_client_error)
        notifications.client.send_email.side_effect = throw_client_error

        with self.assertRaises(Exception) as e:
            notifications.send_notificaiton("recipients", "body_html", "body_text", "subject")


def send_actual_notification(recipients, body_html, body_text, subject):
    notifications.send_notification(recipients, body_html, body_text, subject)

# from src.notifications.notifications import send_notification
#       send_notification(["tjbindseil@gmail.com"], "body_html", "body_text", "subject")

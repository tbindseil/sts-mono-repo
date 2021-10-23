import unittest
from unittest.mock import MagicMock, patch

from src.notifications import send
from src.notifications.notification import Notification


class TestNotification(unittest.TestCase):

    def setUp(self):
        send.client = MagicMock()

    def test_send_notification(self):
        send.send("recipients", Notification("body_html", "body_text", "subject"))

    def test_send_notification_rethrows(self):
        def throw_client_error(**kwargs):
            raise Exception()

        send.client.send_email.side_effect = throw_client_error

        with self.assertRaises(Exception) as e:
            send.send("recipients", Notification("body_html", "body_text", "subject"))


def send_actual_notification(recipients, body_html, body_text, subject):
    notification = Notification(subject, body_text, body_html)
    send.send(recipients, notification)

# from src.notifications.send import send
#       send(["tjbindseil@gmail.com"], "body_html", "body_text", "subject")

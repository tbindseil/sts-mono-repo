import unittest
from unittest.mock import MagicMock, patch

# from src.notifications.factory import make_accepted_notification, make_requested_notification, make_canceled_notification, make_canceled_notification
from src.notifications import send
from src.notifications.notification import Notification

class TestNotification(unittest.TestCase):

    def setUp(self):
        send.client = MagicMock()

    def test_send(self):
        send.send("recipients", Notification("body_html", "body_text", "subject"))

    def test_send_rethrows(self):
        def throw_client_error(**kwargs):
            raise Exception()

        send.client.send_email.side_effect = throw_client_error

        with self.assertRaises(Exception) as e:
            send.send("recipients", Notification("body_html", "body_text", "subject"))

    @patch('src.notifications.send.send')
    @patch('src.notifications.factory.make_accepted_notification')
    def test_send_avail_request_notification_accepted(self, mock_make_accepted_notification, mock_send):
        avail_request = MagicMock()
        avail_request.status = "ACCEPTED"
        student = self.create_mock_user('student')
        tutor = self.create_mock_user('tutor')

        ret_val = "ret_val"
        def side_effect(username):
            if username == tutor.id:
                return ret_val
            else:
                return "nah"
        mock_make_accepted_notification.side_effect = side_effect

        send.send_avail_request_notification(avail_request, student, tutor)

        mock_send.assert_called_with([student.parentEmail, student.email, tutor.parentEmail, tutor.email], ret_val)

    @patch('src.notifications.send.send')
    @patch('src.notifications.factory.make_requested_notification')
    def test_send_avail_request_notification_requested(self, mock_make_requested_notification, mock_send):
        avail_request = MagicMock()
        avail_request.status = "REQUESTED"
        student = self.create_mock_user('student')
        tutor = self.create_mock_user('tutor')

        ret_val = "ret_val"
        def side_effect(username):
            if username == student.id: # TODO order all these consistently plz
                return ret_val
            else:
                return "nah"
        mock_make_requested_notification.side_effect = side_effect

        send.send_avail_request_notification(avail_request, student, tutor)

        mock_send.assert_called_with([tutor.parentEmail, tutor.email], ret_val)

    @patch('src.notifications.send.send')
    @patch('src.notifications.factory.make_canceled_notification')
    def test_send_avail_request_notification_canceled(self, mock_make_canceled_notification, mock_send):
        avail_request = MagicMock()
        avail_request.status = "CANCELED"
        student = self.create_mock_user('student')
        tutor = self.create_mock_user('tutor')

        ret_val = "ret_val"
        def side_effect(username):
            if username == student.id:
                return ret_val
            else:
                return "nah"
        mock_make_canceled_notification.side_effect = side_effect

        send.send_avail_request_notification(avail_request, student, tutor)

        mock_send.assert_called_with([tutor.parentEmail, tutor.email], ret_val)

    @patch('src.notifications.send.send')
    @patch('src.notifications.factory.make_denied_notification')
    def test_send_avail_request_notification_denied(self, mock_make_denied_notification, mock_send):
        avail_request = MagicMock()
        avail_request.status = "DENIED"
        student = self.create_mock_user('student')
        tutor = self.create_mock_user('tutor')

        ret_val = "ret_val"
        def side_effect(username):
            if username == tutor.id:
                return ret_val
            else:
                return "nah"
        mock_make_denied_notification.side_effect = side_effect

        send.send_avail_request_notification(avail_request, student, tutor)

        mock_send.assert_called_with([student.parentEmail, student.email], ret_val)

    def create_mock_user(self, identifier):
        user = MagicMock()
        user.id = '{} - id'.format(identifier)
        user.parentEmail = '{} - parentEmail'.format(identifier)
        user.email = '{} - email'.format(identifier)
        return user



def send_actual_notification(recipients, body_html, body_text, subject):
    notification = Notification(subject, body_text, body_html)
    send.send(recipients, notification)

# from src.notifications.send import send
#       send(["tjbindseil@gmail.com"], "body_html", "body_text", "subject")

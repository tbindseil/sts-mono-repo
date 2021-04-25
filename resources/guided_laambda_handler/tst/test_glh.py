import unittest
from unittest.mock import MagicMock, patch
import json

from sts_db_utils import sts_db_utils
from src.guided_lambda_handler.guided_lambda_handler import AuthException, get_claims_from_event, GLH, response_factory, success_response_output, invalid_http_method_factory


# TODO probably need some place to put test helpers
def Any():
    class Any():
        def __eq__(self, other):
            return True
    return Any()


@patch('sqlalchemy.orm.sessionmaker')
@patch('sts_db_utils.sts_db_utils.get_database_engine')
class TestGLH(unittest.TestCase):

    http_method = "HTTP_METHOD"

    def setUp(self):
        self.magic_mock_method = MagicMock()
        self.mock_translate_input = MagicMock()
        self.mock_on_handle = MagicMock()
        self.mock_translate_output = MagicMock()
        self.glh = GLH(self.mock_translate_input, self.mock_on_handle, self.mock_translate_output)

    def test_input_is_translated_and_returned(self, mock_get_database_engine, mock_session_maker):
        event = "event"
        context = "context"
        input = "input translated"
        handled = "handled"
        expected_response_code = 200
        output = "output translated"
        expected_response = response_factory(expected_response_code, output)

        self.mock_translate_input.return_value = input
        self.mock_on_handle.return_value = handled
        self.mock_translate_output.return_value = 200, output

        actual_response = self.glh.handle(event, context)

        self.mock_translate_input.assert_called_with(event, context)
        self.mock_on_handle.assert_called_with(input, Any(), Any())
        self.mock_translate_output.assert_called_with(handled)

        self.assertEqual(actual_response, expected_response)

    def test_handler_returns_401_on_auth_exception(self, mock_get_database_engine, mock_session_maker):
        self.mock_on_handle.side_effect = AuthException

        actual_response = self.glh.handle('event', 'context')
        expected_response = response_factory(401, 'unauthorized')

        self.assertEqual(actual_response, expected_response)

    def test_handler_returns_500_on_general_exception(self, mock_get_database_engine, mock_session_maker):
        self.mock_on_handle.side_effect = Exception

        actual_response = self.glh.handle('event', 'context')
        expected_response = response_factory(500, 'service error')

        self.assertEqual(actual_response, expected_response)

    def test_session_is_closed_on_success(self, mock_get_database_engine, mock_session_maker):
        mock_Session = MagicMock()
        mock_session = MagicMock()
        mock_session_maker.return_value = mock_Session
        mock_Session.return_value = mock_session

        self.mock_translate_input.return_value = 200, 'body'
        self.glh.handle('event', 'context')
        mock_session.close.assert_called_once()

        mock_session.reset_mock()

        self.mock_on_handle.side_effect = Exception
        self.glh.handle('event', 'context')
        mock_session.close.assert_called_once()

        mock_session.reset_mock()

        self.mock_on_handle.side_effect = AuthException
        self.glh.handle('event', 'context')
        mock_session.close.assert_called_once()

    def test_session_is_committed_after_on_handle_called_successful(self, mock_get_database_engine, mock_session_maker):
        mock_Session = MagicMock()
        mock_session = MagicMock()
        mock_session_maker.return_value = mock_Session
        mock_Session.return_value = mock_session

        self.mock_translate_output.return_value = 200, "body"

        event = { 'httpMethod': self.http_method }
        context = "context"
        actual_response = self.glh.handle(event, context)
        mock_session.commit.assert_called_once()

    def test_get_claims_from_event_throws_when_token_not_present(self, mock_get_database_engine, mock_session_maker):
        event = {}

        with self.assertRaises(AuthException) as e:
            get_claims_from_event(event)


    def test_get_claims_from_event_throws_when_get_and_verify_claims_throws(self, mock_get_database_engine, mock_session_maker):
        event = {'headers': {'Authorization': 'auth_token'}}

        with patch('authentication_validation.cognito_validation.get_and_verify_claims') as mock_get_and_verify_claims:
            mock_get_and_verify_claims.side_effect = Exception
            with self.assertRaises(AuthException) as e:
                get_claims_from_event(event)

    def test_get_claims_from_event_returns_token_when_successful(self, mock_get_database_engine, mock_session_maker):
        event = {'headers': {'Authorization': 'auth_token'}}

        expected_result = "token"

        with patch('authentication_validation.cognito_validation.get_and_verify_claims') as mock_get_and_verify_claims:
            mock_get_and_verify_claims.return_value = expected_result

            actual_result = get_claims_from_event(event)
            self.assertEqual(expected_result, actual_result)

    def test_success_response_factory(self, mock_get_database_engine, mock_session_maker):
        expected = 200, "success"
        actual = success_response_output()
        self.assertEqual(expected, actual)

    def test_invalid_http_method_factory(self, mock_get_database_engine, mock_session_maker):
        valid_http_methods = ["GET", "PUT", "DELETE"]
        expected = response_factory(405, json.dumps("only " + ",".join(valid_http_methods) + " are valid"))
        actual = invalid_http_method_factory(valid_http_methods)
        self.assertEqual(expected, actual)

    def test_response_factory(self, mock_get_database_engine, mock_session_maker):
        expected_status = 200
        expected_body = "body"

        expected_response = {
            'statusCode': expected_status,
            'headers': {
                "Content-Type" : "application/json",
                "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods" : "OPTIONS,POST",
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin" : "*",
                "X-Requested-With" : "*"
            },
            'body': expected_body
        }

        actual_response = response_factory(expected_status, expected_body)

        self.assertEqual(expected_response, actual_response)

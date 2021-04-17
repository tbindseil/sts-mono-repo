import unittest
from unittest.mock import MagicMock, patch
import json

from sts_db_utils import sts_db_utils
from src.guided_lambda_handler import GuidedLambdaHanlder, AuthException, get_claims_from_event
from authentication_validation import cognito_validation


@patch('sqlalchemy.orm.sessionmaker')
@patch('sts_db_utils.sts_db_utils.get_database_engine')
class TestCognitoValidation(unittest.TestCase):

    http_method = "HTTP_METHOD"

    def setUp(self):
        self.magic_mock_method = MagicMock()
        http_method_strategies = {self.http_method: self.magic_mock_method}
        self.guided_lambda_handler = GuidedLambdaHanlder(http_method_strategies)

    def test_handler_returns_401_on_auth_exception(self, mock_get_database_engine, mock_session_maker):
        self.magic_mock_method.side_effect = AuthException

        event = { 'httpMethod': self.http_method }
        context = "context"
        response = self.guided_lambda_handler.handle(event, context)

        self.assertEqual(response['statusCode'], 401)

    def test_handler_returns_500_on_general_exception(self, mock_get_database_engine, mock_session_maker):
        self.magic_mock_method.side_effect = Exception

        event = { 'httpMethod': self.http_method }
        context = "context"
        response = self.guided_lambda_handler.handle(event, context)

        self.assertEqual(response['statusCode'], 500)

    def test_session_is_closed_on_success(self, mock_get_database_engine, mock_session_maker):
        mock_Session = MagicMock()
        mock_session = MagicMock()
        mock_session_maker.return_value = mock_Session
        mock_Session.return_value = mock_session

        response_code = 200
        response_body = "body"
        self.magic_mock_method.return_value = response_code, response_body

        event = { 'httpMethod': self.http_method }
        context = "context"
        actual_response = self.guided_lambda_handler.handle(event, context)
        mock_session.close.assert_called_once()

        mock_session.reset_mock()

        self.magic_mock_method.side_effect = Exception
        actual_response = self.guided_lambda_handler.handle(event, context)
        mock_session.close.assert_called_once()

        mock_session.reset_mock()

        self.magic_mock_method.side_effect = AuthException
        actual_response = self.guided_lambda_handler.handle(event, context)
        mock_session.close.assert_called_once()


    def test_response_code_and_body_are_returned_when_successful(self, mock_get_database_engine, mock_session_maker):
        response_code = 200
        response_body = "body"
        expected_response_body = json.dumps(response_body)
        self.magic_mock_method.return_value = response_code, response_body

        event = { 'httpMethod': self.http_method }
        context = "context"
        actual_response = self.guided_lambda_handler.handle(event, context)
        self.assertEqual(response_code, actual_response['statusCode'])
        self.assertEqual(expected_response_body, actual_response['body'])

    def test_session_is_committed_after_strategy_called_successful(self, mock_get_database_engine, mock_session_maker):
        mock_Session = MagicMock()
        mock_session = MagicMock()
        mock_session_maker.return_value = mock_Session
        mock_Session.return_value = mock_session

        response_code = 200
        response_body = "body"
        self.magic_mock_method.return_value = response_code, response_body

        event = { 'httpMethod': self.http_method }
        context = "context"
        actual_response = self.guided_lambda_handler.handle(event, context)
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

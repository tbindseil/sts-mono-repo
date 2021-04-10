import unittest
from unittest.mock import MagicMock, patch

from sts_db_utils import sts_db_utils
from src.guided_lambda_handler import GuidedLambdaHanlder, AuthException


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

    # def test_handler_returns_500_on_general_exception(self, mock_get_database_engine, mock_session_maker):

    # def test_session_is_closed_always(self, mock_get_database_engine, mock_session_maker):

    # def test_response_code_and_body_are_returned_when_successful(self, mock_get_database_engine, mock_session_maker):

    # def test_session_is_committed_after_strategy_called_successful(self, mock_get_database_engine, mock_session_maker):

import unittest
from unittest.mock import MagicMock, patch

from src.sts_db_utils import get_database_engine
from botocore.exceptions import ClientError


@patch('boto3.session.Session')
class TestGetConnectionUrl(unittest.TestCase):
    def setup_mock_client(self, mock_session):
        mock_client = MagicMock()
        mock_session.client.return_value = mock_client
        return mock_client

    def test_when_error_code_ResourceNotFoundException(self, mock_session):
        # mock_client_error = ClientError({ 'Error': {'Code', 'ResourceNotFoundException'}})
        # mock_client_error.response.return_value = { 'Error': {'Code', 'ResourceNotFoundException'}}

        # mock_client = self.setup_mock_client(mock_session)

        print("mock_session is")
        print(mock_session)

        # Session.session bull shit

        mock_client = MagicMock()
        mock_session.session.client.return_value = mock_client

        print("mock_client is")
        print(mock_client)
        mock_client.get_secret_value.side_effect = ClientError({'Error': {'Code': 'ResourceNotFoundException'}}, "test_op")

        with self.assertRaisesRegex(Exception, "The requested secret .* was not found") as e:
            get_database_engine()
        # self.assertEqual(str(e.exception), "The requested secret " + secret_name + " was not found")


        # can I just patch random methods on instances before I can even reference them




    # def test_when_error_code_InvalidRequestException(self, mock_session):
        # self.assertEqual(True, False)
# 
    # def test_when_error_code_InvalidParameterException(self, mock_session):
        # self.assertEqual(True, False)
# 
    # def test_when_SecretString_not_in_response(self, mock_session):
        # self.assertEqual(True, False)
# 
    # def test_when_successful(self, mock_session):
        # self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()

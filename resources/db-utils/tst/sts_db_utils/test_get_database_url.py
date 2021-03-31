import unittest

from src.sts_db_utils import get_database_engine


class TestGetConnectionUrl(unittest.TestCase):

    def test_when_error_code_ResourceNotFoundException(self):
        self.assertEqual(True, False)

    def test_when_error_code_InvalidRequestException(self):
        self.assertEqual(True, False)

    def test_when_error_code_InvalidParameterException(self):
        self.assertEqual(True, False)

    def test_when_SecretString_not_in_response(self):
        self.assertEqual(True, False)

    def test_when_successful(self):
        self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()

import unittest
from unittest.mock import MagicMock

# TODO do i need to worry about importing from src as top level module?
from src.authentication_validation.cognito_validation import get_and_verify_claims

# some initial thoughts:
#   instead of mocking, I could make a test only user
#       I think the only complexity this involves is to refresh the token if it expires
#   otherwise
#       I could just mock it all out
#   lastly
#       I could do both :)

# first, mock

class TestCognitoValidation(unittest.TestCase):

    def setUp(self):
        print("in setup")
        # mock_urlopen.return_value = "claims"
        # with urllib.request.urlopen(keys_url) as f:

    @patch('urllib.request.urlopen')
    def test_when_public_key_not_found_then_get_and_verify_claims_raises(self, mock_urlopen):
        mock_urlopen.return_value = "claims"
        # i think i have to patch request, then say patched_request.urlopen = MagicMock()
        claims = "claims"
        get_and_verify_claims(claims)
        self.assertEqual(True, False)

    def test_when_verify_fails_then_get_and_verify_claims_raises(self):
        self.assertEqual(True, False)

    def test_when_token_is_expired_then_get_and_verify_claims_raises(self):
        self.assertEqual(True, False)

    def test_when_unexpected_audience_then_get_and_verify_claims_raises(self):
        self.assertEqual(True, False)

    def test_when_input_valid_then_get_and_verify_claims_returns_claims(self):
        self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()

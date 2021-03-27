import unittest
from unittest.mock import MagicMock, patch

import json

# need to monkey patch urllib
# with urllib.request.urlopen(keys_url) as f:

# TODO do i need to worry about importing from src as top level module?
# from src.authentication_validation.cognito_validation import get_and_verify_claims

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
        print("")
        print("in setup")

        import urllib.request

        mock_f = MagicMock()
        mock_response = MagicMock()
        # for context manager (with syntax), see
        # https://stackoverflow.com/questions/48113538/mocking-urllib-request-urlopens-read-function-returns-magicmock-signature
        mock_f.__enter__.return_value.read.return_value = mock_response

        mock_response.decode.return_value = json.dumps({"keys": "KEYS"})

        def urlopen(url):
            return mock_f

        # monkey patch urlopen for code that runs in __init__ of authentication_validation
        urllib.request.urlopen = urlopen
        from src.authentication_validation.cognito_validation import get_and_verify_claims

    @patch('urllib.request.urlopen')
    def test_when_public_key_not_found_then_get_and_verify_claims_raises(self, mock_urlopen):
        mock_urlopen.return_value = "claims"
        # i think i have to patch request, then say patched_request.urlopen = MagicMock()
        claims = "claims"
        get_and_verify_claims(claims)
        self.assertEqual(True, False)

    #def test_when_verify_fails_then_get_and_verify_claims_raises(self):
        #self.assertEqual(True, False)

    #def test_when_token_is_expired_then_get_and_verify_claims_raises(self):
        #self.assertEqual(True, False)

    #def test_when_unexpected_audience_then_get_and_verify_claims_raises(self):
        #self.assertEqual(True, False)

    #def test_when_input_valid_then_get_and_verify_claims_returns_claims(self):
        #self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()

import unittest
from unittest.mock import MagicMock, patch

import json
import time

# imports to mock
from jose import jwk, jwt

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
@patch('jose.jwt.get_unverified_claims')
@patch('jose.jwk.construct')
@patch('jose.jwt.get_unverified_headers')
class TestCognitoValidation(unittest.TestCase):

    def setup_initial_request(self, valid_keys):
        import urllib.request

        mock_f = MagicMock()
        mock_response = MagicMock()
        # for context manager (with syntax), see
        # https://stackoverflow.com/questions/48113538/mocking-urllib-request-urlopens-read-function-returns-magicmock-signature
        mock_f.__enter__.return_value.read.return_value = mock_response

        mock_response.decode.return_value = json.dumps({"keys": [{"kid": "supposed_to_be_found"}]})

        def urlopen(url):
            return mock_f

        # monkey patch urlopen for code that runs in __init__ of authentication_validation
        urllib.request.urlopen = urlopen

        from src.authentication_validation.cognito_validation import get_and_verify_claims
        return get_and_verify_claims

    def test_when_public_key_not_found_then_get_and_verify_claims_raises(self, mock_get_unverified_headers, mock_construct, mock_get_unverified_claims):
        get_and_verify_claims = self.setup_initial_request(False)

        mock_get_unverified_headers.return_value = { 'kid': 'not_supposed_to_be_found' }

        with self.assertRaises(Exception) as e:
            get_and_verify_claims("message.encoded_signatureeee")
        self.assertEqual(str(e.exception), "Public key not found in jwks.json")

    def test_when_verify_fails_then_get_and_verify_claims_raises(self, mock_get_unverified_headers, mock_construct, mock_get_unverified_claims):
        get_and_verify_claims = self.setup_initial_request(False)

        mock_get_unverified_headers.return_value = { 'kid': 'supposed_to_be_found' }

        mock_public_key = MagicMock()
        mock_public_key.verify.return_value = False
        mock_construct.return_value = mock_public_key

        with self.assertRaises(Exception) as e:
            get_and_verify_claims("message.encoded_signatureeee")
        self.assertEqual(str(e.exception), 'Signature verification failed')

    def test_when_token_is_expired_then_get_and_verify_claims_raises(self, mock_get_unverified_headers, mock_construct, mock_get_unverified_claims):
        get_and_verify_claims = self.setup_initial_request(False)

        mock_get_unverified_headers.return_value = { 'kid': 'supposed_to_be_found' }

        mock_public_key = MagicMock()
        mock_public_key.verify.return_value = True
        mock_construct.return_value = mock_public_key

        five_seconds_ago = time.time() - 5
        claims = {'exp': five_seconds_ago}
        mock_get_unverified_claims.return_value = claims

        with self.assertRaises(Exception) as e:
            get_and_verify_claims("message.encoded_signatureeee")
        self.assertEqual(str(e.exception), 'Token is expired')

    def test_when_unexpected_audience_then_get_and_verify_claims_raises(self, mock_get_unverified_headers, mock_construct, mock_get_unverified_claims):
        get_and_verify_claims = self.setup_initial_request(False)

        mock_get_unverified_headers.return_value = { 'kid': 'supposed_to_be_found' }

        mock_public_key = MagicMock()
        mock_public_key.verify.return_value = True
        mock_construct.return_value = mock_public_key

        five_minutes_from_now = time.time() + 5 * 60
        claims = {'exp': five_minutes_from_now, 'aud': 'not_right_audience'}
        mock_get_unverified_claims.return_value = claims

        with self.assertRaises(Exception) as e:
            get_and_verify_claims("message.encoded_signatureeee")
        self.assertEqual(str(e.exception), 'Token was not issued for this audience')


    #def test_when_input_valid_then_get_and_verify_claims_returns_claims(self):
        #self.assertEqual(True, False)


if __name__ == '__main__':
    unittest.main()

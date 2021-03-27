import unittest

from authentication_validation.cognito_validation import get_and_verify_claims

# some initial thoughts:
#   instead of mocking, I could make a test only user
#       I think the only complexity this involves is to refresh the token if it expires
#   otherwise
#       I could just mock it all out
#   lastly
#       I could do both :)

# first, mock

class TestCognitoValidation(unittest.TestCase):

    def test_when_public_key_not_found_then_get_and_verify_claims_raises(self):
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

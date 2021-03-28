import time
from jose import jwk, jwt
from jose.utils import base64url_decode

from authentication_validation import keys

# from aws cognito
app_client_id = '55egf9s4qqoie5d4qodrqtolkk'


def get_and_verify_claims(token):

    # kid means key identifier
    # get the kid from the headers prior to verification
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']

    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break

    if key_index == -1:
        raise Exception("Public key not found in jwks.json")

    print("at least got here ")

    # construct the public key
    public_key = jwk.construct(keys[key_index])

    # get the last two sections of the token,
    # message and signature (encoded in base64)
    message, encoded_signature = str(token).rsplit('.', 1)

    # decode the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))

    # verify the signature
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        raise Exception('Signature verification failed')

    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)

    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        raise Exception('Token is expired')

    # and the Audience  (use claims['client_id'] if verifying an access token)
    if claims['aud'] != app_client_id:
        raise Exception('Token was not issued for this audience')

    # now we can use the claims
    return claims

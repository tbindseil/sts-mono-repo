import json
import urllib.request
import time

from jose import jwk, jwt
from jose.utils import base64url_decode

# from aws cognito
app_client_id = '1juq6mcq852eu3bho4fh6b8fc'



# really, this package's name should specify cognito since the __init__
# (one per package) is cognito specific.
# Unless I extract it into cognito init method or something..

# Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
# except in compliance with the License. A copy of the License is located at
#
#     http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under the License.

region = 'us-west-2'
userpool_id = 'us-west-2_VSZtACGzT'
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)

# instead of re-downloading the public keys every time
# we download them only on cold start
# https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
global_keys = None
def get_keys():
    # this is basically a lazy initialized singleton
    # this way we can mock its initialization without
    # having to mock all the details of its initialization
    global global_keys
    if global_keys == None:
        with urllib.request.urlopen(keys_url) as f:
            response = f.read()
        global_keys = json.loads(response.decode('utf-8'))['keys']
    return global_keys


def get_and_verify_claims(token):

    # get keys from aws
    keys = get_keys()

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

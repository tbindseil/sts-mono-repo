import json
import boto3

import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode

from models.user import User
from botocore.exceptions import ClientError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


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
userpool_id = 'us-west-2_uzjaqz0n2'
app_client_id = '55egf9s4qqoie5d4qodrqtolkk'
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)
# instead of re-downloading the public keys every time
# we download them only on cold start
# https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
with urllib.request.urlopen(keys_url) as f:
  response = f.read()
keys = json.loads(response.decode('utf-8'))['keys']


# TODO keep it DRY! this is in user-registered-lambda/lambda_function.py as well
def get_database_url():
    secret_name = "DbSecret685A0FA5-V68DtCDN2E6B"
    region_name = "us-west-2"

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name,
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            raise Exception("The requested secret " + secret_name + " was not found")
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            raise Exception("The request was invalid due to:", e)
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            raise Exception("The request had invalid params:", e)
    else:
        # Secrets Manager decrypts the secret value using the associated KMS CMK
        # Depending on whether the secret was a string or binary, only one of these fields will be populated
        if 'SecretString' not in get_secret_value_response:
            raise Exception("invalid secret")

        # extact url components
        secret_data_dict = json.loads(get_secret_value_response['SecretString'])
        engine = secret_data_dict['engine']
        username = secret_data_dict['username']
        password = secret_data_dict['password']
        host = secret_data_dict['host']
        port = str(secret_data_dict['port'])
        dbname = secret_data_dict['dbname']

        return engine + "://" + username + ":" + password + "@" + host + ":" + port + "/" + dbname


def get_and_verify_claims(token):
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
        print('Public key not found in jwks.json')
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
        print('Signature verification failed')
        raise Exception('Signature verification failed')
    print('Signature successfully verified')
    # since we passed the verification, we can now safely
    # use the unverified claims
    claims = jwt.get_unverified_claims(token)
    # additionally we can verify the token expiration
    if time.time() > claims['exp']:
        print('Token is expired')
        raise Exception('Token is expired')
    # and the Audience  (use claims['client_id'] if verifying an access token)
    if claims['aud'] != app_client_id:
        print('Token was not issued for this audience')
        raise Exception('Token was not issued for this audience')
    # now we can use the claims
    print("claims are:")
    print(claims)
    return claims


def user_to_dict(user):
    return {
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'school': user.school,
        'grade': user.grade,
        'bio': user.bio
    };


def update_user_from_request(request_body, user):
    """
    for each key that exists in intersection of request_body and user attributes,
    update the user attribute with the value from the request body
    """
    user_attributes = list(user.__dict__)
    for key, value in request_body.items():
        if key in user_attributes:
            setattr(user, key, value)

    return user


def make_response(status, body):
    return {
        'statusCode': status,
        'headers': {
            "Content-Type" : "application/json",
            "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods" : "OPTIONS,POST",
            "Access-Control-Allow-Credentials" : True,
            "Access-Control-Allow-Origin" : "*",
            "X-Requested-With" : "*"
        },
        'body': body
    }


def lambda_handler(event, context):
    """
    for get, just query for user and return
    for put or post, query for user, update with stuff from request body, return updated user
    for others, return invalid method
    """

    print("event is:")
    print(event)

    # claims = get_and_verify_claims(event["token"])

    email = event['path'].split('/')[-1]
    method = event['httpMethod']

    if not (method == 'GET' or method == 'PUT' or method == 'POST'):
        return make_response(405, json.dumps("only GET and PUT are valid"))

    # db access
    url = get_database_url()
    engine = create_engine(url, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = session.query(User).filter(User.email==email).one()

    # if method == 'PUT' or method == 'POST':
        # user = update_user_from_request(json.loads(event["body"]), user)
        # session.add(user)
        # session.commit()

    return make_response(200, json.dumps(user_to_dict(user)))



# the following is useful to make this script executable in both
# AWS Lambda and any other local environments
if __name__ == '__main__':
    # for testing locally you can enter the JWT ID Token here
    event = {'token': "eyJraWQiOiJLSjd5cDJkQ1pEemZZSzVPc1RZNVwvR2NJeVZ4RU9oVjAzQWZFT0FncXF3VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjMzcwYWRhNS0xYWY0LTRhYTYtYTcwMS1hYmY5MjE0MDc2ODIiLCJhdWQiOiI1NWVnZjlzNHFxb2llNWQ0cW9kcnF0b2xrayIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjczYTFjZjJhLTlmOTMtNDMzOS05MTMwLWMyYzgxZjQwODBlMyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjEyMTIzNzczLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl91emphcXowbjIiLCJjb2duaXRvOnVzZXJuYW1lIjoiYzM3MGFkYTUtMWFmNC00YWE2LWE3MDEtYWJmOTIxNDA3NjgyIiwiZXhwIjoxNjEyMzI0MDUzLCJpYXQiOjE2MTIzMjA0NTMsImVtYWlsIjoidGpiaW5kc2VpbC5zdHNAZ21haWwuY29tIn0.cUtidLxZVCG6C8033RT3sr7PrmCG57RYTqZRgNCUkMa7EIrdNjEiBiZPOIAkLd3PWZ2w1kzVOZP8SwsJ0CUB6FOIO5l8Wp5xs3YV1SE3J34qHRUCkLEZhuhdJK-5SmuqyqJrvuOC4p5gPs7e4PJDL8uLUPIVrr0ZiPksJaziFfZDgWPhu5FhiFdFmA_oUq1wCfbbqzJVHTGRP75hong7t7tpEiOURmQTreTQk_Rt4dEIj2T8TjZF7x1WQZWm5m01hVrzKFhnjDAaY9V01fD9eiEe6ta98vfjAoPDqjRTDrZCjHia9Ky6wmPgWhAhCH5O1eee3e_XsXGhQp76IxrbvQ"}
    lambda_handler(event, None)

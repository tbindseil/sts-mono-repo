import json
import boto3

import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode

from models.user import User
from authentication_validation.cognito_validation import get_and_verify_claims

from botocore.exceptions import ClientError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


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


def user_to_dict(user):
    return {
        # TODO do this better..
        'email': user.email,
        'cognitoId': user.cognitoId,
        'firstName': user.firstName,
        'lastName': user.lastName,
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


# TODO when problem happens, still return the headers above so I can debug without remembering stuff
def lambda_handler(event, context):
    """
    for get, just query for user and return
    for put, query for user, update with stuff from request body, return updated user
    for delete, query for user, update with stuff from request body, return updated user
    for others, return invalid method
    """

    print("event is:")
    print(event)

    cognito_id = event['path'].split('/')[-1]
    method = event['httpMethod']

    if not (method == 'GET' or method == 'PUT' or method == 'DELETE'):
        return make_response(405, json.dumps("only GET, PUT, and DELETE are valid"))

    # db access
    url = get_database_url()
    engine = create_engine(url, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    print("after get user")

    if method == 'PUT':
        token = event['headers']['Authorization'].split()[-1]

        try:
            claims = get_and_verify_claims(token)
        except Exception as e:
            print(e)
            return make_response(401, json.dumps("unauthorized"))

        print("claims is")
        print(claims)
        if claims["cognito:username"] != cognito_id:
            return make_response(401, json.dumps("unauthorized"))

        user = update_user_from_request(json.loads(event["body"]), user)
        session.add(user)
        session.commit()

    if method == 'DELETE':
        print("deleting")
        # TODO this call isn't made until user is deleted from cognito, maybe I can check that?
        session.delete(user)
        session.commit()
        print("ddelete committed")
        return make_response(200, "")

    return make_response(200, json.dumps(user_to_dict(user)))



# the following is useful to make this script executable in both
# AWS Lambda and any other local environments
if __name__ == '__main__':
    # for testing locally you can enter the JWT ID Token here
    event = {'token': ""}
    lambda_handler(event, None)

import json
import boto3

from botocore.exceptions import ClientError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from authentication_validation.cognito_validation import get_and_verify_claims
from models.user import User
from models.availability import Availability


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


def json_to_availability(body):
    avail_dict = json.loads(body)
    print("avail_dict is:")
    print(avail_dict)
    return Availability(subjects=avail_dict["subjects"], startTime=avail_dict["startTime"], endTime=avail_dict["endTime"], tutor=avail_dict["tutor"])


def availability_to_dict(availability):
    return {
        # TODO do this better..
        'startTime': str(availability.startTime),
        'endTime': str(availability.endTime),
        'subjects': availability.subjects,
        'tutor': availability.tutor,
        'id': availability.id
    }


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
    for get, use identity in auth token, and query for all availabilities for the claimed user
    for post, verify identity in auth token matches tutor in posted avail object, then save the object
    for others, return invalid method
    """

    print("event is:")
    print(event)

    method = event['httpMethod']

    if not (method == 'GET' or method == 'POST' or method == 'DELETE'):
        return make_response(405, json.dumps("only GET and POST are valid"))

    # db access
    url = get_database_url()
    engine = create_engine(url, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()

    # who are you? who who, who who?
    token = event['headers']['Authorization'].split()[-1]

    try:
        claims = get_and_verify_claims(token)
    except Exception as e:
        print(e)
        return make_response(401, json.dumps("unauthorized"))

    print("claims is")
    print(claims)
    cognito_id = claims["cognito:username"]

    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    if method == 'GET':
        # get list of all availabilities
        availabilities = []
        for a in user.availabilities:
            a_dict = availability_to_dict(a)
            availabilities.append(a_dict)
        print("availabilities are:")
        print(availabilities)
        return make_response(200, json.dumps(availabilities))

    if method == 'POST':
        # add new availability to user
        # TODO make sure there are no overlapping availabilties
        posted_availability = json_to_availability(event["body"])
        user.availabilities.append(posted_availability)
        session.add(user)
        session.commit()
        return make_response(200, json.dumps("success"))

    if method == 'DELETE':
        availability_id_to_delete = event['path'].split('/')[-1]
        print("availability_id_to_delete is")
        print(availability_id_to_delete)
        avail_to_delete = session.query(Availability).filter(Availability.id==availability_id_to_delete).one()

        # make sure the user is deleting his/her own avail
        print("cognito_id is:")
        print(cognito_id)
        print("avail_to_delete.tutor is:")
        print(avail_to_delete.tutor)
        if cognito_id != avail_to_delete.tutor:
            return make_response(401, json.dumps("unauthorized"))

        session.delete(avail_to_delete)
        session.commit()
        print("ddelete committed")
        return make_response(200, "")

    return make_response(500, "")


# the following is useful to make this script executable in both
# AWS Lambda and any other local environments
if __name__ == '__main__':
    # for testing locally you can enter the JWT ID Token here
    event = {'token': ""}
    lambda_handler(event, None)

import json
import boto3

from models.user import User
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
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'school': user.school,
        'grade': user.grade,
        'bio': user.bio
    };


def lambda_handler(event, context):
    print(event)

    # method = event['httpMethod']
    # email = event['path'].split('/')[-1]


    # db access
    url = get_database_url()
    engine = create_engine(url, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()



    # based off endpoint

    # / - GET
    # return all users

    # /{email} - GET
    # extract email
    # return user from db
    user = session.query(User).filter(User.email=="tjbindseil.sts@gmail.com").one()
    print("user_to_dict(user) is:")
    print(user_to_dict(user))
    body = json.dumps(user_to_dict(user))
    print("body is:")
    print(body)




    # /{email} - PUT
    # extract email, and other user details
    # put into database, return success
    # return error otherwise




    # /{email} - DELETE
    # probably should have a more elaborate thing around this,
    # so return error for now

    return {
        'statusCode': 200,
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


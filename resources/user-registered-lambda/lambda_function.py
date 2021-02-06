import json
import boto3

from models.user import User
from botocore.exceptions import ClientError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


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


def lambda_handler(event, context):
    url = get_database_url()
    engine = create_engine(url, echo=True)
    Session = sessionmaker(bind=engine)
    session = Session()

    print("event is")
    print(event)
    email = event['request']['userAttributes']['email']
    cognito_id = event['userName']
    confirmed_user = User(email=email, cognito_id=cognito_id)
    session.add(confirmed_user)
    session.commit()

    return event

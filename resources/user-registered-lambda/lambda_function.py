import json

from sqlalchemy.orm import sessionmaker

from sts_db_utils.sts_db_utils import get_database_engine
from models.user import User


# TODO on error don't add user to db


# TODO, I think this whole thing could make a graphql request to user-lambda, instead of doing the heavy lifting itself
def lambda_handler(event, context):
    trigger = event['triggerSource']
    if trigger == 'PostConfirmation_ConfirmForgotPassword':
        return event

    engine = get_database_engine()
    Session = sessionmaker(bind=engine)
    session = Session()

    print("event is")
    print(event)
    email = event['request']['userAttributes']['email']
    cognito_id = event['userName']
    confirmed_user = User(email=email, cognitoId=cognito_id)
    session.add(confirmed_user)
    session.commit()

    return event

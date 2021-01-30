import json

from models.user import User


def lambda_handler(event, context):
    user = User("username")
    print("user.email is:")
    print(user.email)
    print("from user registered lambda, event is:")
    print(event)

    return event

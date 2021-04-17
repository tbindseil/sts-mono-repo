import json

from guided_lambda_handler import GuidedLambdaHanlder, AuthException
from models.user import User
from models.availability import Availability


# TODO this and avail_to_dict could probably be done more genericlly in guided_lambda_handler
def json_to_availability(body):
    avail_dict = json.loads(body)
    print("avail_dict is:")
    print(avail_dict)
    return Availability(subjects=avail_dict["subjects"], startTime=avail_dict["startTime"], endTime=avail_dict["endTime"], tutor=avail_dict["tutor"])


def availability_to_dict(availability):
    return {
        'startTime': str(availability.startTime),
        'endTime': str(availability.endTime),
        'subjects': availability.subjects,
        'tutor': availability.tutor,
        'id': availability.id
    }


# TODO accept date range
def get_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    availabilities = []
    for a in user.availabilities:
        a_dict = availability_to_dict(a)
        availabilities.append(a_dict)

    return 200, availabilities


# TODO make sure there are no overlapping availabilties
def post_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    posted_availability = json_to_availability(event["body"])
    user.availabilities.append(posted_availability)
    session.add(user)

    return 200, "success"


def delete_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    availability_id_to_delete = event['path'].split('/')[-1]
    avail_to_delete = session.query(Availability).filter(Availability.id==availability_id_to_delete).one()

    if cognito_id != avail_to_delete.tutor:
        raise AuthException('can only delete own availability')

    session.delete(avail_to_delete)

    return 200, "success"


def lambda_handler(event, context):
    """
    for get, use identity in auth token, and query for all availabilities for the claimed user
    for post, verify identity in auth token matches tutor in posted avail object, then save the object
    for delete, verify identity in auth token matches tutor in avail to delete, then delete the object
    for others, return invalid method
    """

    http_method_strategies = {
            "GET": get_handler,
            "POST": post_handler,
            "DELETE": delete_handler,
    }
    guided_lambda_handler = GuidedLambdaHanlder(http_method_strategies)

    return guided_lambda_handler.handle(event, context)

from datetime import datetime

from guided_lambda_handler.guided_lambda_handler import GuidedLambdaHandler, AuthException, json_to_model, model_to_json, model_list_to_json
from models.user import User
from models.availability import Availability


# TODO accept date range
def get_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    availabilities_json = model_list_to_json(user.availabilities)

    return 200, availabilities_json


# TODO make sure there are no overlapping availabilties
def post_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    posted_availability = json_to_model(event["body"], Availability)

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

import json
from datetime import datetime

from guided_lambda_handler.guided_lambda_handler import AuthException, json_to_model, response_factory, GLH, success_response_output, invalid_http_method_factory
from models.user import User
from models.availability import Availability


def get_input_translator(event, context):
    return event['queryStringParameters']['username']


# TODO accept date range
def get_handler(input, session, get_claims):
    cognito_id = input

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]

    # ultimately, I'll need a service to validate who can see whose avails..
    # for now one can only see themselves
    if claimed_cognito_id != cognito_id:
        raise AuthException

    user = session.query(User).filter(User.cognitoId==cognito_id).one()
    return user.availabilities


def get_output_translator(raw_output):
    availabilities = raw_output

    response = {}
    for avail in availabilities:
        response[avail.id] = {
            'subjects': avail.subjects,
            'startTime': avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'endTime': avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'tutor': avail.tutor,
        }

    # TODO get rid of datetimejson crap
    return 200, json.dumps(response)


def post_input_translator(event, context):
    return json_to_model(event["body"], Availability)


# TODO make sure there are no overlapping availabilties
def post_handler(input, session, get_claims):
    posted_availability = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    user.availabilities.append(posted_availability)
    session.add(user)

    return "success"

def post_output_translator(raw_output):
    return 200, json.dumps(raw_output)


def delete_input_translator(event, context):
    return event['path'].split('/')[-1]


def delete_handler(input, session, get_claims):
    availability_id_to_delete = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    avail_to_delete = session.query(Availability).filter(Availability.id==availability_id_to_delete).one()

    if cognito_id != avail_to_delete.tutor:
        raise AuthException('can only delete own availability')

    session.delete(avail_to_delete)

    return "success"


def delete_output_translator(raw_output):
    return success_response_output()


def lambda_handler(event, context):
    """
    for get, use identity in auth token, and query for all availabilities for the claimed user
    for post, verify identity in auth token matches tutor in posted avail object, then save the object
    for delete, verify identity in auth token matches tutor in avail to delete, then delete the object
    for others, return invalid method
    """

    print("event is:")
    print(event)

    if event["httpMethod"] == "GET":
        get_glh = GLH(get_input_translator, get_handler, get_output_translator)
        return get_glh.handle(event, context)
    elif event["httpMethod"] == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    elif event["httpMethod"] == "DELETE":
        delete_glh = GLH(delete_input_translator, delete_handler, delete_output_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "PUT", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

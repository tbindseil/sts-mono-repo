import json
import jsondatetime

from datetime import datetime
import dateutil.parser
from sqlalchemy import and_, or_
from guided_lambda_handler.guided_lambda_handler import AuthException, InputException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.availability import Availability
from models.availability import AvailabilityRequest


def get_input_translator(event, context):
    qsp_map = jsondatetime.loads(event['queryStringParameters']['getAvailRequestInput'])

    return qsp_map['forAvailability'], qsp_map['fromUser'], qsp_map['forUser']


# TODO pagination - this could potentially be needed in avail lambda too
def get_handler(input, session, get_claims):
    for_availability, from_user, for_user_id = input

    for_avail_query = session.query(AvailabilityRequest).filter(AvailabilityRequest.forAvailability==for_availability)
    from_user_query = session.query(AvailabilityRequest).filter(AvailabilityRequest.fromUser==from_user)

    for_user_requests = []
    try:
        for_user = session.query(User).filter(User.cognitoId==for_user_id).one()
        for_user_avails = for_user.availabilities
        for avail in for_user_avails:
            for_user_requests.extend(avail.requests)
    except Exception as e:
        pass

    raw_output = []
    for request in for_avail_query:
        raw_output.append(request)
    for request in from_user_query:
        raw_output.append(request)
    raw_output.extend(for_user_requests)

    return raw_output

def get_output_translator(raw_output):
    availabily_requests = raw_output

    response = {}
    for avail_req in availabily_requests:
        response[avail_req.id] = {
            'fromUser': avail_req.fromUser,
            'forAvailability': avail_req.forAvailability,
            'status': avail_req.status
        }

    return 200, json.dumps(response)


def post_input_translator(event, context):
    body_dict = json.loads(event["body"])
    return AvailabilityRequest(body_dict["fromUser"], body_dict["forAvailability"])

def post_handler(input, session, get_claims):
    posted_availability_request = input

    existing_request = session.query(AvailabilityRequest).filter(AvailabilityRequest.forAvailability==posted_availability_request.forAvailability).filter(AvailabilityRequest.fromUser==posted_availability_request.fromUser).filter(AvailabilityRequest.status!='CANCELED').count() > 0

    if not existing_request:
        forAvailability = session.query(Availability).filter(Availability.id==posted_availability_request.forAvailability).one()
        forAvailability.requests.append(posted_availability_request)
        session.add(forAvailability)

    return "success"

def post_output_translator(raw_output):
    return 200, json.dumps(raw_output)


def put_input_translator(event, context):
    body_map = json.loads(event['body'])

    valid_statuses = ['REQUESTED', 'ACCEPTED', 'DENIED', 'CANCELED']
    if body_map['status'] not in valid_statuses:
        raise InputException('Invalid status, options are REQUESTED, ACCEPTED, DENIED, CANCELED')

    return body_map['forAvailability'], body_map['fromUser'], body_map['status']

def put_handler(input, session, get_claims):
    for_availability, from_user, new_status = input

    avail_req_to_update = session.query(AvailabilityRequest).filter(AvailabilityRequest.forAvailability==for_availability).filter(AvailabilityRequest.fromUser==from_user).filter(AvailabilityRequest.status!='CANCELED').one()
    avail_req_to_update.status = new_status
    session.add(avail_req_to_update)

    return avail_req_to_update

def put_output_translator(raw_output):
    updated_avail_req = raw_output
    response = {}
    response[updated_avail_req.id] = {
        'fromUser': updated_avail_req.fromUser,
        'forAvailability': updated_avail_req.forAvailability,
        'status': updated_avail_req.status
    }

    return 200, json.dumps(response)


def delete_input_translator(event, context):
    return event['path'].split('/')[-1]

def delete_handler(input, session, get_claims):
    availability_req_id_to_delete = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    avail_req_to_delete = session.query(AvailabilityRequest).filter(AvailabilityRequest.id==availability_req_id_to_delete).one()

    if cognito_id != avail_req_to_delete.fromUser:
        raise AuthException('can only delete own availability')

    session.delete(avail_req_to_delete)

    return "success"

def delete_output_translator(raw_output):
    return success_response_output()


# random thoughts for future tj
# all the glh really does is handle commit of session and handle exceptions
# exceptions could certainly be done by a composition pattern
def lambda_handler(event, context):
    """
    for get, use identity in auth token, and query for all availabilities for the claimed user
    for post, verify identity in auth token matches tutor in posted avail object, then save the object
    for delete, verify identity in auth token matches tutor in avail to delete, then delete the object
    for others, return invalid method
    """

    print("event is:")
    print(event)

    # wow does this break the plan..
    # does it though?
    path = event["path"]
    if "/status/" in path:
        get_status_glh = GLH(get_status_input_translator, get_status_handler, get_status_output_translator)
        return get_status_glh.handle(event, context)

    if event["httpMethod"] == "GET":
        get_glh = GLH(get_input_translator, get_handler, get_output_translator)
        return get_glh.handle(event, context)
    elif event["httpMethod"] == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    elif event["httpMethod"] == "PUT":
        put_glh = GLH(put_input_translator, put_handler, put_output_translator)
        return put_glh.handle(event, context)
    elif event["httpMethod"] == "DELETE":
        delete_glh = GLH(delete_input_translator, delete_handler, delete_output_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "PUT", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

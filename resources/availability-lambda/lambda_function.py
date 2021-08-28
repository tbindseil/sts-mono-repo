import json
import jsondatetime

from datetime import datetime
import dateutil.parser
from sqlalchemy import and_, or_
from guided_lambda_handler.guided_lambda_handler import AuthException, InputException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.availability import Availability


def get_input_translator(event, context):
    qsp_map = jsondatetime.loads(event['queryStringParameters']['getAvailInput'])

    if (not isinstance(qsp_map['startTime'], datetime)
            or not isinstance(qsp_map['endTime'], datetime)):
        raise InputException('startTime and endTime must be dates')

    if qsp_map['startTime'] >= qsp_map['endTime']:
        raise InputException('startTime must be before endTime')

    return qsp_map['username'], qsp_map['subject'], qsp_map['startTime'], qsp_map['endTime']


def get_handler(input, session, get_claims):
    cognito_id, subject, query_start_time, query_end_time = input

    # claims = get_claims()
    # claimed_cognito_id = claims["cognito:username"]

    # PODO, ultimately, this will ultimately need to be potentially a more complex thing,
    #     soon when users start searching for each other's availability
    # if claimed_cognito_id != cognito_id:
        # raise AuthException

    query = session.query(Availability).filter(or_(
            (and_(Availability.startTime>=query_start_time, Availability.startTime<query_end_time)),
            (and_(Availability.endTime>query_start_time, Availability.endTime<=query_end_time)),
            (and_(Availability.startTime<=query_start_time, Availability.endTime>=query_end_time))
            ))

    if cognito_id != "*":
        query = query.filter(Availability.tutor==cognito_id)
    if subject != "*":
        query = query.filter(Availability.subjects.like("%"+subject+"%"))

    return query


def get_output_translator(raw_output):
    availabilities = raw_output

    # PODO ?? looks like i don't always do it and never(?) test it?

    response = {}
    for avail in availabilities:
        response[avail.id] = {
            'subjects': avail.subjects,
            'startTime': avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'endTime': avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'tutor': avail.tutor,
        }

    return 200, json.dumps(response)


def post_input_translator(event, context):
    return json_to_model(event["body"], Availability)


def post_handler(input, session, get_claims):
    posted_availability = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    for avail in user.availabilities:
        if ((avail.startTime < posted_availability.endTime and avail.startTime >= posted_availability.startTime) or
                (avail.endTime <= posted_availability.endTime and avail.endTime > posted_availability.startTime) or
                (avail.startTime <= posted_availability.startTime and avail.endTime >= posted_availability.endTime)):
            raise Exception('Posted availability overlaps with existing availability')

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

def get_status_input_translator(event, context):
    return event['path'].split('/')[-1]

def get_status_handler(input, session, get_claims):
    availability_req_id_to_get_status = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    other_user_accepted_request_query = session.query(AvailabilityRequest).filter(AvailabilityRequest.fromUser!=cognito_id).filter(AvailabilityRequest.status=='ACCEPTED')
    if other_user_accepted_request_query.count() > 0:
        return 'CLOSED'

    user_request_query = session.query(AvailabilityRequest).filter(AvailabilityRequest.fromUser==cognito_id).filter(AvailabilityRequest.status!="DENID")
    user_has_requested = user_request_query.count() > 0

    if user_has_requested:
        user_request = user_request_query.one()

        if user_request.status == 'ACCEPTED':
            return 'ACCEPTED'

        if user_request.status == 'REQUESTED':
            return 'REQUESTED'

        if user_request.status == 'DENIED':
            return 'DENIED'
    else:
        return 'OPEN'

def get_status_output_translator(raw_output):
    return 200, json.dumps({'status': raw_output})


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
    elif event["httpMethod"] == "DELETE":
        delete_glh = GLH(delete_input_translator, delete_handler, delete_output_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

import json
import jsondatetime # is importing both this and json gonna ge messed up?

from datetime import datetime
import dateutil.parser
from sqlalchemy import and_
from guided_lambda_handler.guided_lambda_handler import AuthException, InputException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.availability import Availability


def get_input_translator(event, context):
    print('start of input translator')
    qsp_map = jsondatetime.loads(event['queryStringParameters']['getAvailInput'])
    #try:
        #qsp_map = {
            #'username': event['queryStringParameters']['username'],
            #'startTime': dateutil.parser.parse(event['queryStringParameters']['startTime'], ignoretz=True),
            # 'endTime': dateutil.parser.parse(event['queryStringParameters']['endTime'], ignoretz=True)
                #}
    #except:
        #raise InputException('startTime and endTime must be dates')

    print('after jsondatetime.loads')
    print('qsp map is:')
    print(qsp_map)
    if (not isinstance(qsp_map['startTime'], datetime)
            or not isinstance(qsp_map['endTime'], datetime)):
        raise InputException('startTime and endTime must be dates')

    print('both are dates')
    if qsp_map['startTime'] >= qsp_map['endTime']:
        raise InputException('startTime must be before endTime')

    print('both are dates')
    print('input translator returning:')
    print(qsp_map['username'])
    print(qsp_map['startTime'])
    print(qsp_map['endTime'])
    return qsp_map['username'], qsp_map['startTime'], qsp_map['endTime']


def get_handler(input, session, get_claims):
    cognito_id, query_start_time, query_end_time = input

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]

    # PODO, ultimately, this will ultimately need to be potentially a more complex thing,
    #     soon when users start searching for each other's availability
    if claimed_cognito_id != cognito_id:
        raise AuthException

    return session.query(Availability).filter(Availability.tutor==cognito_id).filter(and_(Availability.startTime>=query_start_time, Availability.startTime<=query_end_time))


def get_output_translator(raw_output):
    availabilities = raw_output

    # PODO ?? looks like i don't always do it and never(?) test it?

    response = {}
    print('output translator returning:')
    for avail in availabilities:
        response[avail.id] = {
            'subjects': avail.subjects,
            'startTime': avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'endTime': avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'tutor': avail.tutor,
        }
        print(response[avail.id])

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
        valid_http_methods = ["GET", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

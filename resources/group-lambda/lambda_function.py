import json

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory
from models.group import Group


def get_input_translator(event, context):
    return event['queryStringParameters']['echoInput']

def get_handler(input, session, get_claims):
    to_echo = input
    return to_echo

def get_output_translator(raw_output):
    to_echo = raw_output
    availabilities = raw_output

    response = {'to_echo': to_echo}
    return 200, json.dumps(response)


def post_input_translator(event, context):
    body = json.loads(event["body"])

    try:
        parentGroup = body["parentGroup"]
    except KeyError:
        parentGroup = None

    return body["groupName"], parentGroup

def post_handler(input, session, get_claims):
    groupName, parentGroup = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    group = Group(groupName, cognito_id)
    if parentGroup:
        group.parentGroup = parentGroup

    session.add(group)

    return "success"

def post_output_translator(raw_output):
    return success_response_output()


def put_input_translator(event, context):
    return event['queryStringParameters']['echoInput']

def put_handler(input, session, get_claims):
    to_echo = input
    return to_echo

def put_output_translator(raw_output):
    to_echo = raw_output
    availabilities = raw_output

    response = {'to_echo': to_echo}
    return 200, json.dumps(response)


def delete_input_translator(event, context):
    return event['queryStringParameters']['echoInput']

def delete_handler(input, session, get_claims):
    to_echo = input
    return to_echo

def delete_output_translator(raw_output):
    to_echo = raw_output
    availabilities = raw_output

    response = {'to_echo': to_echo}
    return 200, json.dumps(response)


def lambda_handler(event, context):
    """
    just echos
    """

    print("event is:")
    print(event)

    if event["httpMethod"] == "GET":
        get_glh = GLH(get_input_translator, get_handler, get_output_translator)
        return get_glh.handle(event, context)
    if event["httpMethod"] == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    if event["httpMethod"] == "PUT":
        put_glh = GLH(put_input_translator, put_handler, put_output_translator)
        return put_glh.handle(event, context)
    if event["httpMethod"] == "DELETE":
        delete_glh = GLH(delete_indelete_translator, delete_handler, delete_outdelete_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

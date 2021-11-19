import json

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory


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


def lambda_handler(event, context):
    """
    just echos
    """

    print("event is:")
    print(event)

    if event["httpMethod"] == "GET":
        get_glh = GLH(get_input_translator, get_handler, get_output_translator)
        return get_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

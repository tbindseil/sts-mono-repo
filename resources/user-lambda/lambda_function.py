import json
import copy

from guided_lambda_handler.guided_lambda_handler import AuthException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User


def input_translator(event, context):
    provided_cognito_id = event['path'].split('/')[-1]
    if event['body']:
        request_body = json.loads(event['body'])
    else:
        request_body = None

    # PODO
    # claimed_cognito_id = get_claims(token)
    # if provided_cognito_id != claimed_cognito_id:
        # raise AuthenticationException

    return provided_cognito_id, request_body



def get_handler(input, session, get_claims):
    cognito_id, request_body = input

    return session.query(User).filter(User.cognitoId==cognito_id).one()


def put_handler(input, session, get_claims):
    cognito_id, request_body = input

    user = session.query(User).filter(User.cognitoId==cognito_id).one()
    user_attributes = copy.deepcopy(user.__dict__)

    # can't change some things
    del user_attributes['id']
    del user_attributes['parentName']
    del user_attributes['parentEmail']
    del user_attributes['email']
    del user_attributes['cognitoId']
    del user_attributes['admin']
    user_attributes = list(user_attributes)

    for key, value in request_body.items():
        if key in user_attributes:
            setattr(user, key, value)

    session.add(user)
    return user


def delete_handler(input, session, get_claims):
    cognito_id, request_body = input

    user = session.query(User).filter(User.cognitoId==cognito_id).one()
    session.delete(user)
    return ""


def get_put_output_translator(raw_output):
    user = raw_output
    response = json.dumps({
        'parentName': user.parentName,
        'parentEmail': user.parentEmail,
        'email': user.email,
        'cognitoId': user.cognitoId,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'school': user.school,
        'grade': user.grade,
        'age': user.age,
        'address': user.address,
        'bio': user.bio
    })
    return 200, response


def delete_output_translator(raw_output):
    return success_response_output()


def post_input_translator(event, context):
    to_ret = json_to_model(event["body"], User)

    # stupid json parsing dates nonesense.
    to_ret.age = json.loads(event["body"])['age']

    return to_ret


def post_handler(input, session, get_claims):
    posted_user = input

    # PODO can't have jwt claims when posting user since user isn't verified yet
    #   if this api starts getting hit a lot, I will need to do something..
    # claims = get_claims()
    # claimed_cognito_id = claims["cognito:username"]
    # if claimed_cognito_id != posted_user.cognitoId:
        # raise AuthException

    session.add(posted_user)
    return "success"


def post_output_translator(raw_output):
    return success_response_output()


def lambda_handler(event, context):
    """
    for get, just query for user and return
    for put, query for user, update with stuff from request body, return updated user
    for delete, query for user, update with stuff from request body, return updated user
    for others, return invalid method
    """

    print("event is:")
    print(event)

    if event["httpMethod"] == "GET":
        get_glh = GLH(input_translator, get_handler, get_put_output_translator)
        return get_glh.handle(event, context)
    elif event["httpMethod"] == "PUT":
        put_glh = GLH(input_translator, put_handler, get_put_output_translator)
        return put_glh.handle(event, context)
    elif event["httpMethod"] == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    elif event["httpMethod"] == "DELETE":
        delete_glh = GLH(input_translator, delete_handler, delete_output_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "PUT", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

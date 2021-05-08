import json

from guided_lambda_handler.guided_lambda_handler import AuthException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.class_model import Class


def get_input_translator(event, context):
    return event['queryStringParameters']['class']


def get_handler(input, session, get_claims):
    class_id = input
    clazz = session.query(Class).filter(Class.id==class_id).one()

    # throw if requester is not student, tutor or teacher
    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]
    if claimed_cognito_id not in clazz.students and claimed_cognito_id not in clazz.tutors and claimed_cognito_id != clazz.teacher:
        raise AuthException('only students, tutors and the teacher can see the class')

    # return class
    return clazz


def get_output_translator(raw_output):
    clazz = raw_output

    response = {
        'id': clazz.id,
        'name': clazz.name,
        'teacher': clazz.teacher,
        'students': clazz.students,
        'tutors': clazz.tutots
    }
    return 200, json.dumps(response)


def post_input_translator(event, context):
    return json_to_model(event["body"], Class)


def post_handler(input, session, get_claims):
    clazz = input

    # only admins can make class
    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==claimed_cognito_id).one()
    if not claimed_user.admin:
        raise AuthException('only admin can make class')

    session.add(clazz)

    return "success"


def post_output_translator(raw_output):
    return success_response_output()


def delete_input_translator(event, context):
    return event['queryStringParameters']['class']


def delete_handler(input, session, get_claims):
    class_to_delete_id = input

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]
    requester = session.query(User).filter(User.cognitoId==claimed_cognito_id).one()
    class_to_delete = session.query(Class).filter(Class.id==class_to_delete_id).one()

    if class_to_delete.teacher != claimed_cognito_id or not requester.admin:
        raise AuthException('only teacher or admin can delete class')

    session.delete(class_to_delete)

    return "success"


def delete_output_translator(raw_output):
    return success_response_output()


def lambda_handler(event, context):

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

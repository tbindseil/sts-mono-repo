import json

from sqlalchemy import and_, or_

from guided_lambda_handler.guided_lambda_handler import AuthException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.inquiry import Inquiry


def get_input_translator(event, context):
    try:
        username = event['queryStringParameters']['username']
    except KeyError:
        username = None
    try:
        class_id = event['queryStringParameters']['classId']
    except KeyError:
        class_id = None
    return username, class_id

def get_handler(input, session, get_claims):
    username, class_id = input
    user = session.query(User).filter(User.cognitoId==username).one() if username is not None else None
    clazz = session.query(Class).filter(Class.id==class_id).one() if class_id is not None else None

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]

    if user is None:
        if claimed_cognito_id != clazz.teacher:
            raise AuthException('only teacher can see all inquiries for a class')

        inquiries = session.query(Inquiry).filter(Inquiry.classId==class_id)
    else if clazz is None:
        if claimed_cognito_id != username:
            raise AuthException('one can only see all inquiries for themselves')

        inquiries = session.query(Inquiry).filter(or_(Inquiry.forUser==username, Inquiry.fromUser==username))
    else:
        if claimed_cognito_id != username:
            raise AuthException('one can only see all inquiries for themselves')

        inquiries = session.query(Inquiry).filter(and_(Inquiry.forUser==username, Inquiry.fromUser==username))

    return inquiries


def get_output_translator(raw_output):
    inquiries = raw_output

    response = {}
    for i in inquiries:
        response[i.id] = {
            'fromUser': i.fromUser,
            'forUser': i.forUser,
            'classId': i.classId,
            'type': i.type,
            'denied': i.denied,
            'accepted': i.accepted,
            'createDate': i.createDate,
            'lastUpdatedDate': i.lastUpdatedDate
        }
    }

    return 200, json.dumps(response)


def post_input_translator(event, context):
    return json_to_model(event["body"], Inquiry)


def post_handler(input, session, get_claims):
    inquiry = input

    # a note on validation logic:
    # by the time I add the inquiry to the session, I know that the claimed user
    # is valid, the inquiry's from user is set as the claimed user, the inquiry's
    # for and from user's are different, and at least one of them is the teacher
    # for the inquiry's class.

    # in more words,
    # If I'm a teacher, I can make a referral for anyone besides myself for the
    # class(es) I am a teacher for.
    # AND
    # If I'm a student or tutor, I can request to join any class so long as I request
    # for the teacher of that class.

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]
    inquiry.fromUser = claimed_cognito_id

    clazz = session.query(Inquiry).filter(Class.id==inquiry.classId).one()
    teacher = clazz.teacher

    if inquiry.fromUser == inquiry.forUser:
        raise Exception('inquiry must involve two parties')

    if teacher != inquiry.fromUser and teacher != inquiry.forUser:
        raise AuthException('inquiry must involve teacher for inquired class')

    session.add(inquiry)
    return "sucess"


def post_output_translator(raw_output):
    return success_response_output()


def put_input_translator(event, context):
    inquiry_id = event['path'].split('/')[-1]
    request_body = json.loads(event['body'])

    return inquiry_id, request_body


def put_handler(input, session, get_claims):
    inquiry_id, request_body = input

    claims = get_claims()
    claimed_cognito_id = claims["cognito:username"]

    accepted = request_body["accepted"]
    denied = request_body["denied"]
    if (accepted and denied) or (not accepted and not denied):
        raise Exception("must accept or deny and can't do both")

    inquiry = session.query(Inquiry).filter(Inquiry.id==inquiry_id).one()

    if accepted:
        if claimed_cognito_id != inquiry.forUser:
            raise AuthException('only requested user can accept')
        inquiry.accepted = True
    else:
        if claimed_cognito_id != inquiry.forUser and claimed != inquiry.fromUser:
            raise AuthException('only requested or requesting user can deny')
        inquiry.denied = True

    session.add(inquiry)
    return "success"


def put_output_translator(raw_output):
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
    elif event["httpMethod"] == "PUT":
        put_glh = GLH(put_input_translator, put_handler, put_output_translator)
        return put_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "PUT"]
        return invalid_http_method_factory(valid_http_methods)

import json

from sqlalchemy import and_, or_

from guided_lambda_handler.guided_lambda_handler import AuthException, GLH, success_response_output, invalid_http_method_factory
from guided_lambda_handler.translators import json_to_model
from models.user import User
from models.class_inquiry import ClassInquiry, TypeEnum


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

        inquiries = session.query(ClassInquiry).filter(ClassInquiry.classId==class_id)
    else if clazz is None:
        if claimed_cognito_id != username:
            raise AuthException('one can only see all inquiries for themselves')

        inquiries = session.query(ClassInquiry).filter(or_(ClassInquiry.forUser==username, ClassInquiry.fromUser==username))
    else:
        if claimed_cognito_id != username:
            raise AuthException('one can only see all inquiries for themselves')

        inquiries = session.query(ClassInquiry).filter(and_(ClassInquiry.forUser==username, ClassInquiry.fromUser==username))

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
    return json_to_model(event["body"], ClassInquiry)


def post_handler(input, session, get_claims):
    # only for user can create request, no, teach can make referral for student
        # so if for != from, from must be teacher

    # only from user can create referal
    # only teacher for referred class can be make referal and only as from user

    inquiry = input

    if inquiry.type == TypeEnum.STUDENT_REQUEST or inquiry.type == TypeEnum.TUTOR_REQUEST:
        print("only student or tutor can make")
        # from and for are equal? what do those even mean?
    else if inquiry.type == TypeEnum.STUDENT_REFERRAL or inquiry.type == TypeEnum.TUTOR_REFERRAL
        print("only teacher can make")
        # from must be teacher of class

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

    accepted = request_body["accepted"]
    denied = request_body["denied"]
    if (accepted and denied) or (not accepted and not denied):
        raise Exception("must accept or deny and can't do both")

    inquiry = session.query(ClassInquiry).filter(ClassInquiry.id==inquiry_id).one()
    if accepted:
        inquiry.accepted = True
        # add user to class as student or tutor based on type
    else:
        inquiry.denied = True

    session.add(user)
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

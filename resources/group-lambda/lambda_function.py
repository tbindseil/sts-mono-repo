import json

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory, success_response_output
from models.user import User
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
        parentGroupId = body["parentGroup"]
    except KeyError:
        parentGroupId = None

    return body["groupName"], parentGroupId

def post_handler(input, session, get_claims):
    groupName, parentGroupId = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    group = Group(groupName, cognito_id)
    if parentGroupId:
        try:
            parentGroup = session.query(Group).filter(Group.id==parentGroupId).one()
        except:
            raise Exception('Issue adding group to parent')

        if len(parentGroup.members) > 0:
            raise Exception('Parent already has members')

        parentGroup.childrenGroups.append(group)
        session.add(parentGroup)

    session.add(group)

    return "success"

def post_output_translator(raw_output):
    return success_response_output()


def post_member_input_translator(event, context):
    return event['path'].split('/')[-3], event['path'].split('/')[-1]

def post_member_handler(input, session, get_claims):
    group_id, member_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    new_member = session.query(User).filter(User.cognitoId==member_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    if group.owner != cognito_id and claimed_user in group.admins:
        raise AuthException('can only add member if you are group owner or admin')

    group.members.append(new_member)
    session.add(group)

    return 'success'

def delete_member_handler(input, session, get_claims):
    group_id, member_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    member_to_delete = session.query(User).filter(User.cognitoId==member_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    if group.owner != cognito_id and claimed_user in group.admins:
        raise AuthException('can only remove member if you are group owner or admin')

    group.members.remove(member_to_delete)
    session.add(group)

    return 'success'

# TODO, maybe if no arg provided in GLH for output translator, then use success response output
def post_member_output_translator(raw_output):
    return success_response_output()


def post_admin_input_translator(event, context):
    return event['path'].split('/')[-3], event['path'].split('/')[-1]

def post_admin_handler(input, session, get_claims):
    group_id, admin_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    new_admin = session.query(User).filter(User.cognitoId==admin_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    if group.owner != cognito_id:
        raise AuthException('can only add group admin if you are group owner')

    group.admins.append(new_admin)
    session.add(group)

    return 'success'

def delete_admin_handler(input, session, get_claims):
    group_id, admin_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    admin_to_delete = session.query(User).filter(User.cognitoId==admin_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    if group.owner != cognito_id and claimed_user in group.admins:
        raise AuthException('can only remove admin if you are group owner')

    group.admins.remove(admin_to_delete)
    session.add(group)

    return 'success'

def post_admin_output_translator(raw_output):
    return success_response_output()


def put_input_translator(event, context):
    return event['queryStringParameters']['echoInput']

def put_handler(input, session, get_claims):
    to_echo = input
    return to_echo

def put_output_translator(raw_output):
    return success_response_output()


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
    controls groups
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

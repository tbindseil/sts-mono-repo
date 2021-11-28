import json

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory, AuthException, success_response_output
from models.user import User
from models.group import Group


def group_input_translator(event, context):
    return event['path'].split('/')[-1]

def get_handler(input, session, get_claims):
    group_id = input

    group = session.query(Group).filter(Group.id==group_id).one()

    return group;

def get_output_translator(raw_output):
    group = raw_output
    response = {
        'id': group.id,
        'name': group.name,
        'parentGroup': group.parentGroup,
        'groupOwner': group.groupOwner,
        'admins': [],
        'members': [],
        'childrenGroups': []
    }

    for admin in group.admins:
        response['admins'].append(admin.cognitoId)
    for member in group.members:
        response['members'].append(member.cognitoId)
    for child_group in group.childrenGroups:
        response['childrenGroups'].append(child_group.id)

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

    return group

def post_output_translator(raw_output):
    group = raw_output
    return 200, json.dumps({'groupId': group.id})


def group_and_entity_input_translator(event, context):
    return event['path'].split('/')[-3], event['path'].split('/')[-1]

def put_parent_handler(input, session, get_claims):
    group_id, new_parent_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    old_parent_group = session.query(Group).filter(Group.id==group.parentGroup).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    try:
        new_parent_group = session.query(Group).filter(Group.id==new_parent_id).one()
    except:
        raise Exception('Issue adding group to parent')

    if len(new_parent_group.members) > 0:
        raise Exception('Parent already has members')

    check_admin(new_parent_group.groupOwner, new_parent_group.admins, claimed_user)

    new_parent_group.childrenGroups.append(group)
    session.add(group)
    session.add(new_parent_group)
    session.add(old_parent_group)

    return 'success'

def post_member_handler(input, session, get_claims):
    group_id, member_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    new_member = session.query(User).filter(User.cognitoId==member_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    claimed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    check_admin(group.groupOwner, group.admins, claimed_user)

    if new_member not in group.members:
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

    check_admin(group.groupOwner, group.admins, claimed_user)

    group.members.remove(member_to_delete)
    session.add(group)

    return 'success'

def post_admin_handler(input, session, get_claims):
    group_id, admin_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    new_admin = session.query(User).filter(User.cognitoId==admin_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    check_owner(group.groupOwner, cognito_id)

    if new_admin not in group.admins:
        group.admins.append(new_admin)
    session.add(group)

    return 'success'

def delete_admin_handler(input, session, get_claims):
    group_id, admin_id = input

    group = session.query(Group).filter(Group.id==group_id).one()
    admin_to_delete = session.query(User).filter(User.cognitoId==admin_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    check_owner(group.groupOwner, cognito_id)

    group.admins.remove(admin_to_delete)
    session.add(group)

    return 'success'


def delete_handler(input, session, get_claims):
    group_id = input

    group = session.query(Group).filter(Group.id==group_id).one()

    claims = get_claims()
    cognito_id = claims["cognito:username"]

    check_owner(group.groupOwner, cognito_id)

    session.delete(group)

    return 'success'


def check_admin(group_owner, group_admins, claimed_user):
    if group_owner != claimed_user.cognitoId and claimed_user not in group_admins:
        raise AuthException('can only perform this action if you are group owner or admin')

def check_owner(group_owner, cognito_id):
    if group_owner != cognito_id:
        raise AuthException('can only perform this action if you are group owner')


def lambda_handler(event, context):
    """
    controls groups
    """

    print("event is:")
    print(event)

    path = event["path"]
    method = event["httpMethod"]

    if "/member/" in path:
        if method == "POST":
            post_member_glh = GLH(group_and_entity_input_translator, post_member_handler, success_response_output)
        if method == "DELETE":
            delete_member_glh = GLH(group_and_entity_input_translator, delete_member_handler, success_response_output)

    if "/admin/" in path:
        if method == "POST":
            post_admin_glh = GLH(group_and_entity_input_translator, post_admin_handler, success_response_output)
        if method == "DELETE":
            delete_admin_glh = GLH(group_and_entity_input_translator, delete_admin_handler, success_response_output)

    if "/parent/" in path:
        if method == "PUT":
            put_parent_glh = GLH(group_and_entity_input_translator, put_parent_handler, success_response_output)

    if method == "GET":
        get_glh = GLH(group_input_translator, get_handler, get_output_translator)
        return get_glh.handle(event, context)
    if method == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    if method == "DELETE":
        delete_glh = GLH(group_input_translator, delete_handler, success_response_output)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["GET", "POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

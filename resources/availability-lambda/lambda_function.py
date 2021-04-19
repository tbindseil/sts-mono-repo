import jsondatetime as json
from datetime import datetime

from guided_lambda_handler.guided_lambda_handler import GuidedLambdaHandler, AuthException
from models.user import User
from models.availability import Availability


# TODO this and avail_to_dict could probably be done more genericlly in guided_lambda_handler
# json to model
# model to json

# the below looks pretty good for request to model

# def update_user_from_request(request_body, user):
#     """
#     for each key that exists in intersection of request_body and user attributes,
#     update the user attribute with the value from the request body
#     """
#     user_attributes = list(user.__dict__) # list of keys for user attributes, id, email, cognitoId..
#     for key, value in request_body.items(): # dict_items([('email', 'tjbindseil@gmail.com'), ('firstName', 'fn'), ('lastName', 'l'), ('school', 's'), ('grade', 'g'), ('bio', 'b')])
#         if key in user_attributes:
#             setattr(user, key, value) # setattr(object_to_set_value_on, name_of_attribute, value_to_set)
#
#     return user

# a similar thing can be done for model to response

# using getattr(object_to_get_from, name_of_attribute)

# still having trouble with the array of models in a response

# also having trouble with time stamps

def availability_to_dict(availability):
    return {
        'startTime': availability.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
        'endTime': availability.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
        'subjects': availability.subjects,
        'tutor': availability.tutor,
        'id': availability.id
    }


# TODO accept date range
def get_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    availabilities = []
    for a in user.availabilities:
        a_dict = availability_to_dict(a)
        availabilities.append(a_dict)

    return 200, availabilities


# TODO make sure there are no overlapping availabilties
def post_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    posted_availability = Availability(**json.loads(event["body"])) # TODO use json_to_model
    user.availabilities.append(posted_availability)
    session.add(user)

    return 200, "success"


def delete_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    availability_id_to_delete = event['path'].split('/')[-1]
    avail_to_delete = session.query(Availability).filter(Availability.id==availability_id_to_delete).one()

    if cognito_id != avail_to_delete.tutor:
        raise AuthException('can only delete own availability')

    session.delete(avail_to_delete)

    return 200, "success"


def lambda_handler(event, context):
    """
    for get, use identity in auth token, and query for all availabilities for the claimed user
    for post, verify identity in auth token matches tutor in posted avail object, then save the object
    for delete, verify identity in auth token matches tutor in avail to delete, then delete the object
    for others, return invalid method
    """

    http_method_strategies = {
            "GET": get_handler,
            "POST": post_handler,
            "DELETE": delete_handler,
    }
    guided_lambda_handler = GuidedLambdaHanlder(http_method_strategies)

    return guided_lambda_handler.handle(event, context)

import json
import jsondatetime
import functools
from datetime import datetime
from sqlalchemy import orm

from sts_db_utils import sts_db_utils
from authentication_validation import cognito_validation


class AuthException(Exception):
    pass


def get_claims_from_event(event):
    try:
        token = event['headers']['Authorization'].split()[-1]
        return cognito_validation.get_and_verify_claims(token)
    except Exception as e:
        print('Issue getting claims, e is:')
        print(e)
        raise AuthException()


class DateTimeEncoder(json.JSONEncoder):
    def default(self, z):
        if isinstance(z, datetime):
            return z.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        else:
            return super().default(z)


def is_jsonable(value):
    try:
        json.dumps(value, cls=DateTimeEncoder)
        return True
    except:
        return False


def model_to_json(model):
    """
    take in a model object,
    strip attributes that can't be json serializable,
    return the json serialized object
    """
    model_dict = model.__dict__
    keys_to_delete = []

    for key, value in model_dict.items():
        if not is_jsonable(value):
            keys_to_delete.append(key)

    for key in keys_to_delete:
        del model_dict[key]

    return json.dumps(model_dict, cls=DateTimeEncoder)


def model_list_to_json(model_list):
    return ",".join(list(map((lambda model: model_to_json(model)), model_list)))


def json_to_model(json_str, model_class):
    return model_class(**jsondatetime.loads(json_str))


def update_model_from_json(json, model):
    return "to do"


# TJTAG - next thing is to:
# test this new avail lambda stuff in real life
# comments/cleanup
# group packages together better (maybe)
# put model_to_json stuff in translator file
# adopt in user lambda
# TODO not sure where to put this item, but I think that db utils and auth validation modules
# are only used by glh, and could therefore be absorbed into that
class GuidedLambdaHandler():

    def __init__(self, http_method_strategies):
        self.http_method_strategies = http_method_strategies

    def make_response(self, status, body):
        return {
            'statusCode': status,
            'headers': {
                "Content-Type" : "application/json",
                "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods" : "OPTIONS,POST",
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin" : "*",
                "X-Requested-With" : "*"
            },
            'body': body
        }

    def handle(self, event, context):
        try:
            engine = sts_db_utils.get_database_engine()
            Session = orm.sessionmaker(bind=engine)
            session = Session()

            # provide a mechanism to fetch claims when they are needed, but ensure that they aren't always
            # required (for cases like user registration when they won't exist
            get_claims = functools.partial(get_claims_from_event, event)

            response_code, response_body = self.http_method_strategies[event['httpMethod']](event, context, session, get_claims)
            session.commit()
        except AuthException as e:
            response_code = 401
            response_body = "unauthorized"
            session.rollback()
        except Exception as e:
            print('exception handling http request, e is:')
            print(e)
            response_code = 500
            response_body = "service error"
            session.rollback()
        finally:
            session.close()

        return self.make_response(response_code, response_body)

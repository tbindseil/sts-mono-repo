import json
import jsondatetime
import functools
import traceback
from datetime import datetime
from sqlalchemy import orm

from sts_db_utils import sts_db_utils
from authentication_validation import cognito_validation


class AuthException(Exception):
    pass


class InputException(Exception):
    pass



# TODO move to translators.py
def get_claims_from_event(event):
    try:
        token = event['headers']['Authorization'].split()[-1]
        return cognito_validation.get_and_verify_claims(token)
    except Exception as e:
        # TODO stacktrace
        # TODO do that by a logger
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
    return json.dumps(list(map((lambda model: model_to_json(model)), model_list)))


def json_to_model(json_str, model_class):
    return model_class(**jsondatetime.loads(json_str))


def update_model_from_json(json, model):
    return "to do"


def response_factory(status, body):
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


def success_response_output():
    return 200, "success"


def invalid_http_method_factory(valid_http_methods):
    return response_factory(405, json.dumps("only " + ",".join(valid_http_methods) + " are valid"))


class GLH():
    def __init__(self, translate_input, on_handle, translate_output):
        self.translate_input = translate_input
        self.on_handle = on_handle
        self.translate_output = translate_output

    def handle(self, event, context):
        try:
            engine = sts_db_utils.get_database_engine()
            Session = orm.sessionmaker(bind=engine)
            session = Session()

            # provide a mechanism to fetch claims when they are needed, but ensure that they aren't always
            # required (for cases like user registration when they won't exist)
            get_claims = functools.partial(get_claims_from_event, event)

            input = self.translate_input(event, context)

            raw_output = self.on_handle(input, session, get_claims)

            response_code, response_body = self.translate_output(raw_output)

            session.commit()
        except InputException as e:
            response_code = 400
            response_body = "bad input"
            session.rollback()
        except AuthException as e:
            response_code = 401
            response_body = "unauthorized"
            session.rollback()
        except Exception as e:
            print('exception handling http request, e is:')
            print(e)
            traceback.print_exception(type(e), e, e.__traceback__)
            response_code = 500
            response_body = "service error"
            session.rollback()
        finally:
            session.close()

        return response_factory(response_code, response_body)

import json
import jsondatetime
import functools
from datetime import datetime
from sqlalchemy import orm

from sts_db_utils import sts_db_utils
from authentication_validation import cognito_validation


class AuthException(Exception):
    pass


class InputException(Exception):
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
    return json.dumps(list(map((lambda model: model_to_json(model)), model_list)))


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

# Since the tests are failing due to the way availability is being translated to json,
# and since I realied that some models contain other models,
# I think that translating model generically is too difficult
# so, I'm thinking now that a guided lambda handler is an input translator,
# a handler, and an output translator

# the only decision that remains with the above is:
# 1) use an orchestrator to call return glh.output_translator(glh.handle(glh.input_translator(event, context)))
# 2) each handler's handle method is as follows
#
#
#
# So it seems like maybe having hearder creation in this file is incorrect
# and since I said creation, I think it outta be a builder!
class GLH():
    def __init__(self, translate_input, translate_output, on_handle):
        self.translate_input = translate_input
        self.translate_output = translate_output
        self.on_handle = on_handle

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
            response_code = 500
            response_body = "service error"
            session.rollback()
        finally:
            session.close()

        return self.make_response(response_code, response_body)


#   expectations/assumptions
#   output is json string
#   each http method will be its own full blown object (this is in order for us to have a translator for each)
#   ~~for rest apis, the handlers for each http method can be wrapped in a decorator that delegates to the correct method based on the method~~
#   no, for rest apis, the lambda itself is responsible for calling the glh for the incoming http method
#   http response codes??
#
#
#
#
#
#   ok, what about flipping it even further, passing things into the lambda instead of passing lambda things into something else
#   what has to happen
#   (currently in glh)
#   1) always return headers *always*
#   2) return 401 on auth error *always*
#   3) initialize, commit or rollback and close session *always*
#   4) validate auth tokens *always*
#   5) what to do in case of which http method
#   (currently in avail lambda)
#   1) translation from raw input
#   2) validation logic (user can only delete own avails)
#   3) translation to json output (currently broken)
#   4) business logic, basically read/write to database and compare
#
#   now add an *always* to the items above that always have to happen
#   ok, i don't think always happeneing is the right criteria,
#   its more like always in the same way, or more precisely should only be defined once
#   I markeda as such
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
            # required (for cases like user registration when they won't exist)
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

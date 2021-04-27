import json
import logging
import functools
import traceback
from sqlalchemy import orm

from sts_db_utils import sts_db_utils
from authentication_validation import cognito_validation


class AuthException(Exception):
    pass


class InputException(Exception):
    pass


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


# TODO can remove need for output translators defined in lambda_function files by making this fit the
# type of the output response(raw_output)
def success_response_output():
    return 200, "success"


def invalid_http_method_factory(valid_http_methods):
    return response_factory(405, json.dumps("only " + ",".join(valid_http_methods) + " are valid"))


def get_claims_from_event(event):
    try:
        token = event['headers']['Authorization'].split()[-1]
        return cognito_validation.get_and_verify_claims(token)
    except Exception as e:
        logging.exception('Issue getting claims, e is:' + str(e))
        raise AuthException()


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
            logging.exception('exception handling http request, e is:' + str(e))
            response_code = 500
            response_body = "service error"
            session.rollback()
        finally:
            session.close()

        return response_factory(response_code, response_body)

import json
import functools
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


class GuidedLambdaHanlder():

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
            'body': json.dumps(body)
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

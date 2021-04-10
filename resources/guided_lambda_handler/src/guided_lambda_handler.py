import json
from sqlalchemy import orm

from sts_db_utils import sts_db_utils


class AuthException(Exception):
    pass



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

            response_code, response_body = self.http_method_strategies[event['httpMethod']](event, context, session)
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

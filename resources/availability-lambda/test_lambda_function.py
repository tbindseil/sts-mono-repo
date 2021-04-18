import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from guided_lambda_handler.guided_lambda_handler import AuthException

from sts_db_utils.sts_db_utils import get_database_engine

from models import Base
from models.user import User
from models.availability import Availability

import lambda_function

class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:') # note tear down not needed since this is in memory

    def setUp(self):
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cognito_id = "cognito_id"
        test_user = User(email="email", cognitoId=self.cognito_id)

        self.session.add(test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims

    def test_get_retrieves_availabilities(self):
        avail1 = self.build_default_availability()
        avail2 = self.build_default_availability()
        avail2.startTime += timedelta(days=1)
        avail2.endTime += timedelta(days=1)

        expected_availabilities = [avail1, avail2]

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        for avail in expected_availabilities:
            user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        expected_availabilities_json = []
        for avail in user.availabilities:
            expected_availabilities_json.append(lambda_function.availability_to_dict(avail))

        response_code, actual_availabilities = lambda_function.get_handler("event", "context", self.session, self.get_claims)

        self.assertEquals(actual_availabilities, expected_availabilities_json)

    def test_post_adds_availability(self):
        avail = self.build_default_availability()

        avail.startTime = datetime(year=2020, month=1, day=15, hour=13).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        avail.endTime = datetime(year=2020, month=1, day=15, hour=14).strftime('%Y-%m-%dT%H:%M:%S.%fZ')

        expected_avail_dict = lambda_function.availability_to_dict(avail)
        expected_avail_dict["id"] = 1 # it gets set to 1 by the db / sql alchemy since its the first and only avail
        event = {"body": json.dumps(expected_avail_dict)}

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(0, len(user.availabilities))

        response_code, actual_availabilities = lambda_function.post_handler(event, "context", self.session, self.get_claims)

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        self.assertEqual(1, len(user.availabilities))
        actual_avail_dict = lambda_function.availability_to_dict(user.availabilities[0])

        # uhh date formats are a pain! hopefully this gets solved when I consolidated going from python objects to json
        # maybe this means I should learn node..
        actual_avail_dict["startTime"] = datetime.strptime(actual_avail_dict["startTime"], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        actual_avail_dict["endTime"] = datetime.strptime(actual_avail_dict["endTime"], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%dT%H:%M:%S.%fZ')

        self.assertEqual(expected_avail_dict, actual_avail_dict)

    def test_delete_removes_availability(self):
        avail = self.build_default_availability()
        event = {'path': "url/id/for/avail/to/delete/is/1"}

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        response_code, actual_availabilities = lambda_function.delete_handler(event, "context", self.session, self.get_claims)

        # gotta commit since that is what the glh does
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        self.assertEqual(0, len(user.availabilities))

    def test_delete_throws_auth_exception_when_tutor_does_not_match_id_from_token(self):
        claims = {"cognito:username": "NOT_TEST_USER_COGNITO_ID"}
        self.get_claims.return_value = claims

        avail = self.build_default_availability()
        event = {'path': "url/id/for/avail/to/delete/is/1"}

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        with self.assertRaises(AuthException) as e:
            response_code, actual_availabilities = lambda_function.delete_handler(event, "context", self.session, self.get_claims)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

    def build_default_availability(self):
        avail_start = datetime(year=2020, month=1, day=15, hour=13)
        avail_end = datetime(year=2020, month=1, day=15, hour=14)
        return Availability("subjects", avail_start, avail_end, self.cognito_id)

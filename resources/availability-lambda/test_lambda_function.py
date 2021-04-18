import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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

    def test_get_retrieves_availabilities(self):
        avail1_start = datetime(year=2020, month=1, day=15, hour=13)
        avail1_end = datetime(year=2020, month=1, day=15, hour=14)
        avail1 = Availability("subjects1", avail1_start, avail1_end, self.cognito_id)

        avail2_start = datetime(year=2020, month=2, day=15, hour=13)
        avail2_end = datetime(year=2020, month=2, day=15, hour=14)
        avail2 = Availability("subjects2", avail2_start, avail2_end, self.cognito_id)

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

        claims = {"cognito:username": self.cognito_id}
        get_claims = MagicMock()
        get_claims.return_value = claims

        response_code, actual_availabilities = lambda_function.get_handler("event", "context", self.session, get_claims)

        self.assertEquals(actual_availabilities, expected_availabilities_json)

    def test_post_adds_availability(self):
        avail_start = datetime(year=2020, month=1, day=15, hour=13).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        avail_end = datetime(year=2020, month=1, day=15, hour=14).strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        avail = Availability("subjects", avail_start, avail_end, self.cognito_id)
        expected_avail_dict = lambda_function.availability_to_dict(avail)
        expected_avail_dict["id"] = 1 # it gets set to 1 by the db / sql alchemy since its the first and only avail
        event = {"body": json.dumps(expected_avail_dict)}

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(0, len(user.availabilities))

        claims = {"cognito:username": self.cognito_id}
        get_claims = MagicMock()
        get_claims.return_value = claims

        response_code, actual_availabilities = lambda_function.post_handler(event, "context", self.session, get_claims)

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        self.assertEqual(1, len(user.availabilities))
        actual_avail_dict = lambda_function.availability_to_dict(user.availabilities[0])

        # uhh date formats are a pain! hopefully this gets solved when I consolidated going from python objects to json
        # maybe this means I should learn node..
        actual_avail_dict["startTime"] = datetime.strptime(actual_avail_dict["startTime"], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        actual_avail_dict["endTime"] = datetime.strptime(actual_avail_dict["endTime"], '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%dT%H:%M:%S.%fZ')

        self.assertEqual(expected_avail_dict, actual_avail_dict)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()
        
def post_handler(event, context, session, get_claims):
    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    posted_availability = json_to_availability(event["body"])
    user.availabilities.append(posted_availability)
    session.add(user)

    return 200, "success"

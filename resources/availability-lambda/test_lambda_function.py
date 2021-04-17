import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sts_db_utils.sts_db_utils import get_database_engine

from models import Base
from models.user import User
from models.availability import Availability

from lambda_function import get_handler, availability_to_dict

class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:')

    # now I could patch away..
    # or I could go for a sqllite version of this
    #
    # sqllite version of tests is as follows

    # make sql lite instance
    # make tables for all models

    # patch get_database_engine such that it returns an engine to the sqllite instance
    # call lambda_handler with mocked event and context

    def setUp(self):
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cognito_id = "cognito_id" # TODO should I just reference test_user.cognito_id?
        test_user = User(email="email", cognitoId=self.cognito_id, firstName="f", lastName="l", school="s", grade="g", bio="b")
        test_user.school = "s" # for some weird reason, school and grade were showing up as "('s',)" and "('g',)"
        test_user.grade = "g"

        self.session.add(test_user)
        self.session.commit()

    def test_get_adds_availability(self):
        # arrange
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
            expected_availabilities_json.append(availability_to_dict(avail))

        claims = {"cognito:username": self.cognito_id}
        get_claims = MagicMock()
        get_claims.return_value = claims

        # act
        response_code, actual_availabilities = get_handler("event", "context", self.session, get_claims)

        # assert
        self.assertEquals(actual_availabilities, expected_availabilities_json)

    # def tearDown(self): not needed since sqlite is in memory only

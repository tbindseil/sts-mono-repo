import unittest
from unittest.mock import MagicMock, patch

from sts_db_utils.sts_db_utils import get_database_engine

from models import Base


class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('mysql://root:password@127.0.0.1:3306/test', echo=True)

    def test_setup(self):
        self.assertEqual(True, True)

    @patch('sts_db_utils.sts_db_utils.get_database_engine')
    def test_get_adds_availability(self):


    # now I could patch away..
    # or I could go for a sqllite version of this
    #
    # sqllite version of tests is as follows

    # make sql lite instance
    # make tables for all models

    # patch get_database_engine such that it returns an engine to the sqllite instance
    # call lambda_handler with mocked event and context

    def setUp(self):
        Base.metadata.create_all(self.engine, checkfirst=True)

    def test_db_works(self):
        User write_user = User("ci", "e")
        session.add(write_user)
        session.commit()
        read_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    def tearDown(self):
        # destroy all tables
        tables = Base.__subclasses__()
        for t in tables:
            t.__table__.drop(self.engine)


    # so what am i testing?
    # 
    # user gets validated
    # otherwise a 401 is returned

    # GET adds availability
    # can take a date range
    # if any exception occurs, 500 is returned

    # POST adds availability
    # if it overlaps with an existing, return more pointed error (maybe 409 for conflict)
    # if any exception occurs, 500 is returned

    # DELETE removes availability
    # if any exception occurs, 500 is returned

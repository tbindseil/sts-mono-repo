import unittest
from unittest.mock import MagicMock
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base
from models.user import User

import lambda_function

class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:') # note tear down not needed since this is in memory

    def setUp(self):
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cognito_id = "cognito_id"
        test_user = User(
                email="email",
                cognitoId=self.cognito_id,
                parentName = "user.parentName",
                parentEmail = "user.parentEmail",
                firstName = "user.firstName",
                lastName = "user.lastName",
                school = "user.school",
                grade = "user.grade",
                age = "user.age",
                address = "user.address",
                bio = "user.bio",
        )

        self.session.add(test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def test_get_input_translator(self):
        expected_input = 'input'
        event = {"queryStringParameters": {'echoInput': expected_input}}

        actual_input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(expected_input, actual_input)

    def test_get_is_passthrough(self):
        expected_to_echo = 'input'
        actual_to_echo = lambda_function.get_handler(expected_to_echo, self.session, self.get_claims)
        self.assertEqual(expected_to_echo, actual_to_echo)

    def test_get_output_translator(self):
        expected_to_echo = 'to_echo'
        response = {'to_echo': expected_to_echo}
        expected_output = 200, json.dumps(response)

        actual_output = lambda_function.get_output_translator(expected_to_echo)
        self.assertEqual(expected_output, actual_output)


    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

import unittest
from unittest.mock import MagicMock

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from botocore.exceptions import ClientError

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
        self.test_user = User(
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

        self.session.add(self.test_user)
        self.session.commit()

        lambda_function.client = MagicMock()

    def test_input_translator(self):
        event = {
            'userName': self.cognito_id
        }
        result = lambda_function.input_translator(event, "context")
        self.assertEqual(result, self.cognito_id)

    def test_handler_sends_email(self):
        lambda_function.handler(self.cognito_id, self.session, "get_claims")

        lambda_function.client.send_email.assert_called_with(
            Destination={
                'ToAddresses': [self.test_user.parentEmail, self.test_user.email],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': lambda_function.CHARSET,
                        'Data': lambda_function.BODY_HTML,
                    },
                    'Text': {
                        'Charset': lambda_function.CHARSET,
                        'Data': lambda_function.BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': lambda_function.CHARSET,
                    'Data': lambda_function.SUBJECT,
                },
            },
            Source=lambda_function.SENDER,
            # If you are not using a configuration set, comment or delete the
            # following line
            # ConfigurationSetName=CONFIGURATION_SET,
        )

    def test_handler_throws_when_client_throws(self):
        lambda_function.client.send_email.side_effect = ClientError

        with self.assertRaises(Exception) as e:
            lambda_function.handler(self.cognito_id, self.session, "get_claims")

    def test_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

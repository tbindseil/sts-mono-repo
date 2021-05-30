import unittest
from unittest.mock import MagicMock
import json
import pdb

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound

from guided_lambda_handler.guided_lambda_handler import AuthException

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
        self.test_user = self.createUser()
        self.session.add(self.test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims

    def test_input_translator_returns_cognito_id(self):
        body_str = '{"email":"email@gmail.com","firstName":"fn","lastName":"l","school":"ssssss","grade":"g","bio":"b"}'
        body = json.loads(body_str)
        event = {
            'path': "cognito/id/for/request/is/" + self.cognito_id,
            'body': body_str
        }
        input = lambda_function.input_translator(event, "context")
        self.assertEqual(input, (self.cognito_id, body))

    def test_input_translator_handles_body_as_None(self):
        event = {
            'path': "cognito/id/for/request/is/" + self.cognito_id,
            'body': None
        }
        input = lambda_function.input_translator(event, "context")
        self.assertEqual(input, (self.cognito_id, None)) # probably a little fishy and maybe means that there should be separate input handler for put

    def test_get_handler_returns_user(self):
        raw_output = lambda_function.get_handler((self.cognito_id, 'request_body'), self.session, self.get_claims)
        self.assertUsersEqual(self.test_user, raw_output)

    def test_put_handler_updates_and_returns_user(self):
        updated_user_params = {
            "firstName": "gc.firstName",
            "lastName": "gc.lastName",
            "school": "gc.school",
            "grade": "gc.grade",
            "bio": "gc.bio"
        }
        updated_user = self.createUser()

        user_attributes = list(updated_user.__dict__)
        for key, value in updated_user_params.items():
            setattr(updated_user, key, value)
        input = (self.cognito_id, updated_user_params)

        raw_output = lambda_function.put_handler(input, self.session, self.get_claims)
        self.assertUsersEqual(updated_user, raw_output)

        queried_user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertUsersEqual(updated_user, queried_user)

    def test_put_handler_doesnt_update_email_id_or_admin(self):
        updated_user_params = {
            "firstName": "gc.firstName",
            "lastName": "gc.lastName",
            "school": "gc.school",
            "grade": "gc.grade",
            "cognitoId": "NEW_CI",
            "email": "NEW_EMAIL",
            "id": "NEW_ID",
            "admin": "NEW_ADMIN",
            "bio": "gc.bio"
        }
        updated_user = self.createUser()
        user_attributes = list(updated_user.__dict__)
        for key, value in updated_user_params.items():
            if key != "email" and key != "id" and key != "cognitoId" and key != "admin":
                setattr(updated_user, key, value)
        input = (self.cognito_id, updated_user_params)

        raw_output = lambda_function.put_handler(input, self.session, self.get_claims)
        self.assertUsersEqual(updated_user, raw_output)

        queried_user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertUsersEqual(updated_user, queried_user)

    def test_delete_handler_deletes(self):
        input = self.cognito_id, 'request_body'
        raw_output = lambda_function.delete_handler(input, self.session, self.get_claims)

        with self.assertRaises(NoResultFound) as e:
            queried_user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        # add user back for tear down
        self.test_user = self.createUser()
        self.session.add(self.test_user)
        self.session.commit()

    def test_delete_output_translator_returns_user(self):
        actual_response = lambda_function.delete_output_translator("raw_output")
        self.assertEqual((200, "success"), actual_response)

    def test_get_put_output_translator_returns_user(self):
        raw_output = self.test_user
        actual_response = lambda_function.get_put_output_translator(raw_output)

        expected_json = json.dumps({
            'parentName': self.test_user.parentName,
            'parentEmail': self.test_user.parentEmail,
            'email': self.test_user.email,
            'cognitoId': self.test_user.cognitoId,
            'firstName': self.test_user.firstName,
            'lastName': self.test_user.lastName,
            'school': self.test_user.school,
            'grade': self.test_user.grade,
            'age': self.test_user.age,
            'address': self.test_user.address,
            'bio': self.test_user.bio
        })

        self.assertEqual((200, expected_json), actual_response)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

    def assertUsersEqual(self, user1, user2):
        self.assertEqual(user1.email, user2.email)
        self.assertEqual(user1.cognitoId, user2.cognitoId)
        self.assertEqual(user1.firstName, user2.firstName)
        self.assertEqual(user1.lastName, user2.lastName)
        self.assertEqual(user1.school, user2.school)
        self.assertEqual(user1.grade, user2.grade)
        self.assertEqual(user1.bio, user2.bio)

    def createUser(self):
        return User(
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

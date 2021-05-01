import unittest
from unittest.mock import MagicMock
import json
import pdb

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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
        self.test_user = User(email="email", cognitoId=self.cognito_id)
        self.test_user.firstName = "user.firstName"
        self.test_user.lastName = "user.lastName"
        self.test_user.school = "user.school"
        self.test_user.grade = "user.grade"
        self.test_user.bio = "user.bio"
        self.session.add(self.test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims

    def test_input_translator_returns_cognito_id(self):
        body_str = '{"email":"tjbindseil@gmail.com","firstName":"fn","lastName":"l","school":"ssssss","grade":"g","bio":"b"}'
        body = json.loads(body_str)
        event = {
            'path': "cognito/id/for/request/is/" + self.cognito_id,
            'body': body_str
        }
        input = lambda_function.input_translator(event, "context")
        self.assertEqual(input, (self.cognito_id, body))

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
        updated_user = User(email="email", cognitoId=self.cognito_id)
        # pdb.set_trace()
        user_attributes = list(updated_user.__dict__)
        for key, value in updated_user_params.items():
            setattr(updated_user, key, value)
        input = (self.cognito_id, updated_user_params)

        raw_output = lambda_function.put_handler(input, self.session, self.get_claims)
        self.assertUsersEqual(updated_user, raw_output)

        queried_user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertUsersEqual(updated_user, queried_user)




    def test_put_handler_doesnt_update_email_id_or_admin(self):
        print("TODO")

    def test_delete_handler_deletes(self):
        print("TODO")

    def test_get_put_output_translator_returns_user(self):
        print("TODO")

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









    def est_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def est_get_input_translator(self):
        event = {"queryStringParameters": {"username": "this_is_the_cognito_id"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, "this_is_the_cognito_id")

    def est_get_retrieves_availabilities(self):
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

        raw_output = lambda_function.get_handler(self.cognito_id, self.session, self.get_claims)

        self.assertEqual(raw_output, user.availabilities)

    def est_get_output_translator(self):
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

        raw_output = user.availabilities
        output = lambda_function.get_output_translator(raw_output)

        expected_output = 200, '{"1": {"subjects": "subjects", "startTime": "2020-01-15T13:00:00.000000Z", "endTime": "2020-01-15T14:00:00.000000Z", "tutor": "cognito_id"}, "2": {"subjects": "subjects", "startTime": "2020-01-16T13:00:00.000000Z", "endTime": "2020-01-16T14:00:00.000000Z", "tutor": "cognito_id"}}'

        self.assertEqual(output, expected_output)

    def est_post_input_translator(self):
        avail = self.build_default_availability()
        event = {"body": json.dumps({
            "subjects": avail.subjects,
            "startTime": avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "endTime": avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "tutor": avail.tutor
        })}

        input = lambda_function.post_input_translator(event, "context")

        self.assertAvailEquals(avail, input)

    def est_post_adds_availability(self):
        avail = self.build_default_availability()
        event = {"body": json.dumps({
            "subjects": avail.subjects,
            "startTime": avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "endTime": avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "tutor": avail.tutor
        })}

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(0, len(user.availabilities))

        raw_output = lambda_function.post_handler(avail, self.session, self.get_claims)

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        actual_avail = user.availabilities[0]
        self.assertAvailEquals(avail, actual_avail)

    def est_post_output_translator(self):
        raw_output = "raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(actual_code, 200)
        self.assertEqual(actual_response, json.dumps(raw_output))

    def est_delete_input_translator(self):
        event = {'path': "url/id/for/avail/to/delete/is/1"}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, '1')

    def est_delete_removes_availability(self):
        avail = self.build_default_availability()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        raw_output = lambda_function.delete_handler('1', self.session, self.get_claims)

        # gotta commit since that is what the glh does
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        self.assertEqual(0, len(user.availabilities))

    def est_delete_throws_auth_exception_when_tutor_does_not_match_id_from_token(self):
        claims = {"cognito:username": "NOT_TEST_USER_COGNITO_ID"}
        self.get_claims.return_value = claims

        avail = self.build_default_availability()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.delete_handler('1', self.session, self.get_claims)

    def est_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)


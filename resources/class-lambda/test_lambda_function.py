import unittest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from guided_lambda_handler.guided_lambda_handler import AuthException
from guided_lambda_handler.translators import json_to_model

from models import Base
from models.user import User
from models.class_model import Class
from guided_lambda_handler.translators import json_to_model

import lambda_function

class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:') # note tear down not needed since this is in memory

    def setUp(self):
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cognito_id = "cognito_id"
        self.test_user = User(email="email", cognitoId=self.cognito_id)
        self.session.add(self.test_user)

        self.cognito_id_admin = "cognito_id_admin"
        self.test_user_admin = User(email="email_admin", cognitoId=self.cognito_id_admin)
        self.test_user_admin.admin = True
        self.session.add(self.test_user_admin)

        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims

        claims_admin = {"cognito:username": self.cognito_id_admin}
        self.get_claims_admin = MagicMock()
        self.get_claims_admin.return_value = claims_admin

    def test_get_input_translator(self):
        event = {"queryStringParameters": {"class": "this_is_the_class_id"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, "this_is_the_class_id")

    def test_teacher_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims)

    def test_students_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_admin)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_admin)

    def test_tutors_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.tutors.append(self.test_user_admin)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_admin)

    def test_get_class_throws_when_not_teacher_student_or_tutor(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()
        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_admin)

    def test_get_returns_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_admin)
        clazz.tutors.append(self.test_user_admin)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_admin)

        self.assertClassEquals(clazz, raw_output)

    def test_get_output_translator(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_admin)
        clazz.tutors.append(self.test_user_admin)
        clazz.id = 42
        expected_output = {
            'id': clazz.id,
            'name': clazz.name,
            'teacher': clazz.teacher,
            'students': lambda_function.get_ids(clazz.students),
            'tutors': lambda_function.get_ids(clazz.tutors)
        }

        response_code, response_body = lambda_function.get_output_translator(clazz)

        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, json.dumps(expected_output))

    def test_post_input_translator(self):
        class_params = json.dumps({
            "name": "this_is_the_class_name",
            "teacher": self.cognito_id
        })
        expected_input = json_to_model(class_params, Class)
        event = {"body": class_params}
        input = lambda_function.post_input_translator(event, "context")
        self.assertClassEquals(expected_input, input)

    def test_post_throws_when_not_admin(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.post_handler(clazz, self.session, self.get_claims)


    def test_post_saves_class(self):
        class_posted = Class(name="awesome class", teacher=self.cognito_id)

        raw_output = lambda_function.post_handler(class_posted, self.session, self.get_claims_admin)
        
        class_queried = self.session.query(Class).one()

        class_posted.id = class_queried.id
        self.assertClassEquals(class_posted, class_queried)




















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

    def tearDown(self):
        self.session.delete(self.test_user)
        self.session.delete(self.test_user_admin)
        self.session.query(Class).delete()
        self.session.commit()

    def build_default_availability(self):
        avail_start = datetime(year=2020, month=1, day=15, hour=13)
        avail_end = datetime(year=2020, month=1, day=15, hour=14)
        return Availability("subjects", avail_start, avail_end, self.cognito_id)

    def assertAvailEquals(self, expected_avail, actual_avail):
        self.assertEqual(expected_avail.subjects, actual_avail.subjects)
        self.assertEqual(expected_avail.startTime, actual_avail.startTime)
        self.assertEqual(expected_avail.endTime, actual_avail.endTime)
        self.assertEqual(expected_avail.tutor, actual_avail.tutor)

    def assertClassEquals(self, expected_class, actual_class):
        expected_student_ids = lambda_function.get_ids(expected_class.students)
        expected_tutor_ids = lambda_function.get_ids(expected_class.tutors)
        actual_student_ids = lambda_function.get_ids(actual_class.students)
        actual_tutor_ids = lambda_function.get_ids(actual_class.tutors)

        self.assertEqual(expected_class.name, actual_class.name)
        self.assertEqual(expected_class.teacher, actual_class.teacher)
        self.assertEqual(expected_student_ids, actual_student_ids)
        self.assertEqual(expected_tutor_ids, actual_tutor_ids)

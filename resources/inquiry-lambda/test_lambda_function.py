import unittest
from unittest.mock import MagicMock
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from guided_lambda_handler.guided_lambda_handler import AuthException
from guided_lambda_handler.translators import json_to_model

from models import Base
from models.user import User
from models.class_model import Class

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

        self.cognito_id_teacher = "cognito_id_teacher"
        self.test_user_teacher = User(email="email_teacher", cognitoId=self.cognito_id_teacher)
        self.test_user_teacher.admin = True
        self.session.add(self.test_user_teacher)

        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims

        claims_teacher = {"cognito:username": self.cognito_id_teacher}
        self.get_claims_teacher = MagicMock()
        self.get_claims_teacher.return_value = claims_teacher

    def test_get_input_translator_handles_missing_username(self):
        event = {"queryStringParameters": {"classId": "this_is_the_class_id"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, (None, "this_is_the_class_id"))

    def test_get_input_translator_handles_missing_class_id(self):
        event = {"queryStringParameters": {"username": "this_is_the_username"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, ("this_is_the_username", None))

    def test_get_input_translator_returns_username_and_class_id(self):
        event = {"queryStringParameters": {"username": "this_is_the_username", "classId": "this_is_the_class_id"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, ("this_is_the_username", "this_is_the_class_id"))




    def est_get_input_translator(self):
        event = {"queryStringParameters": {"class": "this_is_the_class_id"}}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, "this_is_the_class_id")

    def est_teacher_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims)

    def est_students_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_teacher)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_teacher)

    def est_tutors_can_get_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.tutors.append(self.test_user_teacher)
        self.session.add(clazz)
        self.session.commit()
        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_teacher)

    def est_get_class_throws_when_not_teacher_student_or_tutor(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()
        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_teacher)

    def est_get_returns_class(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_teacher)
        clazz.tutors.append(self.test_user_teacher)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.get_handler(clazz.id, self.session, self.get_claims_teacher)

        self.assertClassEquals(clazz, raw_output)

    def est_get_output_translator(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_teacher)
        clazz.tutors.append(self.test_user_teacher)
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

    def est_post_input_translator(self):
        class_params = json.dumps({
            "name": "this_is_the_class_name",
            "teacher": self.cognito_id
        })
        expected_input = json_to_model(class_params, Class)
        event = {"body": class_params}
        input = lambda_function.post_input_translator(event, "context")
        self.assertClassEquals(expected_input, input)

    def est_post_throws_when_not_teacher(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.post_handler(clazz, self.session, self.get_claims)


    def est_post_saves_class(self):
        class_posted = Class(name="awesome class", teacher=self.cognito_id)

        raw_output = lambda_function.post_handler(class_posted, self.session, self.get_claims_teacher)
        
        class_queried = self.session.query(Class).one()

        class_posted.id = class_queried.id
        self.assertClassEquals(class_posted, class_queried)

    def est_post_output_translator(self):
        response_code, response_body = lambda_function.post_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def est_delete_input_translator(self):
        event = {"queryStringParameters": {"class": "this_is_the_class_id"}}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, "this_is_the_class_id")

    def est_teacher_can_delete(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims_teacher)

    def est_teacher_can_delete(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

    def est_delete_throws_when_not_teacher_or_teacher(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id_teacher)
        self.session.add(clazz)
        self.session.commit()

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

    def est_delete_deleles(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

        self.assertEqual(self.session.query(Class).filter(Class.id==clazz.id).count(), 0)

    def est_delete_output_translator(self):
        response_code, response_body = lambda_function.post_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def tearDown(self):
        self.session.delete(self.test_user)
        self.session.delete(self.test_user_teacher)
        self.session.query(Class).delete()
        self.session.commit()

    def assertClassEquals(self, expected_class, actual_class):
        expected_student_ids = lambda_function.get_ids(expected_class.students)
        expected_tutor_ids = lambda_function.get_ids(expected_class.tutors)
        actual_student_ids = lambda_function.get_ids(actual_class.students)
        actual_tutor_ids = lambda_function.get_ids(actual_class.tutors)

        self.assertEqual(expected_class.name, actual_class.name)
        self.assertEqual(expected_class.teacher, actual_class.teacher)
        self.assertEqual(expected_student_ids, actual_student_ids)
        self.assertEqual(expected_tutor_ids, actual_tutor_ids)

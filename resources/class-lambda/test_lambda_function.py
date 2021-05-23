import unittest
from unittest.mock import MagicMock
import json
import itertools

from sqlalchemy import create_engine, or_
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

    def test_get_input_translator_can_handle_no_query_string_parameters(self):
        event = {"queryStringParameters": None}
        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, None)

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

        self.assertClassEquals(clazz, raw_output[0])

    def test_get_all_user_classes(self):
        class_expected_teacher = Class(name="class 1", teacher=self.cognito_id)
        self.session.add(class_expected_teacher)
        class_expected_tutor = Class(name="class2", teacher=self.cognito_id_admin)
        class_expected_tutor.tutors.append(self.test_user)
        self.session.add(class_expected_tutor)
        class_expected_student = Class(name="class3", teacher=self.cognito_id_admin)
        class_expected_student.students.append(self.test_user)
        self.session.add(class_expected_student)

        class_not_expected = Class(name="class4", teacher=self.cognito_id_admin)
        self.session.add(class_not_expected)

        self.session.commit()

        raw_output = lambda_function.get_handler(None, self.session, self.get_claims)
        expected_output = [class_expected_teacher, class_expected_tutor, class_expected_student]
        for (expected, actual) in itertools.zip_longest(expected_output, raw_output):
            self.assertClassEquals(expected, actual)

        print('starting experiment')

        queried_classes = self.session.query(Class).filter(or_(Class.teacher==self.cognito_id,
                                               Class.students.contains(self.test_user),
                                               Class.tutors.contains(self.test_user)))

        code, output = lambda_function.get_output_translator(queried_classes)
        print("output is:")
        print(output)


    def test_get_output_translator(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        clazz.students.append(self.test_user_admin)
        clazz.tutors.append(self.test_user_admin)
        clazz.id = 42
        class2 = Class(name="awesome class", teacher=self.cognito_id)
        class2.students.append(self.test_user_admin)
        class2.tutors.append(self.test_user_admin)
        class2.id = 43
        expected_output = {
            str(clazz.id): {
                'name': clazz.name,
                'teacher': clazz.teacher,
                'students': lambda_function.get_ids(clazz.students),
                'tutors': lambda_function.get_ids(clazz.tutors)
            },
            str(class2.id): {
                'name': class2.name,
                'teacher': class2.teacher,
                'students': lambda_function.get_ids(class2.students),
                'tutors': lambda_function.get_ids(class2.tutors)
            }
        }

        response_code, response_body = lambda_function.get_output_translator([clazz, class2])

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

    def test_post_output_translator(self):
        response_code, response_body = lambda_function.post_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def test_delete_input_translator(self):
        event = {"queryStringParameters": {"class": "this_is_the_class_id"}}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, "this_is_the_class_id")

    def test_admin_can_delete(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims_admin)

    def test_teacher_can_delete(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

    def test_delete_throws_when_not_teacher_or_admin(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id_admin)
        self.session.add(clazz)
        self.session.commit()

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

    def test_delete_deleles(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id)
        self.session.add(clazz)
        self.session.commit()

        raw_output = lambda_function.delete_handler(clazz.id, self.session, self.get_claims)

        self.assertEqual(self.session.query(Class).filter(Class.id==clazz.id).count(), 0)

    def test_delete_output_translator(self):
        response_code, response_body = lambda_function.post_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def tearDown(self):
        self.session.delete(self.test_user)
        self.session.delete(self.test_user_admin)
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

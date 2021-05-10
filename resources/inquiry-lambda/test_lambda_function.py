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
from models.inquiry import Inquiry, TypeEnum

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

    def test_get_by_class_throws_when_claimed_user_is_not_teacher(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id_teacher)
        self.session.add(clazz)
        self.session.commit()

        input = None, clazz.id
        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.get_handler(input, self.session, self.get_claims)

    def test_get_by_username_throws_when_claimed_user_is_not_requested(self):
        input = self.cognito_id_teacher, None
        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.get_handler(input, self.session, self.get_claims)

    def test_get_by_username_and_class_throws_when_claimed_user_is_not_requested(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id_teacher)
        self.session.add(clazz)
        self.session.commit()

        input = self.cognito_id_teacher, clazz.id
        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.get_handler(input, self.session, self.get_claims)

    def test_get_handler_gets_by_user(self):
        clazz = Class(name="awesome class", teacher=self.cognito_id_teacher)
        self.session.add(clazz)
        self.session.commit()

        inquiry_for_user = self.make_and_add_inquiry(self.session,
                                                     self.cognito_id_teacher,
                                                     self.cognito_id,
                                                     clazz.id)
        inquiry_from_user = self.make_and_add_inquiry(self.session,
                                                      self.cognito_id,
                                                      self.cognito_id_teacher,
                                                      clazz.id)
        inquiry_without_user = self.make_and_add_inquiry(self.session,
                                                         self.cognito_id_teacher,
                                                         self.cognito_id_teacher,
                                                         clazz.id)
        self.session.commit()

        input = self.cognito_id, None
        raw_output = lambda_function.get_handler(input, self.session, self.get_claims)

        expected_output = {inquiry_for_user.id: inquiry_for_user, inquiry_from_user.id: inquiry_from_user}
        for inquiry in raw_output:
            expected_inquiry = expected_output[inquiry.id]
            self.assertInquiryEqual(inquiry, expected_inquiry)
            del expected_output[inquiry.id]
        self.assertEqual(len(expected_output), 0)

    def test_get_handler_gets_by_class(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry_for_class1 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id,
                                                       class1.id)
        inquiry_for_class2 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id,
                                                       class2.id)
        self.session.commit()

        input = None, class1.id
        raw_output = lambda_function.get_handler(input, self.session, self.get_claims_teacher)

        actual_output = raw_output.one()
        expected_output = inquiry_for_class1
        self.assertInquiryEqual(actual_output, expected_output)

    def test_get_handler_gets_by_user_and_class(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry_for_class1 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id,
                                                       class1.id)
        inquiry_from_class1 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id,
                                                       self.cognito_id_teacher,
                                                       class1.id)
        inquiry_for_class2 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id,
                                                       class2.id)
        inquiry_from_class2 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id,
                                                       self.cognito_id_teacher,
                                                       class2.id)
        inquiry_neither_class1 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id_teacher,
                                                       class1.id)
        inquiry_neither_class2 = self.make_and_add_inquiry(self.session,
                                                       self.cognito_id_teacher,
                                                       self.cognito_id_teacher,
                                                       class2.id)
        self.session.commit()

        input = self.cognito_id, class1.id
        raw_output = lambda_function.get_handler(input, self.session, self.get_claims)

        expected_output = {
            inquiry_for_class1.id: inquiry_for_class1,
            inquiry_from_class1.id: inquiry_from_class1
        }
        for inquiry in raw_output:
            expected_inquiry = expected_output[inquiry.id]
            self.assertInquiryEqual(inquiry, expected_inquiry)
            del expected_output[inquiry.id]
        self.assertEqual(len(expected_output), 0)

    def test_post_input_translator(self):
        inquiry_params = json.dumps({
            "forUser": "this_is_the_forUser",
            "classId": 1,
            "type": str(TypeEnum.STUDENT)
        })
        expected_input = json_to_model(inquiry_params, Inquiry)
        event = {"body": inquiry_params}
        input = lambda_function.post_input_translator(event, "context")
        self.assertInquiryEqual(expected_input, input)

    def test_post_handler_raises_when_for_and_from_are_same(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(None,
                                            "repalced by claims",
                                            self.cognito_id,
                                            class1.id)

        with self.assertRaises(Exception) as e:
            raw_output = lambda_function.post_handler(inquiry, self.session, self.get_claims)
        self.assertEqual(str(e.exception), 'inquiry must involve two parties')

    def test_post_handler_raises_when_neither_for_nor_from_are_teacher(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(None,
                                            "repalced by claims",
                                            "not repalced by claims",
                                            class1.id)

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.post_handler(inquiry, self.session, self.get_claims)
        self.assertEqual(str(e.exception), 'inquiry must involve teacher for inquired class')

    def test_post_handler_replaces_from_with_claimed_and_saves_inquiry(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(None,
                                            "repalced by claims",
                                            self.cognito_id_teacher,
                                            class1.id)

        raw_output = lambda_function.post_handler(inquiry, self.session, self.get_claims)

        queried = self.session.query(Inquiry).filter(Inquiry.id==1).one()

        self.assertInquiryEqual(queried, inquiry)
        self.assertEqual(queried.fromUser, self.cognito_id)

    def test_post_output_translator(self):
        response_code, response_body = lambda_function.post_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def test_put_input_translator(self):
        body_str = '{"accepted":"true"}'
        body = json.loads(body_str)
        event = {
            'path': "inquiry/id/for/request/is/" + 'inquery_id',
            'body': body_str
        }
        input = lambda_function.put_input_translator(event, "context")
        self.assertEqual(input, ('inquery_id', body))

    def test_put_handler_throws_when_inquiry_is_accepted_and_denied(self):
        inquiry_id = 1
        body_both = {
            'accepted': True,
            'denied': True
        }
        body_neither = {
            'accepted': False,
            'denied': False
        }

        with self.assertRaises(Exception) as e:
            raw_output = lambda_function.put_handler((inquiry_id, body_both), self.session, self.get_claims)
        self.assertEqual(str(e.exception), "must accept or deny and can't do both")
        with self.assertRaises(Exception) as e:
            raw_output = lambda_function.put_handler((inquiry_id, body_neither), self.session, self.get_claims)
        self.assertEqual(str(e.exception), "must accept or deny and can't do both")

    def test_put_handler_allows_from_and_for_to_deny(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)

        cognito_id_other = "cognito_id_other"
        test_user_other = User(email="email_other", cognitoId=cognito_id_other)
        self.session.add(test_user_other)
        claims_other = {"cognito:username": cognito_id_other}
        get_claims_other = MagicMock()
        get_claims_other.return_value = claims_other

        self.session.commit()

        inquiry = self.make_and_add_inquiry(self.session,
                                            self.cognito_id,
                                            self.cognito_id_teacher,
                                            class1.id)
        self.session.commit()

        body = {
            'accepted': False,
            'denied': True
        }

        raw_output_from = lambda_function.put_handler((inquiry.id, body), self.session, self.get_claims)
        raw_output_for = lambda_function.put_handler((inquiry.id, body), self.session, self.get_claims_teacher)

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.put_handler((inquiry.id, body), self.session, get_claims_other)
        self.assertEqual(str(e.exception), 'only requested or requesting user can deny')

    def test_put_handler_accepts(self):
        class1 = Class(name="awesome class1", teacher=self.cognito_id_teacher)
        self.session.add(class1)
        self.session.commit()

        inquiry_accept = self.make_and_add_inquiry(self.session,
                                                   self.cognito_id,
                                                   self.cognito_id_teacher,
                                                   class1.id)
        self.session.commit()

        body_accept = {
            'accepted': True,
            'denied': False
        }

        self.assertEqual(inquiry_accept.accepted, False)
        self.assertEqual(inquiry_accept.denied, False)

        raw_output_accept = lambda_function.put_handler((inquiry_accept.id, body_accept), self.session, self.get_claims_teacher)

        self.assertEqual(inquiry_accept.accepted, True)
        self.assertEqual(inquiry_accept.denied, False)

    def test_put_handler_denies(self):
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry_deny = self.make_and_add_inquiry(self.session,
                                                   self.cognito_id,
                                                   self.cognito_id_teacher,
                                                   class2.id)
        self.session.commit()

        body_deny = {
            'accepted': False,
            'denied': True
        }

        self.assertEqual(inquiry_deny.accepted, False)
        self.assertEqual(inquiry_deny.denied, False)

        raw_output_deny = lambda_function.put_handler((inquiry_deny.id, body_deny), self.session, self.get_claims_teacher)

        self.assertEqual(inquiry_deny.accepted, False)
        self.assertEqual(inquiry_deny.denied, True)

    def test_put_handler_throws_when_accepted_by_non_for_user(self):
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(self.session,
                                            self.cognito_id_teacher,
                                            self.cognito_id,
                                            class2.id)
        self.session.commit()

        body = {
            'accepted': True,
            'denied': False
        }

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.put_handler((inquiry.id, body), self.session, self.get_claims_teacher)
        self.assertEqual(str(e.exception), 'only requested user can accept')

    def test_put_handler_adds_to_tutors_when_accepted(self):
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(self.session,
                                            self.cognito_id_teacher,
                                            self.cognito_id,
                                            class2.id,
                                            TypeEnum.TUTOR)
        self.session.commit()

        body = {
            'accepted': True,
            'denied': False
        }

        self.assertEqual(len(class2.tutors), 0)

        raw_output = lambda_function.put_handler((inquiry.id, body), self.session, self.get_claims)

        self.assertEqual(len(class2.tutors), 1)
        self.assertEqual(class2.tutors[0].cognitoId, self.cognito_id)

    def test_put_handler_adds_to_students_when_accepted(self):
        class2 = Class(name="awesome class2", teacher=self.cognito_id_teacher)
        self.session.add(class2)
        self.session.commit()

        inquiry = self.make_and_add_inquiry(self.session,
                                            self.cognito_id_teacher,
                                            self.cognito_id,
                                            class2.id,
                                            TypeEnum.STUDENT)
        self.session.commit()

        body = {
            'accepted': True,
            'denied': False
        }

        self.assertEqual(len(class2.students), 0)

        raw_output = lambda_function.put_handler((inquiry.id, body), self.session, self.get_claims)

        self.assertEqual(len(class2.students), 1)
        self.assertEqual(class2.students[0].cognitoId, self.cognito_id)

    def test_put_output_translator(self):
        response_code, response_body = lambda_function.put_output_translator("irrelevant")
        self.assertEqual(response_code, 200)
        self.assertEqual(response_body, "success")

    def tearDown(self):
        self.session.delete(self.test_user)
        self.session.delete(self.test_user_teacher)
        self.session.query(Class).delete()
        self.session.query(Inquiry).delete()
        self.session.commit()

    def make_and_add_inquiry(self, session, fromUser, forUser, class_id, type=TypeEnum.STUDENT):
        inquiry = Inquiry(forUser, class_id, type)
        inquiry.fromUser = fromUser
        if session:
            session.add(inquiry)
        return inquiry

    def assertInquiryEqual(self, actual_inquiry, expected_inquiry):
        self.assertEqual(actual_inquiry.id, expected_inquiry.id)
        self.assertEqual(actual_inquiry.fromUser, expected_inquiry.fromUser)
        self.assertEqual(actual_inquiry.forUser, expected_inquiry.forUser)
        self.assertEqual(actual_inquiry.classId, expected_inquiry.classId)
        self.assertEqual(actual_inquiry.type, expected_inquiry.type)
        self.assertEqual(actual_inquiry.denied, expected_inquiry.denied)
        self.assertEqual(actual_inquiry.accepted, expected_inquiry.accepted)
        self.assertEqual(actual_inquiry.createDate, expected_inquiry.createDate)
        self.assertEqual(actual_inquiry.lastUpdatedDate, expected_inquiry.lastUpdatedDate)

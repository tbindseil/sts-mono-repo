import unittest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
import json

import dateutil.parser

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from guided_lambda_handler.guided_lambda_handler import AuthException, InputException

from models import Base
from models.user import User
from models.availability import Availability
from models.availability_request import AvailabilityRequest

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

        # need another user with an avail
        self.another_cognito_id = "another_cognito_id"
        another_test_user = User(
                email="another_email",
                cognitoId=self.another_cognito_id,
                parentName = "another_user.parentName",
                parentEmail = "another_user.parentEmail",
                firstName = "another_user.firstName",
                lastName = "another_user.lastName",
                school = "another_user.school",
                grade = "another_user.grade",
                age = "another_user.age",
                address = "another_user.address",
                bio = "another_user.bio",
        )

        self.session.add(another_test_user)
        self.session.add(test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def test_get_input_translator(self):
        event = {"queryStringParameters": {'getAvailInput': '{"username":"this_is_the_cognito_id","subject":"math","startTime":"2021-07-11T06:00:00.000Z","endTime":"2021-07-18T05:59:59.999Z"}'}}

        expected_start_time = dateutil.parser.parse("2021-07-11T06:00:00.000Z", ignoretz=True)
        expected_end_time = dateutil.parser.parse("2021-07-18T05:59:59.999Z", ignoretz=True)

        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, ("this_is_the_cognito_id", "math", expected_start_time, expected_end_time))

    def test_get_input_translator_throws_input_exception_when_start_time_not_datetime(self):
        event = {"queryStringParameters": {'getAvailInput': '{"username":"this_is_the_cognito_id","subject":"math","startTime":"not_date_time","endTime":"2021-07-18T05:59:59.999Z"}'}}
        with self.assertRaises(InputException) as e:
            lambda_function.get_input_translator(event, "context")

    def test_get_input_translator_throws_input_exception_when_end_time_not_datetime(self):
        event = {"queryStringParameters": {'getAvailInput': '{"username":"this_is_the_cognito_id","subject":"math","startTime":"2021-07-18T05:59:59.999Z","endTime":"not_date_time"}'}}
        with self.assertRaises(InputException) as e:
            lambda_function.get_input_translator(event, "context")

    def test_get_input_translator_throws_input_excpetion_when_start_time_after_end_time(self):
        event = {"queryStringParameters": {'getAvailInput': '{"username":"this_is_the_cognito_id","subject":"math","startTime":"2021-07-18T05:59:59.999Z","endTime":"2021-07-11T06:00:00.000Z"}'}}
        with self.assertRaises(InputException) as e:
            lambda_function.get_input_translator(event, "context")

    def test_get_always_filters_based_off_time_range(self):
        avail1 = self.build_default_availability()
        avail2 = self.build_default_availability()
        avail_out_of_range = self.build_default_availability()
        avail2.startTime += timedelta(days=1)
        avail2.endTime += timedelta(days=1)
        avail_out_of_range.startTime += timedelta(days=8)
        avail_out_of_range.endTime += timedelta(days=8)

        all_availabilities = [avail1, avail2, avail_out_of_range]
        expected_availabilities = {
                avail1.startTime: avail1,
                avail2.startTime: avail2
                }

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        for avail in all_availabilities:
            user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        start_time_query = datetime(year=2020, month=1, day=14, hour=13)
        end_time_query = datetime(year=2020, month=1, day=16, hour=14)
        raw_output = lambda_function.get_handler(("*", "*", start_time_query, end_time_query), self.session, self.get_claims)

        for avail in raw_output:
            expected_avail = expected_availabilities[avail.startTime]
            self.assertAvailEquals(expected_avail, avail)
            del expected_availabilities[avail.startTime]

        self.assertEqual(len(expected_availabilities), 0)

    def test_get_conditionally_filters_username(self):
        avail1 = self.build_default_availability()
        avail2 = self.build_default_availability()
        avail2.startTime += timedelta(days=1)
        avail2.endTime += timedelta(days=1)
        expected_availabilities = {
                avail1.startTime: avail1,
                avail2.startTime: avail2
                }

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        for avail in expected_availabilities.values():
            user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        avail_different_username = self.build_default_availability()
        avail_different_username.tutor = self.another_cognito_id
        another_test_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        another_test_user.availabilities.append(avail_different_username)
        self.session.add(another_test_user)
        self.session.commit()

        start_time_query = datetime(year=2020, month=1, day=14, hour=13)
        end_time_query = datetime(year=2020, month=1, day=16, hour=14)
        raw_output = lambda_function.get_handler((self.cognito_id, "*", start_time_query, end_time_query), self.session, self.get_claims)

        for avail in raw_output:
            expected_avail = expected_availabilities[avail.startTime]
            self.assertAvailEquals(expected_avail, avail)
            del expected_availabilities[avail.startTime]

        self.assertEqual(len(expected_availabilities), 0)

    def test_get_conditionally_filters_subject(self):
        avail_user1_right_subject = self.build_default_availability()
        avail_user1_wrong_subject = self.build_default_availability()
        avail_user1_wrong_subject.startTime += timedelta(days=1)
        avail_user1_wrong_subject.endTime += timedelta(days=1)
        avail_user1_wrong_subject.subjects = 'math'

        avail_user2_right_subject = self.build_default_availability()
        avail_user2_right_subject.startTime += timedelta(days=2)
        avail_user2_right_subject.endTime += timedelta(days=2)
        avail_user2_right_subject.tutur = self.another_cognito_id
        avail_user2_wrong_subject = self.build_default_availability()
        avail_user2_wrong_subject.startTime += timedelta(days=3)
        avail_user2_wrong_subject.endTime += timedelta(days=3)
        avail_user2_wrong_subject.tutur = self.another_cognito_id
        avail_user2_wrong_subject.subjects = "science"

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail_user1_right_subject)
        user.availabilities.append(avail_user1_wrong_subject)
        self.session.add(user)
        self.session.commit()

        another_test_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        another_test_user.availabilities.append(avail_user2_right_subject)
        another_test_user.availabilities.append(avail_user2_wrong_subject)
        self.session.add(another_test_user)
        self.session.commit()

        expected_availabilities = {
                avail_user1_right_subject.startTime: avail_user1_right_subject,
                avail_user2_right_subject.startTime: avail_user2_right_subject
                }

        start_time_query = datetime(year=2020, month=1, day=14, hour=13)
        end_time_query = datetime(year=2020, month=1, day=22, hour=14)
        raw_output = lambda_function.get_handler(("*", "subjects", start_time_query, end_time_query), self.session, self.get_claims)

        for avail in raw_output:
            expected_avail = expected_availabilities[avail.startTime]
            self.assertAvailEquals(expected_avail, avail)
            del expected_availabilities[avail.startTime]

        self.assertEqual(len(expected_availabilities), 0)

    def test_get_output_translator(self):
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

        expected_output = 200, '{"1": {"subjects": "subjects", "startTime": "2020-01-15T13:00:00.000000Z", "endTime": "2020-01-15T14:00:00.000000Z", "tutor": "cognito_id", "availabilitySeries": null}, "2": {"subjects": "subjects", "startTime": "2020-01-16T13:00:00.000000Z", "endTime": "2020-01-16T14:00:00.000000Z", "tutor": "cognito_id", "availabilitySeries": null}}'

        self.assertEqual(output, expected_output)

    def test_post_input_translator(self):
        avail = self.build_default_availability()
        event = {"body": json.dumps({
            "subjects": avail.subjects,
            "startTime": avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "endTime": avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            "tutor": avail.tutor
        })}

        input = lambda_function.post_input_translator(event, "context")

        self.assertAvailEquals(avail, input)

    def test_post_adds_availability(self):
        avail = self.build_default_availability()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(0, len(user.availabilities))

        raw_output = lambda_function.post_handler(avail, self.session, self.get_claims)

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(1, len(user.availabilities))

        actual_avail = user.availabilities[0]
        self.assertAvailEquals(avail, actual_avail)

    def test_post_checks_for_overlap_with_existing_availabilities(self):
        avail = self.build_default_availability()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(avail)
        self.session.add(user)
        self.session.commit()

        with self.assertRaises(Exception) as e:
            raw_output = lambda_function.post_handler(avail, self.session, self.get_claims)
        self.assertEqual(str(e.exception), 'Posted availability overlaps with existing availability')

    def test_post_output_translator(self):
        raw_output = "raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(actual_code, 200)
        self.assertEqual(actual_response, json.dumps(raw_output))

    def test_delete_input_translator(self):
        event = {'path': "url/id/for/avail/to/delete/is/1"}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, '1')

    def test_delete_removes_availability(self):
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

    def test_delete_throws_auth_exception_when_tutor_does_not_match_id_from_token(self):
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

    def test_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def test_get_status_input_translator(self):
        event = {'path': "url/id/for/avail/to/get/status/is/1"}
        input = lambda_function.get_status_input_translator(event, "context")
        self.assertEqual(input, '1')

    def test_get_status_handler_returns_CLOSED_when_another_users_request_has_been_accepted(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_from_requestor = AvailabilityRequest(self.cognito_id, avail.id)
        avail_request_not_from_requestor = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail_request_not_from_requestor.status = 'ACCEPTED'
        self.session.add(avail_request_from_requestor)
        self.session.add(avail_request_not_from_requestor)
        self.session.commit()

        expected_status = avail, 'CLOSED'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_handler_returns_ACCEPTED_when_requesting_users_request_has_been_accepted(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_from_requestor = AvailabilityRequest(self.cognito_id, avail.id)
        avail_request_from_requestor.status = 'ACCEPTED'
        self.session.add(avail_request_from_requestor)
        self.session.commit()

        expected_status = avail, 'ACCEPTED'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_handler_returns_REQUESTED_when_requesting_users_request_has_been_requested(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_from_requestor = AvailabilityRequest(self.cognito_id, avail.id)
        avail_request_from_requestor.status = 'REQUESTED'
        self.session.add(avail_request_from_requestor)
        self.session.commit()

        expected_status = avail, 'REQUESTED'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_handler_returns_DENIED_when_requesting_users_request_has_been_denied(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_from_requestor = AvailabilityRequest(self.cognito_id, avail.id)
        avail_request_from_requestor.status = 'DENIED'
        self.session.add(avail_request_from_requestor)
        self.session.commit()

        expected_status = avail, 'DENIED'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_handler_returns_OPEN_when_no_requests_from_requesting_user(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_not_from_requestor = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail_request_not_from_requestor.status = 'DENIED'
        self.session.add(avail_request_not_from_requestor)
        self.session.commit()

        expected_status = avail, 'OPEN'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_handler_returns_OPEN_when_all_requests_from_requesting_user_are_cancelled(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_request_not_from_requestor = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail_request_not_from_requestor.status = 'DENIED'
        avail.requests.append(avail_request_not_from_requestor)
        self.session.add(avail)
        self.session.commit()

        canceled_avail_request_from_requestor = AvailabilityRequest(self.cognito_id, avail.id)
        canceled_avail_request_from_requestor.status = 'CANCELED'
        avail.requests.append(canceled_avail_request_from_requestor)
        self.session.add(avail)
        self.session.commit()

        expected_status = avail, 'OPEN'
        returned_status = lambda_function.get_status_handler('1', self.session, self.get_claims)

        self.assertEqual(expected_status, returned_status)

    def test_get_status_output_translator(self):
        avail = self.build_default_availability()
        expected_status = 'STATUS'
        actual_code, actual_response = lambda_function.get_status_output_translator((avail, expected_status))
        self.assertEqual(200, actual_code)

        expected_response = json.dumps({
            'id': avail.id,
            'subjects': avail.subjects,
            'startTime': avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'endTime': avail.endTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
            'tutor': avail.tutor,
            'status': expected_status,
        })
        self.assertEqual(expected_response, actual_response)


    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        another_test_user =  self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        self.session.delete(user)
        self.session.delete(another_test_user)
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

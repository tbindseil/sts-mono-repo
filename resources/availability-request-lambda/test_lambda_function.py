import unittest
from unittest.mock import MagicMock, patch
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


# TODO probably need some place to put test helpers
def Any():
    class Any():
        def __eq__(self, other):
            return True
    return Any()


class TestLambdaFunction(unittest.TestCase):
    # engine = create_engine('sqlite:///:memory:', echo=True) # note tear down not needed since this is in memory
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

        # this might not be needed here since I really am not doing any real permissions stuff
        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def test_get_input_translator(self):
        event = {"queryStringParameters": {'getAvailRequestInput': '{"forAvailability":"this_is_the_availability_id","fromUser":"this_is_the_from_user","forUser":"this_is_the_for_user"}'}}

        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, ("this_is_the_availability_id", "this_is_the_from_user", "this_is_the_for_user"))

    def test_get_returns_all_avail_requests_by_avail_id(self):
        avail1 = self.build_default_availability()
        avail2 = self.build_default_availability()
        avail2.startTime += timedelta(days=1) # probably could be a builder, take argument of shift(time_delta)
        avail2.endTime += timedelta(days=1)
        self.session.add(avail1)
        self.session.add(avail2)
        self.session.commit()

        avail_req1 = AvailabilityRequest(self.cognito_id, avail1.id)
        avail_req2 = AvailabilityRequest(self.cognito_id, avail2.id)
        avail1.requests.append(avail_req1)
        avail2.requests.append(avail_req2)
        self.session.add(avail1)
        self.session.add(avail2)
        self.session.commit()

        raw_output = lambda_function.get_handler((avail1.id, "", ""), self.session, self.get_claims)

        requests, avails = raw_output

        self.assertAvailRequestEquals(avail_req1, requests[0])
        self.assertEqual(len(requests), 1)
        self.assertAvailEquals(avail1, avails[avail1.id])
        self.assertEqual(len(avails), 1)

    def test_get_returns_all_avail_requests_by_from_user(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_req1 = AvailabilityRequest(self.cognito_id, avail.id)
        avail_req2 = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(avail_req1)
        avail.requests.append(avail_req2)
        self.session.add(avail)
        self.session.commit()

        raw_output = lambda_function.get_handler(("", self.cognito_id, ""), self.session, self.get_claims)

        requests, avails = raw_output

        self.assertAvailRequestEquals(avail_req1, requests[0])
        self.assertEqual(len(requests), 1)
        self.assertAvailEquals(avail, avails[avail.id])
        self.assertEqual(len(avails), 1)

    def test_get_returns_all_avail_requests_by_for_user(self):
        avail1 = self.build_default_availability()
        avail2 = self.build_default_availability()
        avail2.startTime += timedelta(days=1)
        avail2.endTime += timedelta(days=1)
        avail2.tutor = self.another_cognito_id
        self.session.add(avail1)
        self.session.add(avail2)
        self.session.commit()

        avail_req1 = AvailabilityRequest(self.cognito_id, avail1.id)
        avail_req2 = AvailabilityRequest(self.cognito_id, avail2.id)
        avail1.requests.append(avail_req1)
        avail2.requests.append(avail_req2)
        self.session.add(avail1)
        self.session.add(avail2)
        self.session.commit()

        raw_output = lambda_function.get_handler(("", "", self.cognito_id), self.session, self.get_claims)

        requests, avails = raw_output

        self.assertAvailRequestEquals(avail_req1, requests[0])
        self.assertEqual(len(requests), 1)
        self.assertAvailEquals(avail1, avails[avail1.id])
        self.assertEqual(len(avails), 1)

    def test_get_output_translator(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()

        avail_req1 = AvailabilityRequest(self.cognito_id, avail.id)
        avail_req2 = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(avail_req1)
        avail.requests.append(avail_req2)
        self.session.add(avail) # which do i need to do? as in do i also need to dd avail_req1 and two
        self.session.commit()

        raw_output = lambda_function.get_handler((avail.id, "", ""), self.session, self.get_claims)
        output = lambda_function.get_output_translator(raw_output)
        expected_output = 200, '{"1": {"fromUser": "' + self.cognito_id + '", "forAvailability": ' + str(avail.id) + ', "status": "REQUESTED", "startTime": "' + avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ') + '", "subject": "' + avail.subjects + '", "tutor": "' + avail.tutor + '"}, "2": {"fromUser": "' + self.another_cognito_id + '", "forAvailability": ' + str(avail.id) + ', "status": "REQUESTED", "startTime": "' + avail.startTime.strftime('%Y-%m-%dT%H:%M:%S.%fZ') + '", "subject": "' + avail.subjects + '", "tutor": "' + avail.tutor + '"}}'

        self.assertEqual(output, expected_output)

    def test_post_input_translator(self):
        avail = self.build_default_availability()
        expected_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        event = {"body": json.dumps({
            "forAvailability": expected_avail_req.forAvailability,
            "fromUser": expected_avail_req.fromUser
        })}

        input = lambda_function.post_input_translator(event, "context")

        self.assertAvailRequestEquals(expected_avail_req, input)

    # problematic..
    @patch('notifications.send.send_avail_request_notification')
    def test_post_adds_availability_request(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        expected_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)

        raw_output = lambda_function.post_handler(expected_avail_req, self.session, self.get_claims)
        self.session.commit()

        requesting_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        resulting_avail_req = requesting_user.requestsSent[0]
        self.assertAvailRequestEquals(expected_avail_req, resulting_avail_req)
        self.assertEqual(len(requesting_user.requestsSent), 1)

    @patch('notifications.send.send_avail_request_notification')
    def test_post_does_not_add_when_from_user_already_has_request(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        expected_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(expected_avail_req)
        self.session.add(avail)
        self.session.commit()

        avail_requests = self.session.query(Availability).filter(Availability.id==avail.id).one().requests
        self.assertEqual(len(avail_requests), 1)

        another_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)

        raw_output = lambda_function.post_handler(another_avail_req, self.session, self.get_claims)
        self.session.commit()

        requesting_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        resulting_avail_req = requesting_user.requestsSent[0]
        self.assertAvailRequestEquals(expected_avail_req, resulting_avail_req)
        self.assertEqual(len(requesting_user.requestsSent), 1)

    # problematic..
    @patch('notifications.send.send_avail_request_notification')
    def test_post_does_add_when_from_user_already_has_canceled_requests(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        canceled_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        canceled_avail_req.status = 'CANCELED'
        avail.requests.append(canceled_avail_req)
        self.session.add(avail)
        self.session.commit()

        avail_requests = self.session.query(Availability).filter(Availability.id==avail.id).one().requests
        self.assertEqual(len(avail_requests), 1)

        another_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)

        raw_output = lambda_function.post_handler(another_avail_req, self.session, self.get_claims)
        self.session.commit()

        requesting_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        resulting_avail_req = requesting_user.requestsSent[1]
        self.assertAvailRequestEquals(another_avail_req, resulting_avail_req)
        self.assertEqual(len(requesting_user.requestsSent), 2)

    @patch('notifications.send.send_avail_request_notification')
    def test_post_handler_sends_notification(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        expected_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)

        raw_output = lambda_function.post_handler(expected_avail_req, self.session, self.get_claims)
        self.session.commit()

        expected_student = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        expected_tutor = self.session.query(User).filter(User.cognitoId==avail.tutor).one()
        mock_send_avail_request_notification.assert_called_with(expected_avail_req, expected_student, expected_tutor)

    def test_post_output_translator(self):
        raw_output = "raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(actual_code, 200)
        self.assertEqual(actual_response, json.dumps(raw_output))

    def test_put_input_translator(self):
        event = {"body": json.dumps({
            "forAvailability": "forAvailability",
            "fromUser": "fromUser",
            "status": 'DENIED'
        })}

        input = lambda_function.put_input_translator(event, "context")

        self.assertEqual(('forAvailability', 'fromUser', 'DENIED'), input)

    def test_put_input_translator_throws_for_invalid_status(self):
        event = {"body": json.dumps({
            "forAvailability": "forAvailability",
            "fromUser": "fromUser",
            "status": 'INVALID_STATUS'
        })}

        with self.assertRaises(InputException) as e:
            input = lambda_function.put_input_translator(event, "context")
        self.assertEqual(str(e.exception), 'Invalid status, options are REQUESTED, ACCEPTED, DENIED, CANCELED')

    @patch('notifications.send.send_avail_request_notification')
    def test_put_handler_updates_status(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(avail_req)
        self.session.add(avail)
        self.session.commit()

        new_status = "ACCEPTED"

        self.assertNotEqual(avail_req.status, new_status)

        raw_output = lambda_function.put_handler((avail.id, self.another_cognito_id, new_status), self.session, self.get_claims)
        self.session.commit()

        updated_avail_req = self.session.query(AvailabilityRequest).filter(AvailabilityRequest.id==avail_req.id).one()
        self.assertEqual(updated_avail_req.status, new_status)

    @patch('notifications.send.send_avail_request_notification')
    def test_put_handler_sends_notification(self, mock_send_avail_request_notification):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(avail_req)
        self.session.add(avail)
        self.session.commit()

        new_status = "ACCEPTED"

        raw_output = lambda_function.put_handler((avail.id, self.another_cognito_id, new_status), self.session, self.get_claims)
        self.session.commit()

        expected_student = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        expected_tutor = self.session.query(User).filter(User.cognitoId==avail.tutor).one()
        mock_send_avail_request_notification.assert_called_with(avail_req, expected_student, expected_tutor)

    def test_put_output_translator(self):
        avail_req = AvailabilityRequest(self.cognito_id, 1)
        avail_req.id = 42

        output = lambda_function.put_output_translator(avail_req)
        self.assertEqual(output, (200, '{"42": {"fromUser": "cognito_id", "forAvailability": 1, "status": "REQUESTED"}}'))

    def test_delete_input_translator(self):
        event = {'path': "url/id/for/avail_req/to/delete/is/42"}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, '42')

    def test_delete_removes_availability_request(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        avail_req = AvailabilityRequest(self.cognito_id, avail.id)
        avail.requests.append(avail_req)
        self.session.add(avail)
        self.session.commit()

        avail_request = self.session.query(AvailabilityRequest).filter(AvailabilityRequest.id==avail_req.id).one()

        raw_output = lambda_function.delete_handler(avail_req.id, self.session, self.get_claims)
        self.session.commit()

        avail_req_count = self.session.query(AvailabilityRequest).count()
        self.assertEqual(avail_req_count, 0)

    def test_delete_throws_when_from_user_is_not_requester(self):
        avail = self.build_default_availability()
        self.session.add(avail)
        self.session.commit()
        avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        avail.requests.append(avail_req)
        self.session.add(avail)
        self.session.commit()

        avail_request = self.session.query(AvailabilityRequest).filter(AvailabilityRequest.id==avail_req.id).one()

        with self.assertRaises(AuthException) as e:
            raw_output = lambda_function.delete_handler('1', self.session, self.get_claims)
        self.assertEqual(str(e.exception), 'can only delete own availability')

    def test_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        another_test_user =  self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()

        # interesting observation,
        # without intermediate commit, I get a warning that avail requests are expected to be deleted, but arent'
        # this is a result of cascading delete behavior on both users,
        # user and another user ultimately cascade when deleted to delete the same avail req
        # (one user is student other is tutor)
        # but, if I commit first, the ORM(?) gets rid of avail req after first commit
        # and doesn't expect to find it after second
        self.session.delete(another_test_user)
        self.session.commit()
        self.session.delete(user)
        self.session.commit()

    def build_default_availability(self):
        avail_start = datetime(year=2020, month=1, day=15, hour=13)
        avail_end = datetime(year=2020, month=1, day=15, hour=14)
        return Availability("subjects", avail_start, avail_end, self.cognito_id)

    def assertAvailRequestEquals(self, expected_avail_request, actual_avail_request):
        self.assertEqual(expected_avail_request.id, actual_avail_request.id)
        self.assertEqual(expected_avail_request.fromUser, actual_avail_request.fromUser)
        self.assertEqual(expected_avail_request.forAvailability, actual_avail_request.forAvailability)
        self.assertEqual(expected_avail_request.status, actual_avail_request.status)

    def assertAvailEquals(self, expected_avail, actual_avail):
        self.assertEqual(expected_avail.subjects, actual_avail.subjects)
        self.assertEqual(expected_avail.startTime, actual_avail.startTime)
        self.assertEqual(expected_avail.endTime, actual_avail.endTime)
        self.assertEqual(expected_avail.tutor, actual_avail.tutor)

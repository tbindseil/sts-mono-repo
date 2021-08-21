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

        # this might not be needed here since I really am not doing any real permissions stuff
        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def est_get_input_translator(self):
        event = {"queryStringParameters": {'getAvailRequestInput': '{"forAvailability":"this_is_the_availability_id","fromUser":"this_is_the_from_user","forUser":"this_is_the_for_user"}'}}

        input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(input, ("this_is_the_availability_id", "this_is_the_from_user", "this_is_the_for_user"))

    def est_get_returns_all_avail_requests_by_avail_id(self):
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

        self.assertAvailRequestEquals(avail_req1, raw_output[0])
        self.assertEqual(len(raw_output), 1)

    def est_get_returns_all_avail_requests_by_from_user(self):
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

        self.assertAvailRequestEquals(avail_req1, raw_output[0])
        self.assertEqual(len(raw_output), 1)

    def est_get_returns_all_avail_requests_by_for_user(self):
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

        self.assertAvailRequestEquals(avail_req1, raw_output[0])
        self.assertEqual(len(raw_output), 1)

    def est_get_output_translator(self):
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
        expected_output = 200, '{"1": {"fromUser": "' + self.cognito_id + '", "forAvailability": ' + str(avail.id) + ', "status": "REQUESTED"}, "2": {"fromUser": "' + self.another_cognito_id + '", "forAvailability": ' + str(avail.id) + ', "status": "REQUESTED"}}'

        self.assertEqual(output, expected_output)

    def est_post_input_translator(self):
        avail = self.build_default_availability()
        expected_avail_req = AvailabilityRequest(self.another_cognito_id, avail.id)
        event = {"body": json.dumps({
            "forAvailability": expected_avail_req.forAvailability,
            "fromUser": expected_avail_req.fromUser
        })}

        input = lambda_function.post_input_translator(event, "context")

        self.assertAvailRequestEquals(expected_avail_req, input)

    def test_post_adds_availability_request(self):
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

    def test_post_does_not_add_when_from_user_already_has_request(self):
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




    def test_post_output_translator(self):
        raw_output = "raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(actual_code, 200)
        self.assertEqual(actual_response, json.dumps(raw_output))
# 
    # def test_delete_input_translator(self):
        # event = {'path': "url/id/for/avail/to/delete/is/1"}
        # input = lambda_function.delete_input_translator(event, "context")
        # self.assertEqual(input, '1')
        # 
    # def test_delete_removes_availability(self):
        # avail = self.build_default_availability()
# 
        # user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        # user.availabilities.append(avail)
        # self.session.add(user)
        # self.session.commit()
# 
        # user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        # self.assertEqual(1, len(user.availabilities))
# 
        # raw_output = lambda_function.delete_handler('1', self.session, self.get_claims)
# 
        # # gotta commit since that is what the glh does
        # self.session.commit()
# 
        # user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
# 
        # self.assertEqual(0, len(user.availabilities))
# 
    # def test_delete_throws_auth_exception_when_tutor_does_not_match_id_from_token(self):
        # claims = {"cognito:username": "NOT_TEST_USER_COGNITO_ID"}
        # self.get_claims.return_value = claims
# 
        # avail = self.build_default_availability()
# 
        # user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        # user.availabilities.append(avail)
        # self.session.add(user)
        # self.session.commit()
# 
        # user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        # self.assertEqual(1, len(user.availabilities))
# 
        # with self.assertRaises(AuthException) as e:
            # raw_output = lambda_function.delete_handler('1', self.session, self.get_claims)
# 
    # def test_delete_output_translator(self):
        # raw_output = 199, "not_raw_output"
        # actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        # self.assertEqual(200, actual_code)
        # self.assertEqual("success", actual_response)
# 
    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        another_test_user =  self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        self.session.delete(user)
        self.session.delete(another_test_user)
        self.session.commit()
# 
    def build_default_availability(self):
        avail_start = datetime(year=2020, month=1, day=15, hour=13)
        avail_end = datetime(year=2020, month=1, day=15, hour=14)
        return Availability("subjects", avail_start, avail_end, self.cognito_id)
# 
    # # TODO is it necessary to add the avail id here? I think not since/if it gets added to the avail
    # def build_default_availability_request(self, avail):
        # return AvailabilityRequest("subjects", self.cognito_id, avail.id)
# 
    # def assertAvailEquals(self, expected_avail, actual_avail):
        # self.assertEqual(expected_avail.subjects, actual_avail.subjects)
        # self.assertEqual(expected_avail.startTime, actual_avail.startTime)
        # self.assertEqual(expected_avail.endTime, actual_avail.endTime)
        # self.assertEqual(expected_avail.tutor, actual_avail.tutor)
# 
    def assertAvailRequestEquals(self, expected_avail_request, actual_avail_request):
        self.assertEqual(expected_avail_request.id, actual_avail_request.id)
        self.assertEqual(expected_avail_request.fromUser, actual_avail_request.fromUser)
        self.assertEqual(expected_avail_request.forAvailability, actual_avail_request.forAvailability)
        self.assertEqual(expected_avail_request.status, actual_avail_request.status)

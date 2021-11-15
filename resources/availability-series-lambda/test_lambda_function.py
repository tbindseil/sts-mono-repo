import unittest
from unittest.mock import MagicMock
import json
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base
from models.user import User

import lambda_function
from lambda_function import AvailabiltySeriesRequest
from guided_lambda_handler.guided_lambda_handler import InputException

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

        self.session.add(test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def test_post_input_translator(self):
        expected_start = datetime(year=2020, month=1, day=15, hour=13)
        expected_end = datetime(year=2020, month=1, day=15, hour=14)

        expected_availability_series_request = AvailabiltySeriesRequest(True, False, True, False, True, False, True, 2, 'subjects', expected_start, expected_end)
        event = self.create_post_input_event(expected_availability_series_request)

        input = lambda_function.post_input_translator(event, "context")

        self.assertEqual(expected_availability_series_request.weekday_dict, input.weekday_dict)
        self.assertEqual(expected_availability_series_request.num_weeks, input.num_weeks)
        self.assertEqual(expected_availability_series_request.subjects, input.subjects)
        self.assertEqual(expected_availability_series_request.start_time, input.start_time)
        self.assertEqual(expected_availability_series_request.end_time, input.end_time)

    def test_post_input_translator_throws_when_start_or_end_time_not_dates(self):
        expected_availability_series_request = AvailabiltySeriesRequest(True, False, True, False, True, False, True, 2, 'subjects', 'expected_start', 'expected_end')
        event = {"body": {
            "postAvailabilitySeriesInput": json.dumps({
                'sunday': expected_availability_series_request.weekday_dict['0'],
                'monday': expected_availability_series_request.weekday_dict['1'],
                'tuesday': expected_availability_series_request.weekday_dict['2'],
                'wednesday': expected_availability_series_request.weekday_dict['3'],
                'thursday': expected_availability_series_request.weekday_dict['4'],
                'friday': expected_availability_series_request.weekday_dict['5'],
                'saturday': expected_availability_series_request.weekday_dict['6'],
                'numWeeks': expected_availability_series_request.num_weeks,
                'subjects': expected_availability_series_request.subjects,
                'startTime': expected_availability_series_request.start_time,
                'endTime': expected_availability_series_request.end_time
            })
        }}

        with self.assertRaises(InputException) as e:
            input = lambda_function.post_input_translator(event, "context")
        self.assertEqual(str(e.exception), 'startTime and endTime must be dates')

    def test_post_input_translator_throws_when_start_after_end_time(self):
        expected_end = datetime(year=2020, month=1, day=15, hour=13)
        expected_start = datetime(year=2020, month=1, day=15, hour=14)

        expected_availability_series_request = AvailabiltySeriesRequest(True, False, True, False, True, False, True, 2, 'subjects', expected_start, expected_end)
        event = self.create_post_input_event(expected_availability_series_request)

        with self.assertRaises(InputException) as e:
            input = lambda_function.post_input_translator(event, "context")
        self.assertEqual(str(e.exception), 'startTime must be before endTime')

    def create_post_input_event(self, availability_series_request):
        return {"body": {
            "postAvailabilitySeriesInput": json.dumps({
                'sunday': availability_series_request.weekday_dict['0'],
                'monday': availability_series_request.weekday_dict['1'],
                'tuesday': availability_series_request.weekday_dict['2'],
                'wednesday': availability_series_request.weekday_dict['3'],
                'thursday': availability_series_request.weekday_dict['4'],
                'friday': availability_series_request.weekday_dict['5'],
                'saturday': availability_series_request.weekday_dict['6'],
                'numWeeks': availability_series_request.num_weeks,
                'subjects': availability_series_request.subjects,
                'startTime': availability_series_request.start_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                'endTime': availability_series_request.end_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
            })
        }}

    def test_post_creates_avails(self):
        print("TODO")
        # availability_series_request = AvailabiltySeriesRequest(True, False, True, False, True, False, True, 2, qsp_map['startTime'], qsp_map['endTime'])


    def test_post_does_not_create_any_avails_when_even_one_would_overlap_with_existing_avail(self):
        print("TODO")

    def test_post_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def test_delete_input_translator(self):
        print("TODO")

    def test_delete_is_passthrough(self):
        print("TODO")

    def test_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual("success", actual_response)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

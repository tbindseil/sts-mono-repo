import unittest
from unittest.mock import MagicMock
import json
from datetime import datetime, timedelta, time

from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker

from models import Base
from models.user import User
from models.availability import Availability
from models.availability_series import AvailabilitySeries

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
        event = {"body": json.dumps({
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
        }

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
        return {"body": json.dumps({
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
        }

    def test_post_creates_series(self):
        expected_weekly_pattern = [True, False, True, False, True, False, True]
        num_weeks = '2'
        expected_subjects = 'subjects'
        expected_start = datetime(year=2023, month=1, day=15, hour=13)
        expected_end = datetime(year=2023, month=1, day=15, hour=14)

        num_initial_availabilities = self.session.query(Availability).count()
        self.assertEqual(num_initial_availabilities, 0)

        availability_series_request = AvailabiltySeriesRequest(expected_weekly_pattern[0], expected_weekly_pattern[1], expected_weekly_pattern[2], expected_weekly_pattern[3], expected_weekly_pattern[4], expected_weekly_pattern[5], expected_weekly_pattern[6], num_weeks, expected_subjects, expected_start, expected_end)
        output = lambda_function.post_handler(availability_series_request, self.session, self.get_claims)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        created_series = user.availability_series[0]
        self.assertEqual(len(created_series.availabilities), 8)

    def test_post_creates_avails(self):
        expected_weekly_pattern = [True, False, True, False, True, False, True]
        num_weeks = '2'
        expected_subjects = 'subjects'
        # the date aspect of this is irrelevant
        # the time is extracted, and the avails are made starting on the nearest sunday (could be today I guess..)
        expected_start = datetime(year=2023, month=1, day=15, hour=13)
        expected_end = datetime(year=2023, month=1, day=15, hour=14)

        num_initial_availabilities = self.session.query(Availability).count()
        self.assertEqual(num_initial_availabilities, 0)

        availability_series_request = AvailabiltySeriesRequest(expected_weekly_pattern[0], expected_weekly_pattern[1], expected_weekly_pattern[2], expected_weekly_pattern[3], expected_weekly_pattern[4], expected_weekly_pattern[5], expected_weekly_pattern[6], num_weeks, expected_subjects, expected_start, expected_end)
        output = lambda_function.post_handler(availability_series_request, self.session, self.get_claims)
        self.session.commit()

        availability_query = self.session.query(Availability)

        # need to have 8 total
        num_initial_availabilities = availability_query.count()
        self.assertEqual(num_initial_availabilities, 8)

        # all need to have expected start and end times
        for avail in availability_query:
            self.assertEqual(avail.subjects, expected_subjects)
            self.assertEqual(avail.startTime.time(), expected_start.time())
            self.assertEqual(avail.endTime.time(), expected_end.time())

        # need to be on ... certain days ...
        moving_date = datetime.combine(datetime.today().date(), expected_start.time())
        while moving_date.isoweekday() != 7:
            moving_date += timedelta(days=1)

        for i in range(int(num_weeks)):
            for expected in expected_weekly_pattern:
                if expected:
                    moving_date_date = moving_date.date()
                    zero_time = time(0, 0)
                    start_of_query = datetime.combine(moving_date_date, zero_time)
                    end_of_query = start_of_query + timedelta(days=1)
                    self.session.query(Availability).filter(and_(Availability.startTime>=start_of_query, Availability.endTime<=end_of_query)).one()

                moving_date += timedelta(days=1)

    def test_post_does_not_create_any_avails_when_even_one_would_overlap_with_existing_avail(self):
        upcoming_sunday = datetime.today()
        while upcoming_sunday.isoweekday() != 7:
            upcoming_sunday += timedelta(days=1)

        existing_start_time = datetime.combine(upcoming_sunday.date(), time(13, 0))
        existing_end_time = datetime.combine(upcoming_sunday.date(), time(14, 0))

        existing_availability = Availability("subjects", existing_start_time, existing_end_time, self.cognito_id)
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        user.availabilities.append(existing_availability)
        self.session.add(user)
        self.session.commit()

        expected_weekly_pattern = [True, False, True, False, True, False, True]
        num_weeks = '2'
        expected_subjects = 'subjects'
        expected_start = datetime(year=2023, month=1, day=15, hour=13)
        expected_end = datetime(year=2023, month=1, day=15, hour=14)

        num_initial_availabilities = self.session.query(Availability).count()
        self.assertEqual(num_initial_availabilities, 1)

        availability_series_request = AvailabiltySeriesRequest(expected_weekly_pattern[0], expected_weekly_pattern[1], expected_weekly_pattern[2], expected_weekly_pattern[3], expected_weekly_pattern[4], expected_weekly_pattern[5], expected_weekly_pattern[6], num_weeks, expected_subjects, expected_start, expected_end)

        with self.assertRaises(Exception) as e:
            output = lambda_function.post_handler(availability_series_request, self.session, self.get_claims)
        self.assertEqual(str(e.exception), 'Posted availability overlaps with existing availability')

    def test_post_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual(json.dumps("success"), actual_response)

    def test_delete_input_translator(self):
        event = {'path': "url/id/for/avail/series/to/delete/is/1"}
        input = lambda_function.delete_input_translator(event, "context")
        self.assertEqual(input, '1')

    def test_delete_deletes(self):
        start = datetime(year=2023, month=1, day=15, hour=13)
        end = datetime(year=2023, month=1, day=15, hour=14)
        avail_part_of_series = Availability('subjects', start, end, self.cognito_id)
        avail_not_part_of_series = Availability('subjects', start, end, self.cognito_id)

        series = AvailabilitySeries(self.cognito_id)
        series.availabilities.append(avail_part_of_series)

        self.session.add(series)
        self.session.add(avail_part_of_series)
        self.session.add(avail_not_part_of_series)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(len(user.availabilities), 2)
        self.assertEqual(len(user.availability_series), 1)

        output = lambda_function.delete_handler(series.id, self.session, self.get_claims)
        self.session.commit()

        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.assertEqual(len(user.availabilities), 1)
        self.assertEqual(len(user.availability_series), 0)

    def test_delete_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.delete_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual(json.dumps("success"), actual_response)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.commit()

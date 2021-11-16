import json
import jsondatetime
from datetime import datetime, timedelta

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory, success_response_output, InputException
from models.user import User
from models.availability import Availability


class AvailabiltySeriesRequest():
    def __init__(self, sunday, monday, tuesday, wednesday, thursday, friday, saturday, num_weeks, subjects, start_time, end_time):
        self.weekday_dict = {
                '0': sunday,
                '1': monday,
                '2': tuesday,
                '3': wednesday,
                '4': thursday,
                '5': friday,
                '6': saturday,
        }
        self.num_weeks = num_weeks
        self.subjects = subjects
        self.start_time = start_time
        self.end_time  = end_time


# could cast start/endTime to time from datetime to make it explicit that i am only concerned with time...
def post_input_translator(event, context):
    qsp_map = jsondatetime.loads(event['body']['postAvailabilitySeriesInput'])

    if (not isinstance(qsp_map['startTime'], datetime)
            or not isinstance(qsp_map['endTime'], datetime)):
        raise InputException('startTime and endTime must be dates')

    if qsp_map['startTime'] >= qsp_map['endTime']:
        raise InputException('startTime must be before endTime')

    availability_series_request = AvailabiltySeriesRequest(qsp_map['sunday'], qsp_map['monday'], qsp_map['tuesday'], qsp_map['wednesday'], qsp_map['thursday'], qsp_map['friday'], qsp_map['saturday'], qsp_map['numWeeks'], qsp_map['subjects'], qsp_map['startTime'], qsp_map['endTime'])

    return availability_series_request

def create_avail(posted_availability, tutor):
    for avail in tutor.availabilities:
        if ((avail.startTime < posted_availability.endTime and avail.startTime >= posted_availability.startTime) or
                (avail.endTime <= posted_availability.endTime and avail.endTime > posted_availability.startTime) or
                (avail.startTime <= posted_availability.startTime and avail.endTime >= posted_availability.endTime)):
            raise Exception('Posted availability overlaps with existing availability')

    tutor.availabilities.append(posted_availability)

def post_handler(input, session, get_claims):
    availability_series_request = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    prototype = Availability(availability_series_request.subjects, availability_series_request.start_time, availability_series_request.end_time, cognito_id)

    today_date = datetime.today()
    upcoming_sunday = today_date
    while upcoming_sunday.isoweekday() != 7:
        upcoming_sunday += timedelta(days=1)
    prototype.startTime = datetime.combine(upcoming_sunday.date(), prototype.startTime.time())
    prototype.endTime = datetime.combine(upcoming_sunday.date(), prototype.endTime.time())

    for i in range(0, availability_series_request.num_weeks):
        for key, value in availability_series_request.weekday_dict.items():
            if value:
                # need to deep copy before saving
                copied_prototype = Availability(prototype.subjects, prototype.startTime, prototype.endTime, prototype.tutor)
                # copied_prototype.
                create_avail(copied_prototype, user)
            prototype.startTime += timedelta(days=1)
            prototype.endTime += timedelta(days=1)

    session.add(user)

    return 'success'

def post_output_translator(raw_output):
    return success_response_output()


def delete_input_translator(event, context):
    return event['path'].split('/')[-1]

def delete_handler(input, session, delete_claims):
    availability_series_id_to_delete = input

    # TODO make sure only tutor can delete series

    series = session.query(AvailabilitySession).filter(AvailabilitySession.id==availability_series_id_to_delete).one()

    for avail in series.availabilities:
        session.delete(avail)

    session.delete(series)

    return "success"

def delete_output_translator(raw_output):
    return success_response_output()


def lambda_handler(event, context):
    """
    creates and deletes availability series
    """

    print("event is:")
    print(event)

    if event["httpMethod"] == "POST":
        post_glh = GLH(post_input_translator, post_handler, post_output_translator)
        return post_glh.handle(event, context)
    elif event["httpMethod"] == "DELETE":
        delete_glh = GLH(delete_input_translator, delete_handler, delete_output_translator)
        return delete_glh.handle(event, context)
    else:
        valid_http_methods = ["POST", "DELETE"]
        return invalid_http_method_factory(valid_http_methods)

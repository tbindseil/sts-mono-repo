import json

from guided_lambda_handler.guided_lambda_handler import GLH, invalid_http_method_factory


class AvailabiltySeriesRequest():
    def __init__(self, sunday, monday, tuesday, wednesday, thursday, friday, saturday, numWeeks, subjects, startTime, endTime)
        self.weekday_dict = {
                '0': sunday,
                '1': monday,
                '2': tuesday,
                '3': wednesday,
                '4': thursday,
                '5': friday,
                '6': saturday,
        }
        self.numWeeks = numWeeks
        self.startTime = startTime
        self.endTime  = endTime


def post_input_translator(event, context):
    qsp_map = json.loads(event['queryStringParameters']['echoInput'])

    # could cast start/endTime to time from datetime to make it explicit that i am only concerned with time...

    availability_series_request = AvailabiltySeriesRequest(qsp_map['sunday'], qsp_map['monday'], qsp_map['tuesday'], qsp_map['wednesday'], qsp_map['thursday'], qsp_map['friday'], qsp_map['saturday'], qsp_map['numWeeks'], qsp_map['startTime'], qsp_map['endTime'])

    return availability_series_request

def create_avail(posted_availability, tutor):
    for avail in tutor.availabilities:
        if ((avail.startTime < posted_availability.endTime and avail.startTime >= posted_availability.startTime) or
                (avail.endTime <= posted_availability.endTime and avail.endTime > posted_availability.startTime) or
                (avail.startTime <= posted_availability.startTime and avail.endTime >= posted_availability.endTime)):
            raise Exception('Posted availability overlaps with existing availability')

    tutor.availabilities.append(posted_availability)

def post_handler(input, session, post_claims):
    availability_series_request = input

    claims = get_claims()
    cognito_id = claims["cognito:username"]
    user = session.query(User).filter(User.cognitoId==cognito_id).one()

    prototype = Availability(availability_series_request.subjects, availability_series_request.startTime, availability_series_request.endTime, availability_series_request.tutor.cognitoId)

    today_date = today()
    prototype.startTime.day = today_date.day
    prototype.startTime.month = today_date.month
    prototype.startTime.year = today_date.year

    one_day = timedelta(1)
    for i in range(1, numWeeks):
        for key, value in availability_series_request.weekday_dict:
            if value:
                create_avail(prototype, user)
            prototype.startTime += one_day
            prototype.endTime += one_day

    session.add(user)

    return 'success'

def post_output_translator(raw_output):
    return 200, json.dumps(raw_output)


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

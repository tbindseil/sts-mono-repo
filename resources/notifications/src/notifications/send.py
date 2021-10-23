import boto3
from botocore.exceptions import ClientError

from . import factory

# Replace sender@example.com with your "From" address.
# This address must be verified with Amazon SES.
SENDER = "Sender Name <tjbindseil@gmail.com>"

# Specify a configuration set. If you do not want to use a configuration
# set, comment the following variable, and the
# ConfigurationSetName=CONFIGURATION_SET argument below.
# CONFIGURATION_SET = "ConfigSet"

# If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
AWS_REGION = "us-west-2"

# The character encoding for the email.
CHARSET = "UTF-8"

# Create a new SES resource and specify a region.
client = boto3.client('ses', region_name=AWS_REGION)


# we always want parent email, but only want normal email when it exists
# it is noptional)
def _add_recipient_email(user, recipients):
    recipients.append(user.parentEmail);
    if (user.email):
        recipients.append(user.email)


# might need session to get for_availabity.tutor
# assumes the final state is all that is relevant
def send_avail_request_notification(avail_request, student, tutor):
    # student = session.query(User).filter(User.id==avail_request.from_user).one()
    # avail = session.query(Availability).filter(Availability.id==avail_request.for_availability).one()
    # tutor = session.query(User).filter(User.id==avail.tutor).one()

    recipients = []

    if avail_request.status == 'ACCEPTED':
        _add_recipient_email(student, recipients)
        _add_recipient_email(tutor, recipients)
        notification = factory.make_accepted_notification(tutor.cognitoId)
    elif avail_request.status == 'REQUESTED':
        _add_recipient_email(tutor, recipients)
        notification = factory.make_requested_notification(student.cognitoId)
    elif avail_request.status == 'CANCELED':
        _add_recipient_email(tutor, recipients)
        notification = factory.make_canceled_notification(student.cognitoId)
    elif avail_request.status == 'DENIED':
        _add_recipient_email(student, recipients)
        notification = factory.make_denied_notification(tutor.cognitoId)

    send(recipients, notification)


def send(recipients, notification):
    # Try to send the email.
    try:
        #Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': recipients,
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': notification.body_html,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': notification.body_text,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': notification.subject,
                },
            },
            Source=SENDER,
            # If you are not using a configuration set, comment or delete the
            # following line
            # ConfigurationSetName=CONFIGURATION_SET,
        )

    # Display an error if something goes wrong.
    except ClientError as e:
        print(e.response['Error']['Message'])
        raise e

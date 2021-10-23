import boto3
from botocore.exceptions import ClientError

import .notification_constants

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
def add_recipient_email(user, recipients):
    recipients.append(user.parentEmail);
    if (user.email):
        recipients.append(user.email)


# might need session to get for_availabity.tutor
# assumes the final state is all that is relevant
def send_notification(avail_request, session):
    student = session.query(User).filter(User.id==avail_request.from_user).one()
    avail = session.query(Availability).filter(Availability.id==avail_request.for_availability).one()
    tutor = session.query(User).filter(User.id==avail.tutor).one()

    recipients = []

    if avail_request.status is 'ACCEPTED':
        add_recipient_email(student, recipients)
        add_recipient_email(tutor, recipients)

        body_html = 'bh'
        body_text = 'bt'
        subject = 's'
    elif avail_request.status is 'REQUESTED':
        add_recipient_email(tutor, recipients)

        body_html = 'bh'
        body_text = 'bt'
        subject = 's'
    elif avail_request.status is 'CANCELED':
        add_recipient_email(tutor, recipients)
        # notification = 

        body_html = 'bh'
        body_text = 'bt'
        subject = 's'
    elif avail_request.status is 'DENIED':
        add_recipient_email(student, recipients)

        body_html = 'bh'
        body_text = 'bt'
        subject = 's'

    send_notification(recipients, body_html, body_text, subject):


def send_notification(recipients, body_html, body_text, subject):
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
                        'Data': body_html,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': body_text,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': subject,
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

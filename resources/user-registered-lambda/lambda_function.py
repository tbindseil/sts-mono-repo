import json
import boto3
from botocore.exceptions import ClientError

from sqlalchemy.orm import sessionmaker

from sts_db_utils.sts_db_utils import get_database_engine
from models.user import User


# Replace sender@example.com with your "From" address.
# This address must be verified with Amazon SES.
SENDER = "Sender Name <tjbindseil@gmail.com>"

# Specify a configuration set. If you do not want to use a configuration
# set, comment the following variable, and the
# ConfigurationSetName=CONFIGURATION_SET argument below.
CONFIGURATION_SET = "ConfigSet"

# If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
AWS_REGION = "us-west-2"

# The subject line for the email.
SUBJECT = "Welcome to Students Teaching Students"

# The email body for recipients with non-HTML email clients.
BODY_TEXT = ("Welcome to Students Teaching Students!\r\n"
             "Now that you have an account, you can post your tutoring availability and/or request to be tutored by other members.\r\n"
             "Visit studentsts.org/profile to get started."
            )

# The HTML body of the email.
BODY_HTML = """<html>
<head></head>
<body>
  <h1>Welcome to Students Teaching Students!</h1>
  <p>Now that you have an account, you can post your tutoring availability and/or request to be tutored by other members.</p>
  <br/>
  <p>Visit <a href='https://studentsts.org/profile'>Profile Page</a> to get started</p>
</body>
</html>
            """

# The character encoding for the email.
CHARSET = "UTF-8"

# Create a new SES resource and specify a region.
client = boto3.client('ses',region_name=AWS_REGION)


def lambda_handler(event, context):
    print("event is")
    print(event)

    trigger = event['triggerSource']
    if trigger == 'PostConfirmation_ConfirmForgotPassword':
        return event

    engine = get_database_engine()
    Session = sessionmaker(bind=engine)
    session = Session()

    cognito_id = event['userName']
    confirmed_user = session.query(User).filter(User.cognitoId==cognito_id).one()

    # Replace recipient@example.com with a "To" address. If your account
    # is still in the sandbox, this address must be verified.
    recipients = [confirmed_user.parentEmail]
    if confirmed_user.email:
        recipients.append(confirmed_user.email)

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
                        'Data': BODY_HTML,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER,
            # If you are not using a configuration set, comment or delete the
            # following line
            ConfigurationSetName=CONFIGURATION_SET,
        )
    # Display an error if something goes wrong.
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])

    return event

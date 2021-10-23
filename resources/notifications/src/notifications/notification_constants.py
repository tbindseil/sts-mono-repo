# TODO rename file and notifications.py
# TODO I could probably refactor user-registration email...

class Notification():
    def __init__(self, subject, body_text, body_html):
        self.subject = subject
        self.body_text = body_text
        self.body_html = body_html


def make_requested_notification():
    return Notification(
        subject="Someone Requested Your Availability",
        body_text="""Someone has requested your availability!\r\n
                        You can accept, deny, or ignore this request.\r\n
                        Visit studentsts.org/profile to accept or deny.""",
        body_html="""
            <html>
                <head></head>
                <body>
                    <h1>Someone has requested your availability!</h1>
                    <p>You can accept, deny, or ignore this request.</p>
                    <br/>
                    <p>Visit <a href='https://studentsts.org/profile'>Profile Page</a> to accept or deny</p>
                </body>
            </html>
            """
    )


def make_accepted_notification(tutor_name):
    return Notification(
        subject="Someone accepted Your Availability",
        body_text="""{} has accepted your tutoring request!\r\n
                        Your tutor_name is cced on this email.
                        They should follow up with you shortly to
                        discuss the details of your tutoring session.""".format(tutor_name),
        body_html="""
            <html>
                <head></head>
                <body>
                    <h1>{} has accepted your tutoring request!</h1>
                    <p>Your tutor_name is cced on this email.</p>
                    <br/>
                    <p>They should follow up with you shortly to discuss the details of your tutoring session.</p>
                </body>
            </html>
            """.format(tutor_name)
    )


def make_denied_notification(tutor_name):
    return Notification(
        subject="Your tutoring request has been denied",
        body_text="""{} has denied your tutoring request.\r\n
                        Visit https://studentsts.org/calendar to look for more options.""".format(tutor_name),
        body_html="""
            <html>
                <head></head>
                <body>
                    <h1>{} has denied your tutoring request.</h1>
                    <p>Visit <a href=https://studentsts.org/calendar>The Calendar Page</a> to look for more options.</p>
                </body>
            </html>
            """.format(tutor_name)
    )


def make_canceled_notification(student_name):
    return Notification(
        subject="A request for your availability has been caneled",
        body_text="""{} has canceled their request for your availability.""".format(student_name),
        body_html="""
            <html>
                <head></head>
                <body>
                    <h1>{} has canceled their request for your availability.</h1>
                </body>
            </html>
            """.format(student_name)
    )

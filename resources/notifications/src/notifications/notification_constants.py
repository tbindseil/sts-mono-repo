
# TJTAG, could have these be static objects, and then just pass them to the send_notification worker class

REQUESTED_SUBJECT = "Someone Requested Your Availability"
REQUESTED_BODY_TEXT = ("Someone has requested your availability!\r\n"
                       "You can accept, deny, or ignore this request.\r\n"
                       "Visit studentsts.org/profile to accept or deny."
                      )
REQUESTED_BODY_HTML = """
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


ACCEPTED_SUBJECT = "Someone accepted Your Availability"
def ACCEPTED_BODY_TEXT(tutor_name):
   return  """{} has accepted your tutoring request!\r\n
           Your tutor_name is cced on this email.
           They should follow up with you shortly to discuss the details of your tutoring session.""".format(tutor_name)
def ACCEPTED_BODY_HTML(tutor_name):
    return """
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

DENIED_SUBJECT = "Your tutoring request has been denied"
def DENIED_BODY_TEXT(tutor_name):
   return  """{} has denied your tutoring request.\r\n
           Visit https://studentsts.org/calendar to look for more options.""".format(tutor_name)
def DENIED_BODY_HTML(tutor_name):
    return """
            <html>
                <head></head>
                <body>
                    <h1>{} has denied your tutoring request.</h1>
                    <p>Visit <a href=https://studentsts.org/calendar>The Calendar Page</a> to look for more options.</p>
                </body>
            </html>
            """.format(tutor_name)

CANCELED_SUBJECT = "A request for your availability has been caneled"
def CANCELED_BODY_TEXT(student_name):
   return  """{} has canceled their request for your availability.""".format(student_name)
def CANCELED_BODY_HTML(student_name):
    return """
            <html>
                <head></head>
                <body>
                    <h1>{} has canceled their request for your availability.</h1>
                </body>
            </html>
            """.format(student_name)

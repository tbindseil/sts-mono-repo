import json




# __init__.py

#import os
#
#from flask import Flask
#from flask_bcrypt import Bcrypt
#from flask_sqlalchemy import SQLAlchemy
#
#app = Flask(__name__)
#
#app_settings = os.getenv(
#    'APP_SETTINGS',
#    'project.server.config.DevelopmentConfig'
#)
#app.config.from_object(app_settings)
#
#bcrypt = Bcrypt(app)
#db = SQLAlchemy(app)
#
#from project.server.api import auth_blueprint, login_blueprint, user_blueprint, logout_blueprint
#app.register_blueprint(auth_blueprint)
#app.register_blueprint(login_blueprint)
#app.register_blueprint(user_blueprint)
#app.register_blueprint(logout_blueprint)

# end __init__.py





def lambda_handler(event, context):
    print(event)

    method = event['httpMethod']
    username = event['path'].split('/')[-1]




    # based off endpoint

    # / - GET
    # return all users

    # /{username} - GET
    # extract username, password
    # return token if things check out
    # return error otherwise

    # /{username} - POST
    # extract username, password
    # register user and return token if things check out
    # return error otherwise




    # /{username} - DELETE
    # extract username, token
    # invalidate token and return success if possible
    # return error otherwise


    return {
        'statusCode': 200,
        'headers': {
            "Content-Type" : "application/json",
            "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods" : "OPTIONS,POST",
            "Access-Control-Allow-Credentials" : True,
            "Access-Control-Allow-Origin" : "*",
            "X-Requested-With" : "*"
        },
        'body': json.dumps('method is ' + method + ' and username is ' + username)
    }


import json
import requests

url = 'https://icanhazdadjoke.com'

def lambda_handler(event, context):
    r = requests.get(url, headers={"Accept": "application/json"})
    result = json.loads(r.text)
    # return

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
        'body': json.dumps('joke is: ' + result['joke'])
    }


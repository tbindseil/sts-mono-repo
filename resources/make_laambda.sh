#!/bin/bash

set -e

if [ -z $1 ]; then
    echo "usage ./make_lambda.sh <lambda-name>"
    exit
fi

LABMDA_NAME=$1

LAMBDA_DIR="$LABMDA_NAME-lambda"

mkdir "$LAMBDA_DIR"
cd $LAMBDA_DIR
python3 -m venv ./venv
touch requirements.txt

# create lambda handler
cat <<EOF >lambda_function.py
import json


def lambda_handler(event, context):
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
        'body': json.dumps('hello world!')
    }
EOF


# TODO maybe make cdk stack also?

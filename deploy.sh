#!/bin/bash

# TODO pip install requirements.txt

# zip lambda and dependencies
FILE_SEPARATOR="/"
ROOT_FULL_PATH="$(pwd)"
LAMBDA_ROOT="${ROOT_FULL_PATH}/resources/"
DEPENDENCIES_SUBDIR="venv/lib/python3.8/site-packages/"
ZIP_FILE_NAME="my-deployment-package.zip"
ZIP_INPUT_DIR="."
LAMBDA_FUNCTION_FILE_NAME="lambda_function.py"

for LAMBDA_SUBDIR in $(ls $LAMBDA_ROOT | grep lambda); do
    LAMBDA_FULL_PATH="$LAMBDA_ROOT$FILE_SEPARATOR$LAMBDA_SUBDIR"
    cd "$LAMBDA_FULL_PATH$FILE_SEPARATOR$DEPENDENCIES_SUBDIR"
    zip -r $LAMBDA_FULL_PATH$FILE_SEPARATOR$ZIP_FILE_NAME $ZIP_INPUT_DIR
    cd "$LAMBDA_FULL_PATH"
    zip -g $ZIP_FILE_NAME $LAMBDA_FUNCTION_FILE_NAME
    cd "$ROOT_FULL_PATH"
done

# build and deploy cdk app
npm run build && cdk synth && cdk deploy --all

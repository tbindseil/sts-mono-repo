# TODO maybe make cdk stack also?

# probably something like:
LABMDA_NAME=$1
LAMBDA_DIR="$LABMDA_NAME-lambda"
mkdir "$LAMBDA_DIR"
cd $LAMBDA_DIR
python3 -m venv ./venv
cp ../prototype/* ./
# venv command wasn't found
# venv
# pip install -r requirements.txt
# deactivate

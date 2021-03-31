rm dist/*
# increment version in setup.py
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/*

for each lambda with this package in its requirements.txt,
    update the package with the latest version of this package
    export to requirements

    venv
    pip install -U sts-models-tj
    pip freeze > requirements.txt
    deactivate

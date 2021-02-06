rm dist/*
# increment version in setup.py
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/*

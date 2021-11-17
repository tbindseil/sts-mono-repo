#!/bin/bash

# update version in setup.sh

# use grep to find line
LINE=$(grep version setup.py)

# TODO don't always update...

# use math to find beginning, end, and minor version
LINE_LENGTH=${#LINE}
START_OF_MINOR_VERSION=17
END_OF_MINOR_VERSION=$((LINE_LENGTH-2))
LENGTH_OF_MINOR_VERSION=$((END_OF_MINOR_VERSION-START_OF_MINOR_VERSION))
BEGINNING=${LINE:0:$START_OF_MINOR_VERSION}
MINOR_VERSION=${LINE:$START_OF_MINOR_VERSION:$LENGTH_OF_MINOR_VERSION}
END=${LINE:$END_OF_MINOR_VERSION}

MINOR_VERSION=$((MINOR_VERSION+1))

# reconstruct line (line = beginning + minor version + end)
NEW_LINE=$BEGINNING$MINOR_VERSION$END

# replace old with new using ~~sed~~
# sed wouldn't work cause it always expects a regex
# instead, vim does the trick
vim -E -s setup.py << EOF
:%s/$LINE/$NEW_LINE/g
:update
:quit
EOF

# upload latest snapshot
rm dist/*
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/*

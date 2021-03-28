import json
import urllib.request


# really, this package's name should specify cognito since the __init__
# (one per package) is cognito specific.
# Unless I extract it into cognito init method or something..

# Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
# except in compliance with the License. A copy of the License is located at
#
#     http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under the License.

region = 'us-west-2'
userpool_id = 'us-west-2_uzjaqz0n2'
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)

# instead of re-downloading the public keys every time
# we download them only on cold start
# https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
with urllib.request.urlopen(keys_url) as f:
    # TODO check if this really does only get executed on cold start..
    print("within keys request context, should only show up on cold start")
    response = f.read()

keys = json.loads(response.decode('utf-8'))['keys']

import unittest
from unittest.mock import MagicMock
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base
from models.user import User
from models.group import Group

import lambda_function

class TestLambdaFunction(unittest.TestCase):
    engine = create_engine('sqlite:///:memory:') # note tear down not needed since this is in memory

    def setUp(self):
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cognito_id = "cognito_id"
        test_user = User(
                email="email",
                cognitoId=self.cognito_id,
                parentName = "user.parentName",
                parentEmail = "user.parentEmail",
                firstName = "user.firstName",
                lastName = "user.lastName",
                school = "user.school",
                grade = "user.grade",
                age = "user.age",
                address = "user.address",
                bio = "user.bio",
        )

        self.session.add(test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims


    def test_get_input_translator(self):
        expected_input = 'input'
        event = {"queryStringParameters": {'echoInput': expected_input}}

        actual_input = lambda_function.get_input_translator(event, "context")
        self.assertEqual(expected_input, actual_input)

    def test_get_is_passthrough(self):
        expected_to_echo = 'input'
        actual_to_echo = lambda_function.get_handler(expected_to_echo, self.session, self.get_claims)
        self.assertEqual(expected_to_echo, actual_to_echo)

    def test_get_output_translator(self):
        expected_to_echo = 'to_echo'
        response = {'to_echo': expected_to_echo}
        expected_output = 200, json.dumps(response)

        actual_output = lambda_function.get_output_translator(expected_to_echo)
        self.assertEqual(expected_output, actual_output)


    def test_post_input_translator(self):
        expectedParentGroup = 'expectedParentGroup'
        expectedGroupName = 'expectedGroupName'
        event = {'body': json.dumps({'groupName': expectedGroupName, 'parentGroup': expectedParentGroup}) }

        actual_input = lambda_function.post_input_translator(event, "context")
        self.assertEqual((expectedGroupName, expectedParentGroup), actual_input)

    def test_post_input_translator_no_parent_group(self):
        expectedGroupName = 'expectedGroupName'
        event = {'body': json.dumps({'groupName': expectedGroupName}) }

        actual_input = lambda_function.post_input_translator(event, "context")
        self.assertEqual((expectedGroupName, None), actual_input)

    def test_post_no_parent_given(self):
        expectedParentGroup = None
        expectedGroupName = 'expectedGroupName'
        expectedGroup = Group(expectedGroupName, self.cognito_id)
        input = expectedGroupName, expectedParentGroup

        output = lambda_function.post_handler(input, self.session, self.get_claims)
        self.session.commit()

        actualGroup = self.session.query(Group).one()

        self.assertGroupEqual(actualGroup, expectedGroup)

    def test_post_parent_given(self):
        expectedParentGroup = 'expectedParentGroup'
        parentGroup = Group(expectedParentGroup, self.cognito_id)
        self.session.add(parentGroup)
        self.session.commit()

        expectedGroupName = 'expectedGroupName'
        expectedGroup = Group(expectedGroupName, self.cognito_id)
        expectedGroup.parentGroup = parentGroup.id
        input = expectedGroupName, parentGroup.id

        output = lambda_function.post_handler(input, self.session, self.get_claims)
        self.session.commit()

        actualGroup = self.session.query(Group).filter(Group.name==expectedGroupName).one()

        self.assertGroupEqual(actualGroup, expectedGroup)

    def test_post_throws_when_bad_parent_given(self):
        expectedParentGroup = 'expectedParentGroup'
        parentGroup = Group(expectedParentGroup, self.cognito_id)
        self.session.add(parentGroup)
        self.session.commit()

        expectedGroupName = 'expectedGroupName'
        input = expectedGroupName, (parentGroup.id + 42)

        with self.assertRaises(Exception) as e:
            output = lambda_function.post_handler(input, self.session, self.get_claims)
            self.session.commit()
        self.assertEqual(str(e.exception), 'Issue adding group to parent')

    def test_post_throws_when_bad_parent_has_members(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()

        expectedParentGroup = 'expectedParentGroup'
        parentGroup = Group(expectedParentGroup, self.cognito_id)
        parentGroup.members.append(user)
        self.session.add(parentGroup)
        self.session.commit()

        expectedGroupName = 'expectedGroupName'
        input = expectedGroupName, parentGroup.id

        with self.assertRaises(Exception) as e:
            output = lambda_function.post_handler(input, self.session, self.get_claims)
            self.session.commit()
        self.assertEqual(str(e.exception), 'Parent already has members')

    def test_post_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.post_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual(json.dumps("success"), actual_response)


    def test_put_output_translator(self):
        raw_output = 199, "not_raw_output"
        actual_code, actual_response = lambda_function.put_output_translator(raw_output)
        self.assertEqual(200, actual_code)
        self.assertEqual(json.dumps("success"), actual_response)


    def assertGroupEqual(self, expectedGroup, actualGroup):
        self.assertEqual(expectedGroup.name, actualGroup.name)
        self.assertEqual(expectedGroup.groupOwner, actualGroup.groupOwner)
        self.assertEqual(expectedGroup.parentGroup, actualGroup.parentGroup)

    def tearDown(self):
        user = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        self.session.delete(user)
        self.session.query(Group).delete()
        self.session.commit()





# post group - done
    # no parent given
    # if parent has members, exception
    # group is added as child of parent
    # if parent not a groupid, exception

# only admin or owner can do the following, shoot what about all this permissions hype?
# post member to group - test
# delete member from group - test
# move group by switching a group's parent (?) post to <api url>/groups/<group id>/<new parent id> - test

# only owner can do the following, shoot what about all this permissions hype?
# post admin to group - test
# delete admin from group - test

# get group - return everything - test
# delete group - delete everything - test

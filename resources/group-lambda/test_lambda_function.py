import unittest
from unittest.mock import MagicMock
import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from guided_lambda_handler.guided_lambda_handler import AuthException
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

        self.another_cognito_id = "another_cognito_id"
        another_test_user = User(
                email="another_email",
                cognitoId=self.another_cognito_id,
                parentName = "another_user.parentName",
                parentEmail = "another_user.parentEmail",
                firstName = "another_user.firstName",
                lastName = "another_user.lastName",
                school = "another_user.school",
                grade = "another_user.grade",
                age = "another_user.age",
                address = "another_user.address",
                bio = "another_user.bio",
        )

        self.session.add(test_user)
        self.session.add(another_test_user)
        self.session.commit()

        claims = {"cognito:username": self.cognito_id}
        self.get_claims = MagicMock()
        self.get_claims.return_value = claims
        another_claims = {"cognito:username": self.another_cognito_id}
        self.another_get_claims = MagicMock()
        self.another_get_claims.return_value = another_claims


    def test_group_input_translator(self):
        event = {'path': "url/id/for/group/to/get/is/1"}
        input = lambda_function.group_input_translator(event, "context")
        self.assertEqual(input, '1')

    def test_get_gets(self):
        expected_group = Group('gn', 'owner')
        self.session.add(expected_group)
        self.session.commit()

        output = lambda_function.get_handler(expected_group.id, self.session, self.get_claims)
        self.session.commit()

        self.assertGroupEqual(output, expected_group)

    def test_get_output_translator(self):
        member1 = User(
                email="email1",
                cognitoId=self.cognito_id + '1',
                parentName = "user.parentName1",
                parentEmail = "user.parentEmail1",
                firstName = "user.firstName1",
                lastName = "user.lastName1",
                school = "user.school1",
                grade = "user.grade1",
                age = "user.age1",
                address = "user.address1",
                bio = "user.bio1",
        )
        member2 = User(
                email="email2",
                cognitoId=self.cognito_id + '2',
                parentName = "user.parentName2",
                parentEmail = "user.parentEmail2",
                firstName = "user.firstName2",
                lastName = "user.lastName2",
                school = "user.school2",
                grade = "user.grade2",
                age = "user.age2",
                address = "user.address2",
                bio = "user.bio2",
        )
        admin1 = User(
                email="email3",
                cognitoId=self.cognito_id + '3',
                parentName = "user.parentName3",
                parentEmail = "user.parentEmail3",
                firstName = "user.firstName3",
                lastName = "user.lastName3",
                school = "user.school3",
                grade = "user.grade3",
                age = "user.age3",
                address = "user.address3",
                bio = "user.bio3",
        )
        admin2 = User(
                email="email4",
                cognitoId=self.cognito_id + '4',
                parentName = "user.parentName4",
                parentEmail = "user.parentEmail4",
                firstName = "user.firstName4",
                lastName = "user.lastName4",
                school = "user.school4",
                grade = "user.grade4",
                age = "user.age4",
                address = "user.address4",
                bio = "user.bio4",
        )

        child_group1 = Group('gn1', 'owner1')
        child_group1.id = 55
        child_group2 = Group('gn2', 'owner2')
        child_group2.id = 56

        expected_group = Group('gn', 'owner')
        expected_group.id = 12
        expected_group.parentGroup = 42
        expected_group.members.append(member1)
        expected_group.members.append(member2)
        expected_group.admins.append(admin1)
        expected_group.admins.append(admin2)
        expected_group.childrenGroups.append(child_group1)
        expected_group.childrenGroups.append(child_group2)

        expected_output_body = '{"id": 12, "name": "gn", "parentGroup": 42, "groupOwner": "owner", "admins": ["cognito_id3", "cognito_id4"], "members": ["cognito_id1", "cognito_id2"], "childrenGroups": [55, 56]}'
        expected_output = 200, expected_output_body

        actual_output = lambda_function.get_output_translator(expected_group)
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


    def test_group_and_entity_input_translator(self):
        event = {'path': "url/id/for/group/and/entity/is/1/and/2"}
        input = lambda_function.group_and_entity_input_translator(event, "context")
        self.assertEqual(input, ('1', '2'))


    def test_put_parent_handler_switches_parents(self):
        group = Group('gn', self.cognito_id)
        old_parent_group = Group('old_pg', self.cognito_id)
        new_parent_group = Group('new_pg', self.cognito_id)
        old_parent_group.childrenGroups.append(group)

        self.session.add(group)
        self.session.add(old_parent_group)
        self.session.add(new_parent_group)
        self.session.commit()

        self.assertEqual(group.parentGroup, old_parent_group.id)

        input = str(group.id), str(new_parent_group.id)
        output = lambda_function.put_parent_handler(input, self.session, self.get_claims)
        self.session.commit()

        self.assertEqual(group.parentGroup, new_parent_group.id)

    def test_put_parent_handler_throws_when_requestor_not_parent_group_admin(self):
        group = Group('gn', self.cognito_id)
        old_parent_group = Group('old_pg', self.cognito_id)
        new_parent_group = Group('new_pg_wtf', self.cognito_id)
        old_parent_group.childrenGroups.append(group)

        self.session.add(group)
        self.session.add(old_parent_group)
        self.session.add(new_parent_group)

        self.session.commit()

        self.assertEqual(group.parentGroup, old_parent_group.id)

        input = str(group.id), str(new_parent_group.id)
        with self.assertRaises(AuthException) as e:
            output = lambda_function.put_parent_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner or admin')

    def test_put_parent_handler_throws_when_new_group_already_has_members(self):
        group = Group('gn', self.cognito_id)
        old_parent_group = Group('old_pg', self.cognito_id)
        new_parent_group = Group('new_pg', self.cognito_id)
        old_parent_group.childrenGroups.append(group)

        another_user = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        new_parent_group.members.append(another_user)

        self.session.add(group)
        self.session.add(old_parent_group)
        self.session.add(new_parent_group)
        self.session.commit()

        self.assertEqual(group.parentGroup, old_parent_group.id)

        input = str(group.id), str(new_parent_group.id)
        with self.assertRaises(Exception) as e:
            output = lambda_function.put_parent_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'Parent already has members')

    def test_put_parent_handler_throws_when_invalid_new_group_id(self):
        group = Group('gn', self.cognito_id)
        old_parent_group = Group('old_pg', self.cognito_id)
        old_parent_group.childrenGroups.append(group)

        self.session.add(group)
        self.session.add(old_parent_group)
        self.session.commit()

        self.assertEqual(group.parentGroup, old_parent_group.id)

        input = str(group.id), '42'
        with self.assertRaises(Exception) as e:
            output = lambda_function.put_parent_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'Issue adding group to parent')


    def test_post_member_handler_adds_member(self):
        admin_for_group = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        group = Group('gn', self.cognito_id)
        group.admins.append(admin_for_group)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.members), 0)

        input = group.id, self.cognito_id
        output = lambda_function.post_member_handler(input, self.session, self.another_get_claims)

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.members), 1)

    def test_post_member_handler_throws_when_requestor_not_admin(self):
        group = Group('gn', self.cognito_id)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.members), 0)

        input = group.id, self.cognito_id
        with self.assertRaises(AuthException) as e:
            output = lambda_function.post_member_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner or admin')

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.members), 0)

    def test_delete_member_handler_deletes_member(self):
        member = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        admin_for_group = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        group = Group('gn', self.cognito_id)
        group.admins.append(admin_for_group)
        group.members.append(member)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.members), 1)

        input = group.id, self.cognito_id
        output = lambda_function.delete_member_handler(input, self.session, self.another_get_claims)

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.members), 0)

    def test_delete_member_handler_throws_when_requestor_not_admin(self):
        member = self.session.query(User).filter(User.cognitoId==self.cognito_id).one()
        group = Group('gn', self.cognito_id)
        group.members.append(member)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.members), 1)

        input = group.id, self.cognito_id
        with self.assertRaises(AuthException) as e:
            output = lambda_function.delete_member_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner or admin')

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.members), 1)


    def test_post_admin_handler_adds_admin(self):
        group = Group('gn', self.cognito_id)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.admins), 0)

        input = group.id, self.another_cognito_id
        output = lambda_function.post_admin_handler(input, self.session, self.get_claims)

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.admins), 1)

    def test_post_admin_handler_throws_when_requestor_not_admin(self):
        group = Group('gn', self.cognito_id)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.admins), 0)

        input = group.id, self.another_cognito_id
        with self.assertRaises(AuthException) as e:
            output = lambda_function.post_admin_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner')

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.admins), 0)

    def test_delete_admin_handler_deletes_admin(self):
        admin_for_group = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        group = Group('gn', self.cognito_id)
        group.admins.append(admin_for_group)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.admins), 1)

        input = group.id, self.another_cognito_id
        output = lambda_function.delete_admin_handler(input, self.session, self.get_claims)

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.admins), 0)

    def test_delete_admin_handler_throws_when_requestor_not_admin(self):
        admin_for_group = self.session.query(User).filter(User.cognitoId==self.another_cognito_id).one()
        group = Group('gn', self.cognito_id)
        group.admins.append(admin_for_group)

        self.session.add(group)
        self.session.commit()

        self.assertEqual(len(group.admins), 1)

        input = group.id, self.another_cognito_id
        with self.assertRaises(AuthException) as e:
            output = lambda_function.delete_admin_handler(input, self.session, self.another_get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner')

        group = self.session.query(Group).filter(Group.id==group.id).one()

        self.assertEqual(len(group.admins), 1)


    def test_delete_deletes_for_owner(self):
        initial_group = Group('gn', self.cognito_id)
        self.session.add(initial_group)
        self.session.commit()

        self.assertEqual(self.session.query(Group).count(), 1)

        output = lambda_function.delete_handler(initial_group.id, self.session, self.get_claims)

        self.assertEqual(self.session.query(Group).count(), 0)

    def test_delete_throws_when_not_owner(self):
        initial_group = Group('gn', self.another_cognito_id)
        self.session.add(initial_group)
        self.session.commit()

        self.assertEqual(self.session.query(Group).count(), 1)

        with self.assertRaises(AuthException) as e:
            output = lambda_function.delete_handler(initial_group.id, self.session, self.get_claims)
        self.session.commit()
        self.assertEqual(str(e.exception), 'can only perform this action if you are group owner')

    def assertGroupEqual(self, expectedGroup, actualGroup):
        self.assertEqual(expectedGroup.name, actualGroup.name)
        self.assertEqual(expectedGroup.groupOwner, actualGroup.groupOwner)
        self.assertEqual(expectedGroup.parentGroup, actualGroup.parentGroup)

    def tearDown(self):
        # need to pull objects into memory to trigger deletion of associations
        user_query = self.session.query(User)
        for u in user_query:
            self.session.delete(u)
        self.session.query(Group).delete()
        self.session.commit()

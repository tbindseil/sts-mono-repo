from . import Base
from sqlalchemy import Column, Integer, ForeignKey, String

# see __init__.py for explanation as to how to import models within models


class GroupMembersLink(Base):
    __tablename__ = 'group_members_link'
    groupId = Column(Integer, ForeignKey('group.id'), primary_key=True)
    userId = Column(String(255), ForeignKey('users.cognitoId'), primary_key=True)

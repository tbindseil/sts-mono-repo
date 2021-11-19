from . import Base
from sqlalchemy import Column, Integer, ForeignKey, String

# Availability class is used, so we must define it here or else it has to be definied by clients of the Group class,
# and they don't necessarily know that they need to do this
# from .group import Group
# from .user import User


class GroupMembersLink(Base):
    __tablename__ = 'group_members_link'
    groupId = Column(Integer, ForeignKey('group.id'), primary_key=True)
    userId = Column(String(255), ForeignKey('users.cognitoId'), primary_key=True)

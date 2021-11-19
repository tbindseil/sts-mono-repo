from . import Base
from sqlalchemy import Column, Integer, ForeignKey, String

# see __init__.py for explanation as to how to import models within models


class GroupAdminsLink(Base):
    __tablename__ = 'group_admins_link'
    groupId = Column(Integer, ForeignKey('group.id'), primary_key=True)
    userId = Column(String(255), ForeignKey('users.cognitoId'), primary_key=True)

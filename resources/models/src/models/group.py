from . import Base
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship

# see __init__.py for explanation as to how to import models within models


class Group(Base):
    """ Group Model for giving users control over who they are exposed to """
    __tablename__ = "group"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(511), nullable=False)

    parentGroup = Column(Integer, ForeignKey('group.id'), nullable=True) # only null for OriginGroup

    groupOwner = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)
    admins = relationship("User", secondary='group_admins_link')

    # should only have members or children groups
    members = relationship("User", secondary='group_members_link')
    childrenGroups = relationship("Group", cascade="all, delete, delete-orphan")

    def __init__(self, name, groupOwner):
        self.name = name
        self.groupOwner = groupOwner

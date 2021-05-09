import datetime
import enum

from . import Base
from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship


class TypeEnum(enum.Enum):
    STUDENT = 0
    TUTOR = 1


class Inquiry(Base):
    """ Class Inquiry Model for storing inquiries to join class as tutor or student """
    __tablename__ = "inquiry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fromUser = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)
    forUser = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)
    classId = Column(Integer, ForeignKey('class.id'), nullable=False)
    type = Column(Enum(TypeEnum))
    denied = Column(Boolean, nullable=False, default=False)
    accepted = Column(Boolean, nullable=False, default=False)
    # TODO feedback
    createDate = Column(DateTime, nullable=False, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    lastUpdatedDate = Column(DateTime, nullable=False, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def __init__(self, forUser, classId, type):
        self.forUser = forUser
        self.classId = classId
        self.type = type

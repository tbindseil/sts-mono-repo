import datetime
import enum

from . import Base
from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship


class TypeEnum(enum.Enum):
    STUDENT_REFFERAL = 0
    STUDENT_REQUEST = 1
    TUTOR_REFFERAL = 2
    TUTOR_REQUEST = 3


class ClassInquiry(Base):
    """ Class Inquiry Model for storing inquiries to join class as tutor or student """
    __tablename__ = "ClassInquiry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fromUser = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)
    forUser = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)
    classId = Column(Integer, ForeignKey('class.id'), nullable=False)
    type = Column(Enum(TypeEnum))
    denied = Column(Boolean, nullable=False, default=False)
    # TODO feedback
    createDate = Column(DateTime, nullable=False)
    lastUpdatedDate = Column(DateTime, nullable=False)

    def __init__(self, fromUser, forUser, classId, status):
        self.fromUser = fromUser
        self.forUser = forUser
        self.classId = classId
        self.status = status
        self.createDate = datetime.datetime.now()
        self.lastUpdatedDate = datetime.datetime.now()

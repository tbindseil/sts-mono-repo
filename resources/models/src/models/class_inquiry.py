import datetime
import enum

from . import Base
from sqlalchemy import Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship


class TypeEnum(enum.Enum):
    STUDENT_REFERRAL = 0
    STUDENT_REQUEST = 1
    TUTOR_REFERRAL = 2
    TUTOR_REQUEST = 3


# TODO rename to Inquiry with table name inquiry
class ClassInquiry(Base):
    """ Class Inquiry Model for storing inquiries to join class as tutor or student """
    __tablename__ = "ClassInquiry"

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

    def __init__(self, fromUser, forUser, classId, type):
        self.fromUser = fromUser
        self.forUser = forUser
        self.classId = classId
        self.type = type

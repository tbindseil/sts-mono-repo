from datetime import datetime

from . import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

class Availability(Base):
    """ Availability Model for storing when users are available to tutor """
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subjects = Column(String(511), nullable=False)
    startTime = Column(DateTime, nullable=False)
    endTime = Column(DateTime, nullable=False)
    tutor = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)

    def __init__(self, subjects, startTime, endTime, tutor, **kwargs):
        self.subjects = subjects
        # some hoop jumping to ensure we get a datetime here
        self.startTime = startTime if type(startTime) is datetime else datetime.strptime(startTime, '%Y-%m-%dT%H:%M:%S.%fZ')
        self.endTime = endTime if type(endTime) is datetime else datetime.strptime(endTime, '%Y-%m-%dT%H:%M:%S.%fZ')
        self.tutor = tutor

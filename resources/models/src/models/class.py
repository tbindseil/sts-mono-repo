from datetime import datetime

from . import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from .student_class_association import student_class_association
from .tutor_class_association import tutor_class_association


class Class(Base):
    """ Class Model for grouping teachers, students, and tutors """
    __tablename__ = "class"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(511), nullable=False)
    teacher = Column(String(255), ForeignKey('users.cognitoId'), nullable=False)

    # don't add here until request/referral process is successfully completed
    students = relationship("User", secondary=student_class_association, back_populates="classesAsStudent")
    tutors = relationship("User", secondary=tutor_class_association, back_populates="classesAsTutors")

    def __init__(self, name, teacher):
        self.name = name
        self.tutor = tutor

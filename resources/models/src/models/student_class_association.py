from . import Base
from sqlalchemy import Column, ForeignKey, Integer, Table


student_class_association = Table('student_class_association', Base.metadata,
        Column('student_id', Integer, ForeignKey('users.cognitoId')),
        Column('class_id', Integer, ForeignKey('class.id'))
)

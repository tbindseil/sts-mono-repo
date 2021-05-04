from . import Base
from sqlalchemy import Column, ForeignKey, Integer, String, Table


student_class_association = Table('student_class_association', Base.metadata,
        Column('student_id', String(255), ForeignKey('users.cognitoId')),
        Column('class_id', Integer, ForeignKey('class.id'))
)

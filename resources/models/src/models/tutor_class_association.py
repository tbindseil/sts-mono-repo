from . import Base
from sqlalchemy import Column, ForeignKey, Integer, Table


tutor_class_association = Table('tutor_class_association', Base.metadata,
        Column('tutor_id', Integer, ForeignKey('users.cognitoId')),
        Column('class_id', Integer, ForeignKey('class.id'))
)

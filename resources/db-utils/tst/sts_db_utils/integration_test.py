import unittest
import datetime
from sqlalchemy.orm import sessionmaker

from src.sts_db_utils.sts_db_utils import get_database_engine

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class ForTests(Base):
    """ Test Model for testing database aspect"""
    __tablename__ = "for_tests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    value = Column(Integer)

    def __init__(self, value):
        self.value = value


class TestGetConnectionUrl(unittest.TestCase):
    def test_engine(self):
        try:
            engine = get_database_engine()

            ForTests.__table__.create(engine)

            Session = sessionmaker(bind=engine)
            session = Session()

            intial_user = session.query(User).filter(User.cognitoId==cognito_id).one()

            initial_user.value = initial_user.value + 42;
            session.commit()

            resulting_user = session.query(User).filter(User.cognitoId==cognito_id).one()
    
            if resulting_user.value == initial_user.value:
                print("SUCESS")
            else:
                print("FAILURE")
                print("")
        except Exception as e:
            print("FAILURE")
            print("exception:")
            print(e)

        ForTests.__table__.drop(engine)


if __name__ == '__main__':
    test()



    # there's a weird locking thing where the availability could be canceled right as
    # it is requested. That means that the canceled response needs to be tied to the cancel
    # request... duh

    # solution to cold start problem
    # vip -> ec2 -> lambda
    # request comes in
    # ec2 handles if it can, but ensures lambda is started
    # once ec2 can't handle anymore request, hopefully lambda is running and no cold starts

    # I think this loses a lot of the cost benefit of lambdas

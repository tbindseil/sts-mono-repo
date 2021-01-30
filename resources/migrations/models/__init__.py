import os
import datetime
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

TOKEN_EXPIRE_TIME_DELTA = datetime.timedelta(days=7, seconds=0)

SECRET_KEY = os.getenv('SECRET_KEY', 'my_precious_dev')

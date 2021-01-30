import datetime
import jwt
import bcrypt

from . import Base, TOKEN_EXPIRE_TIME_DELTA, SECRET_KEY
from sqlalchemy import Column, DateTime, Boolean, Integer, String


class User(Base):
    """ User Model for storing user related details """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    registered_on = Column(DateTime, nullable=False)
    admin = Column(Boolean, nullable=False, default=False)

    def __init__(self, username, password, admin=False):
        self.username = username
        self.password = bcrypt.hashpw(password, bcrypt.gensalt(14)).decode()
        self.registered_on = datetime.datetime.now()
        self.admin = admin

    def encode_token(self, user_id):
        """
        Generates the Auth Token
        :return: string
        """
        
        payload = {
            'exp': datetime.datetime.utcnow() + TOKEN_EXPIRE_TIME_DELTA,
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            SECRET_KEY,
            algorithm='HS256'
        )

    @staticmethod
    def decode_token(token):
        """
        Validates the auth token
        :param token:
        :return: integer|string
        """
        try:
            payload = jwt.decode(token, SECRET_KEY)
            is_invalidated_token = InvalidatedToken.check_if_invalidated(token)
            if is_invalidated_token:
                return 'Token invalidated. Please log in again.'
            else:
                return payload['sub']
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'


class InvalidatedToken(Base):
    """
    Token Model for storing JWT tokens
    """
    __tablename__ = 'invalidated_tokens'

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(500), unique=True, nullable=False)
    invalidated_on = Column(DateTime, nullable=False)

    def __init__(self, token):
        self.token = token
        self.invalidated_on = datetime.datetime.now()

    def __repr__(self):
        return '<id: token: {}'.format(self.token)

    @staticmethod
    def check_if_invalidated(token):
        # check whether auth token has been invalidated
        res = InvalidatedToken.query.filter_by(token=str(token)).first()
        if res:
            return True
        else:
            return False

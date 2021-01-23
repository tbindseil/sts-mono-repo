#import datetime
#
#import os
#basedir = os.path.abspath(os.path.dirname(__file__))
#postgres_local_base = 'postgresql:///'
#database_name = 'flask_jwt_auth'
#
#
#def get_secret_key():
#    return os.getenv('SECRET_KEY', 'my_precious_dev')
#
#class BaseConfig:
#    """Base configuration."""
#    SECRET_KEY = get_secret_key()
#    DEBUG = False
#    BCRYPT_LOG_ROUNDS = 13
#    SQLALCHEMY_TRACK_MODIFICATIONS = False
#    TOKEN_EXPIRE_TIME_DELTA = datetime.timedelta(days=7, seconds=0)
#
#
#class DevelopmentConfig(BaseConfig):
#    """Development configuration."""
#    DEBUG = True
#    BCRYPT_LOG_ROUNDS = 4
#    SQLALCHEMY_DATABASE_URI = postgres_local_base + database_name
#
#
#class TestingConfig(BaseConfig):
#    """Testing configuration."""
#    DEBUG = True
#    TESTING = True
#    BCRYPT_LOG_ROUNDS = 4
#    SQLALCHEMY_DATABASE_URI = postgres_local_base + database_name + '_test'
#    PRESERVE_CONTEXT_ON_EXCEPTION = False
#    TOKEN_EXPIRE_TIME_DELTA = datetime.timedelta(days=0, seconds=5)
#
#
#class ProductionConfig(BaseConfig):
#    """Production configuration."""
#    DEBUG = False
#    SQLALCHEMY_DATABASE_URI = 'postgresql:///example'

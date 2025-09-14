import os


class Config:
    """Base configuration class."""


class ProdConfig(Config):
    """Production configuration class."""
    FLASK_ENV = "production"
    DEBUG = False
    TESTING = False
    
    PROD_PASSCODE = os.environ.get("PROD_PASSCODE")


class DevConfig(Config):
    """Development configuration class."""
    FLASK_ENV = "development"
    DEBUG = True
    TESTING = True
    
    PROD_PASSCODE = "1111"
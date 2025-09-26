import os


class Config:
    """Base configuration class."""
    EMAIL_USERNAME = os.environ.get("EMAIL_USERNAME")
    EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
    EMAIL_DEFAULT_SENDER = os.environ.get("EMAIL_DEFAULT_SENDER")

    PASSCODE = os.environ.get("PASSCODE")


class ProdConfig(Config):
    """Production configuration class."""
    FLASK_ENV = "production"
    DEBUG = False
    TESTING = False


class DevConfig(Config):
    """Development configuration class."""
    FLASK_ENV = "development"
    DEBUG = True
    TESTING = True

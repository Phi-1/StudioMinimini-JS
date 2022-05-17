from uuid import uuid4
from hashlib import sha256

class Admin:

    # Contains tokens of active admins
    ADMINS = []
    PASSWORD = None

    @staticmethod
    def set_password(password: str) -> None:
        # Only allow password to be set once by checking if it's None
        if Admin.PASSWORD == None:
            Admin.PASSWORD = sha256(password.encode())

    @staticmethod
    def admin_login(password: str) -> str:
        """Returns admin token when password is correct, None otherwise"""
        if sha256(password.encode()).digest() == Admin.PASSWORD.digest():
            token = str(uuid4())
            Admin.ADMINS.append(token)
            return token
        return None

    @staticmethod
    def check_token(token: str) -> bool:
        """Checks user admin token against active admins, and returns whether there is a match"""
        return token in Admin.ADMINS
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Use an environment variable for production. Use a fallback for dev only.
SECRET_KEY = os.getenv("SECRET_KEY", "insecure-dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create a password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔑 Function to verify the password during login
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 🔒 Function to hash password before saving during registration
def get_password_hash(password):
    return pwd_context.hash(password)

# 🔐 Create a JWT token for authenticated users
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 🔎 Decode and verify a token on protected routes
def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

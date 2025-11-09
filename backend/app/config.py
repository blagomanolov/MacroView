from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Read the DATABASE_URL, fallback to a default if not set
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://cap:capapc@localhost:5432/countries_db"
)

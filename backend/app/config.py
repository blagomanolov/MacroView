from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://cap:capapc@localhost:5432/countries_db"
)

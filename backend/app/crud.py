from sqlalchemy.orm import Session
import models 
import schemas
from passlib.context import CryptContext

def get_countries(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve a paginated list of countries.

    Args:
        db (Session): Active database session.
        skip (int): Number of records to skip.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Country]: Countries ordered by default query ordering.
    """
    return db.query(models.Country).offset(skip).limit(limit).all()

def get_country_by_name(db: Session, name: str):
    """
    Get a single country by its name.

    Args:
        db (Session): Active database session.
        name (str): Country name to search for.

    Returns:
        models.Country | None: The country if found, otherwise None.
    """
    return db.query(models.Country).filter(models.Country.name == name).first()

def create_country(db: Session, country: schemas.CountryCreate):
    """
    Create and persist a new country record.

    Args:
        db (Session): Active database session.
        country (schemas.CountryCreate): Payload with country fields.

    Returns:
        models.Country: The newly created country.
    """
    db_country = models.Country(**country.dict())
    db.add(db_country)
    db.commit()
    db.refresh(db_country)
    return db_country


def create_gdp(db: Session, gdp: schemas.GDPCreate):
    """
    Create and persist a GDP record.

    Args:
        db (Session): Active database session.
        gdp (schemas.GDPCreate): GDP payload including country code, year, and value.

    Returns:
        models.GDP: The newly created GDP record.
    """
    db_gdp = models.GDP(**gdp.dict())
    db.add(db_gdp)
    db.commit()
    db.refresh(db_gdp)
    return db_gdp

def get_gdp_by_country(db: Session, country_code: str, limit: int = 50):
    """
    Retrieve recent GDP records for a country ordered by year descending.

    Args:
        db (Session): Active database session.
        country_code (str): ISO country code.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.GDP]: GDP records for the country.
    """
    return db.query(models.GDP).filter(models.GDP.country_code == country_code).order_by(models.GDP.year.desc()).limit(limit).all()


def get_export_by_country(db: Session, country_code: str, limit: int = 50):
    """
    Retrieve export records for a country.

    Args:
        db (Session): Active database session.
        country_code (str): ISO country code.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Export]: Export records for the country.
    """
    return db.query(models.Export).filter(models.Export.country_code == country_code).limit(limit).all()

def get_export_by_product(db: Session, product: str, limit: int = 10):
    """
    Retrieve export records filtered by product name.

    Args:
        db (Session): Active database session.
        product (str): Product name.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Export]: Export records for the product.
    """
    return db.query(models.Export).filter(models.Export.product == product).limit(limit).all()

def get_export_by_product_and_country(db: Session, product: str, country_code: str, limit: int = 10):
    """
    Retrieve export records filtered by product and country.

    Args:
        db (Session): Active database session.
        product (str): Product name.
        country_code (str): ISO country code.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Export]: Export records for the product and country.
    """
    return db.query(models.Export).filter(models.Export.product == product, models.Export.country_code == country_code).limit(limit).all()

def get_import_by_country(db: Session, country_code: str, limit: int = 50):
    """
    Retrieve import records for a country.

    Args:
        db (Session): Active database session.
        country_code (str): ISO country code.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Import]: Import records for the country.
    """
    return db.query(models.Import).filter(models.Import.country_code == country_code).limit(limit).all()

def get_import_by_product(db: Session, product: str, limit: int = 10):
    """
    Retrieve import records filtered by product name.

    Args:
        db (Session): Active database session.
        product (str): Product name.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Import]: Import records for the product.
    """
    return db.query(models.Import).filter(models.Import.product == product).limit(limit).all()

def get_import_by_product_and_country(db: Session, product: str, country_code: str, limit: int = 10):
    """
    Retrieve import records filtered by product and country.

    Args:
        db (Session): Active database session.
        product (str): Product name.
        country_code (str): ISO country code.
        limit (int): Maximum number of records to return.

    Returns:
        list[models.Import]: Import records for the product and country.
    """
    return db.query(models.Import).filter(models.Import.product == product, models.Import.country_code == country_code).limit(limit).all()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Hash a plaintext password using the configured password hashing context.

    Args:
        password (str): Plaintext password.

    Returns:
        str: Hashed password string.
    """
    return pwd_context.hash(password)


def create_user(db: Session, user: schemas.UserCreate):
    """
    Create a new user with a securely hashed password.

    Args:
        db (Session): Active database session.
        user (schemas.UserCreate): User payload including email and password.

    Returns:
        models.User: The newly created user.
    """
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    """
    Retrieve a user by email address.

    Args:
        db (Session): Active database session.
        email (str): Email to search for.

    Returns:
        models.User | None: The user if found, otherwise None.
    """
    return db.query(models.User).filter(models.User.email == email).first()
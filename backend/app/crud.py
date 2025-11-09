from sqlalchemy.orm import Session
import models 
import schemas
from passlib.context import CryptContext

def get_countries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Country).offset(skip).limit(limit).all()

def get_country_by_name(db: Session, name: str):
    return db.query(models.Country).filter(models.Country.name == name).first()

def create_country(db: Session, country: schemas.CountryCreate):
    db_country = models.Country(**country.dict())
    db.add(db_country)
    db.commit()
    db.refresh(db_country)
    return db_country


def create_gdp(db: Session, gdp: schemas.GDPCreate):
    db_gdp = models.GDP(**gdp.dict())
    db.add(db_gdp)
    db.commit()
    db.refresh(db_gdp)
    return db_gdp

def get_gdp_by_country(db: Session, country_code: str, limit: int = 50):
    return db.query(models.GDP).filter(models.GDP.country_code == country_code).order_by(models.GDP.year.desc()).limit(limit).all()


def get_export_by_country(db: Session, country_code: str, limit: int = 50):
    return db.query(models.Export).filter(models.Export.country_code == country_code).limit(limit).all()

def get_export_by_product(db: Session, product: str, limit: int = 10):
    return db.query(models.Export).filter(models.Export.product == product).limit(limit).all()

def get_export_by_product_and_country(db: Session, product: str, country_code: str, limit: int = 10):
    return db.query(models.Export).filter(models.Export.product == product, models.Export.country_code == country_code).limit(limit).all()

def get_import_by_country(db: Session, country_code: str, limit: int = 50):
    return db.query(models.Import).filter(models.Import.country_code == country_code).limit(limit).all()

def get_import_by_product(db: Session, product: str, limit: int = 10):
    return db.query(models.Import).filter(models.Import.product == product).limit(limit).all()

def get_import_by_product_and_country(db: Session, product: str, country_code: str, limit: int = 10):
    return db.query(models.Import).filter(models.Import.product == product, models.Import.country_code == country_code).limit(limit).all()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
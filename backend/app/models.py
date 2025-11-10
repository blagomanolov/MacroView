"""SQLAlchemy ORM models for countries, GDP, trade data, and users."""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base
from sqlalchemy.sql import func

class Country(Base):
    """Country metadata including codes, demographics, currency, and language."""
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    country_code = Column(String, unique=True)
    capital = Column(String)
    region = Column(String)
    subregion = Column(String)
    population = Column(Integer)
    area = Column(Float)
    currency_code = Column(String)
    currency_name = Column(String)
    language = Column(String)
    flag = Column(String)
    indipendent = Column(Boolean)


class GDP(Base):
    """Gross Domestic Product records per country and year."""
    __tablename__ = "gdp"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, index=True)
    year = Column(String, index=True)
    gdp_value = Column(Float, nullable=True)
    growth_percent = Column(String, nullable=True)
    currency = Column(String, default="US$")

class Export(Base):
    """Export data by product, partner country, year, and values."""
    __tablename__ = 'exports'
    
    id = Column(String, primary_key=True, index=True)
    country_code = Column(String, index=True)
    country = Column(String)
    export_to = Column(String)
    export_country_code = Column(String, nullable=True)
    year = Column(Integer, index=True)
    product = Column(String, index=True)
    export_value_usd_thousand = Column(Float, nullable=True)


class Import(Base):
    """Import data by product, partner country, year, and values."""
    __tablename__ = 'imports'

    id = Column(String, primary_key=True, index=True)
    country_code = Column(String, index=True)
    country = Column(String)
    import_from =Column(String)
    import_country_code = Column(String, nullable=True)
    year = Column(Integer, index=True)
    product = Column(String, index=True)
    import_value_usd_thousand = Column(Float, nullable=True)


class User(Base):
    """Application user accounts with hashed credentials and timestamps."""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
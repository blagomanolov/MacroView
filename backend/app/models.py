from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

class Country(Base):
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
    __tablename__ = "gdp"

    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, index=True)
    year = Column(String, index=True)
    gdp_value = Column(Float, nullable=True)
    growth_percent = Column(String, nullable=True)
    currency = Column(String, default="US$")

class Export(Base):
    __tablename__ = 'exports'
    
    index = Column(String, primary_key=True, index=True)
    country_code = Column(String, index=True)
    country = Column(String)
    export_to = Column(String)
    export_country_code = Column(String, nullable=True)
    year = Column(Integer, index=True)
    product = Column(String, index=True)
    export_value_usd_thousand = Column(Float, nullable=True)
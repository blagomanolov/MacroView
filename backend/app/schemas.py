from pydantic import BaseModel
from typing import Optional

class CountryBase(BaseModel):
    name: str
    country_code: str
    capital: str
    region: str
    subregion: str
    population: int
    area: float
    currency_code: str
    currency_name: str
    language: str
    flag: str
    indipendent: bool

class CountryCreate(CountryBase):
    pass

class CountryResponse(CountryBase):
    id: int

    class Config:
        orm_mode = True


class GDPBase(BaseModel):
    country_code: str
    year: str
    gdp_value: float
    growth_percent:  Optional[str] = None
    currency: str = "US$"

class GDPCreate(GDPBase):
    pass

class GDPResponse(GDPBase):
    id: int

    class Config:
        orm_mode = True

class ExportBase(BaseModel):
    country_code: str
    country: str
    export_to: str
    export_country_code: Optional[str] = None
    year: int
    product: str
    export_value_usd_thousand: Optional[float] = None

class ExportCreate(ExportBase):
    pass

class ExportResponse(ExportBase):
    index: str

    class Config:
        orm_mode = True

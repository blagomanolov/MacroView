import requests
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import models, crud, schemas

Base.metadata.create_all(bind=engine)

def fetch_countries():
    """
    Fetch the list of countries from the external API.

    Returns:
        list[dict]: Parsed JSON payload representing countries.
    """
    url = "https://www.apicountries.com/countries"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def save_countries_to_db(countries_data):
    """
    Persist countries to the database if they do not already exist.

    Args:
        countries_data (list[dict]): List of country records from the API.
    """
    db: Session = SessionLocal()
    try:
        for country in countries_data:
            country_data = schemas.CountryCreate(
                name=country.get("name"),
                country_code=country.get("alpha2Code", ""),
                capital=country.get("capital", ""),
                region=country.get("region", ""),
                subregion=country.get("subregion", ""), 
                population=country.get("population", 0),
                area=country.get("area", 0),
                currency_code = country.get("currencies", [{}])[0].get("code", ""),
                currency_name = country.get("currencies", [{}])[0].get("name", ""),
                language = country.get("languages", [{}])[0].get("name", ""),
                flag=country.get("flag", ""),
                indipendent=country.get("independent", False)
            )
            existing = crud.get_country_by_name(db, country_data.name)
            if not existing:
                crud.create_country(db, country_data)
        print("Countries saved successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    countries = fetch_countries()
    save_countries_to_db(countries)

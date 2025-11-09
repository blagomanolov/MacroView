import requests
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
import models, crud, schemas

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def fetch_countries():
    url = "https://www.apicountries.com/countries"
    response = requests.get(url)
    response.raise_for_status()  # Raise error if request fails
    return response.json()  # Assuming the API returns JSON

def save_countries_to_db(countries_data):
    db: Session = SessionLocal()
    try:
        for country in countries_data:
            # Prepare country schema
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
            # Check if country already exists
            existing = crud.get_country_by_name(db, country_data.name)
            if not existing:
                crud.create_country(db, country_data)
        print("Countries saved successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    countries = fetch_countries()
    save_countries_to_db(countries)

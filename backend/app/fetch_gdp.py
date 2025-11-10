import requests
from database import SessionLocal, Base, engine
import models, crud, schemas

Base.metadata.create_all(bind=engine)

def get_all_country_codes():
    """
    Retrieve all non-empty country codes from the database.

    Returns:
        list[str]: A list of country code strings.
    """
    db = SessionLocal()
    try:
        countries = db.query(models.Country).all()
        return [country.country_code for country in countries if country.country_code]
    finally:
        db.close()

def fetch_gdp_for_country(country_code: str):
    """
    Fetch World Bank GDP data for a given country code.

    Args:
        country_code (str): The ISO country code to query.

    Returns:
        list[schemas.GDPCreate]: A list of GDPCreate objects with year, value, and currency.
    """
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/NY.GDP.MKTP.CD?format=json&per_page=100"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    gdp_entries = data[1] if len(data) > 1 and data[1] is not None else []

    results = []
    for entry in gdp_entries:
        if entry.get("value") is not None:
            gdp = schemas.GDPCreate(
                country_code=entry["country"]["id"],
                year=entry["date"],
                gdp_value=entry["value"],
                currency="US$"
            )
            results.append(gdp)

    if not results:
        print(f"No GDP data found for {country_code}")

    return results


def save_gdp_to_db(gdp_list):
    """
    Persist GDP records to the database and compute year-over-year growth.

    The input is sorted by year to compute growth percentage based on the
    previous year's value. Growth is stored as a formatted percentage string.

    Args:
        gdp_list (list[schemas.GDPCreate]): The GDP records to save.
    """
    db = SessionLocal()
    try:
        gdp_list_sorted = sorted(gdp_list, key=lambda x: x.year)
        previous_value = None
        for gdp in gdp_list_sorted:
            if previous_value is not None:
                gdp.growth_percent = f"{(((gdp.gdp_value - previous_value) / previous_value) * 100):.2f} %"
            else:
                gdp.growth_percent = None
            previous_value = gdp.gdp_value
            crud.create_gdp(db, gdp)
        print(f"{len(gdp_list_sorted)} GDP records saved with growth_percent!")
    finally:
        db.close()


if __name__ == "__main__":
    country_codes = get_all_country_codes()
    for code in country_codes:
        print(f"Fetching GDP for {code}...")
        gdp_list = fetch_gdp_for_country(code)
        save_gdp_to_db(gdp_list)

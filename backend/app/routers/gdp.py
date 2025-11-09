from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, database

router = APIRouter(prefix="/gdp", tags=["GDP"])

@router.get("/{country_code}", response_model=List[schemas.GDPResponse])
def read_gdp_by_country(
    country_code: str,
    limit: int = Query(50, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    gdp_data = crud.get_gdp_by_country(db, country_code, limit=limit)
    if not gdp_data:
        raise HTTPException(status_code=404, detail=f"No GDP data found for {country_code}")
    return gdp_data

@router.get("/", response_model=List[schemas.GDPResponse])
def read_all_gdp(
    skip: int = 0,
    limit: int = Query(100, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    return db.query(crud.models.GDP).offset(skip).limit(limit).all()


@router.get("/{country_code}/latest", response_model=schemas.GDPResponse)
def read_latest_gdp(country_code: str, db: Session = Depends(database.get_db)):
    gdp_data = crud.get_gdp_by_country(db, country_code, limit=1)
    if not gdp_data:
        raise HTTPException(status_code=404, detail=f"No GDP data found for {country_code}")
    return gdp_data[0]

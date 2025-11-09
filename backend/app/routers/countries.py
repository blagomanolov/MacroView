# routers/countries.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
import schemas
import database

router = APIRouter(prefix="/countries", tags=["Countries"])

@router.get("/", response_model=List[schemas.CountryResponse])
def read_countries(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_countries(db, skip=skip, limit=limit)

@router.get("/{name}", response_model=schemas.CountryResponse)
def read_country(name: str, db: Session = Depends(database.get_db)):
    db_country = crud.get_country_by_name(db, name=name)
    if db_country is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return db_country

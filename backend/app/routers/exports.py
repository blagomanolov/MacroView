from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, database

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("/", response_model=List[schemas.ExportResponse])
def read_all_exports(
    skip: int = 0,
    limit: int = Query(100, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    return db.query(crud.models.Export).offset(skip).limit(limit).all()


@router.get("/country/{country_code}", response_model=List[schemas.ExportResponse])
def read_exports_by_country_code(
    country_code: str,
    limit: int = Query(50, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    extract_data = crud.get_export_by_country(db, country_code, limit=limit)
    if not extract_data:
        raise HTTPException(status_code=404, detail=f"No Export data found for {country_code}")
    return extract_data

@router.get("/product/{product}", response_model=List[schemas.ExportResponse])
def read_exports_by_product(
    product: str,
    limit: int = Query(10, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    extract_data = crud.get_export_by_product(db, product, limit=limit)
    if not extract_data:
        raise HTTPException(status_code=404, detail=f"No Export data found for {product}")
    return extract_data
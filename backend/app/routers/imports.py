from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, database

router = APIRouter(prefix="/imports", tags=["Imports"])

@router.get("/", response_model=List[schemas.ImportResponse])
def read_all_imports(
    skip: int = 0,
    limit: int = Query(100, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    return db.query(crud.models.Import).offset(skip).limit(limit).all()


@router.get("/country/{country_code}", response_model=List[schemas.ImportResponse])
def read_imports_by_country_code(
    country_code: str,
    limit: int = Query(50, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    import_data = crud.get_import_by_country(db, country_code, limit=limit)
    if not import_data:
        raise HTTPException(status_code=404, detail=f"No Import data found for {country_code}")
    return import_data

@router.get("/product/{product}", response_model=List[schemas.ImportResponse])
def read_imports_by_product(
    product: str,
    limit: int = Query(10, description="Max number of records to return"),
    db: Session = Depends(database.get_db)
):
    import_data = crud.get_import_by_product(db, product, limit=limit)
    if not import_data:
        raise HTTPException(status_code=404, detail=f"No Import data found for {product}")
    return import_data
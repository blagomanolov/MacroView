from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, database, models, utils
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer



router = APIRouter(prefix="/user", tags=["User"])

@router.post("/register", response_model=schemas.UserOut)
def read_gdp_by_country(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db)
):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user: 
        raise HTTPException(status_code=400, detail="Email already registered!")
    return crud.create_user(db, user)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = utils.create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

@router.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    payload = utils.verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"message": "You are authorized!", "user": payload.get("sub")}
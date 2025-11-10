from fastapi import FastAPI
from database import Base, engine
from routers import countries, gdp, exports, user, imports

from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Country API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(countries.router)
app.include_router(gdp.router)
app.include_router(exports.router)
app.include_router(user.router)
app.include_router(imports.router)
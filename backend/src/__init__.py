from fastapi import FastAPI

 
from contextlib import asynccontextmanager

from src.db.main import init_db
from src.auth.routes import auth_router
from src.admin import admin_router
from src.admin.auth_routes import admin_auth_router 
from src.user import user_router
from fastapi.middleware.cors import CORSMiddleware
from src.home.routes import home_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    print(f"Server is starting...")
    await init_db()
    yield
    print(f"Server has been stopped.")
     

version = "v1"

app = FastAPI(
    title = "VistaVoyage",
    description = "A platform for managing and sharing travel itineraries.",
    version=version,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth_router,prefix = f"/api/{version}/auth",tags=["auth"])
app.include_router(admin_auth_router,prefix = f"/api/{version}/admin/auth",tags=["admin_auth"])
app.include_router(admin_router,prefix = f"/api/{version}/admin",tags=["admin"]) 
app.include_router(user_router,prefix = f"/api/{version}/user",tags=["user"]) 
app.include_router(home_router, prefix=f"/api/{version}/home", tags=["home"])

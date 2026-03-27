from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'maintenance-log-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class UserInfo(BaseModel):
    username: str
    role: str


class PasswordReset(BaseModel):
    username: str
    new_password: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role", "user")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"username": username, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user


class MaintenanceLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    machine_name: str
    location: str
    work_description: str
    spare_parts: str
    total_time: Optional[str] = ""
    technician_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MaintenanceLogCreate(BaseModel):
    date: str
    machine_name: str
    location: str
    work_description: str
    spare_parts: str
    total_time: str
    technician_name: str


class MaintenanceLogUpdate(BaseModel):
    date: Optional[str] = None
    machine_name: Optional[str] = None
    location: Optional[str] = None
    work_description: Optional[str] = None
    spare_parts: Optional[str] = None
    total_time: Optional[str] = None
    technician_name: Optional[str] = None


class ConfigItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str


class ConfigItemCreate(BaseModel):
    name: str
    type: str


@api_router.get("/")
async def root():
    return {"message": "Maintenance Log API", "status": "online"}


@api_router.get("/health")
async def health_check():
    try:
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserRegister):
    existing_user = await db.users.find_one({"username": user_input.username}, {"_id": 0})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "user"
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "username": user_input.username,
        "password_hash": hash_password(user_input.password),
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user_input.username, "role": role})
    return {"access_token": access_token, "token_type": "bearer", "role": role}


@api_router.post("/auth/login", response_model=Token)
async def login(user_input: UserLogin):
    user = await db.users.find_one({"username": user_input.username}, {"_id": 0})
    
    if not user or not verify_password(user_input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user_input.username, "role": user.get("role", "user")})
    return {"access_token": access_token, "token_type": "bearer", "role": user.get("role", "user")}


@api_router.get("/auth/me", response_model=UserInfo)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "role": current_user["role"]}


@api_router.get("/auth/users")
async def list_users(current_user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users


@api_router.post("/auth/reset-password")
async def reset_password(reset_data: PasswordReset, current_user: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"username": reset_data.username}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_password_hash = hash_password(reset_data.new_password)
    
    await db.users.update_one(
        {"username": reset_data.username},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": f"Password reset successfully for user: {reset_data.username}"}


@api_router.post("/logs", response_model=MaintenanceLog)
async def create_log(log_input: MaintenanceLogCreate, current_user: dict = Depends(get_current_user)):
    log_dict = log_input.model_dump()
    log_obj = MaintenanceLog(**log_dict)
    
    doc = log_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.maintenance_logs.insert_one(doc)
    return log_obj


@api_router.get("/logs", response_model=List[MaintenanceLog])
async def get_logs(current_user: dict = Depends(get_current_user)):
    logs = await db.maintenance_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for log in logs:
        if isinstance(log['created_at'], str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
    
    return logs


@api_router.get("/logs/{log_id}", response_model=MaintenanceLog)
async def get_log(log_id: str, current_user: dict = Depends(get_current_user)):
    log = await db.maintenance_logs.find_one({"id": log_id}, {"_id": 0})
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    if isinstance(log['created_at'], str):
        log['created_at'] = datetime.fromisoformat(log['created_at'])
    
    return log


@api_router.put("/logs/{log_id}", response_model=MaintenanceLog)
async def update_log(log_id: str, log_update: MaintenanceLogUpdate, current_user: dict = Depends(get_admin_user)):
    existing_log = await db.maintenance_logs.find_one({"id": log_id}, {"_id": 0})
    
    if not existing_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    update_data = {k: v for k, v in log_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.maintenance_logs.update_one(
            {"id": log_id},
            {"$set": update_data}
        )
    
    updated_log = await db.maintenance_logs.find_one({"id": log_id}, {"_id": 0})
    
    if isinstance(updated_log['created_at'], str):
        updated_log['created_at'] = datetime.fromisoformat(updated_log['created_at'])
    
    return updated_log


@api_router.delete("/logs/{log_id}")
async def delete_log(log_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.maintenance_logs.delete_one({"id": log_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    
    return {"message": "Log deleted successfully"}


@api_router.get("/config", response_model=List[ConfigItem])
async def get_config(current_user: dict = Depends(get_current_user)):
    config_items = await db.config_items.find({}, {"_id": 0}).to_list(1000)
    return config_items


@api_router.post("/config", response_model=ConfigItem)
async def create_config(config_input: ConfigItemCreate, current_user: dict = Depends(get_admin_user)):
    existing = await db.config_items.find_one(
        {"name": config_input.name, "type": config_input.type},
        {"_id": 0}
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="Item already exists")
    
    config_dict = config_input.model_dump()
    config_obj = ConfigItem(**config_dict)
    
    doc = config_obj.model_dump()
    await db.config_items.insert_one(doc)
    
    return config_obj


@api_router.delete("/config/{config_id}")
async def delete_config(config_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.config_items.delete_one({"id": config_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Config item not found")
    
    return {"message": "Config item deleted successfully"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)@api_router.get("/logs", response_model=List[MaintenanceLog])
async def get_logs(current_user: dict = Depends(get_current_user)):
    logs = await db.maintenance_logs.find({}, {"_id": 0}).to_list(1000)
    
    for log in logs:
        if isinstance(log['created_at'], str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
    
    # Sort by date field (newest first)
    def parse_date(log):
        try:
            # Try parsing different date formats
            date_str = log.get('date', '')
            # Format: "Mar 14, 2026" or "March 14th, 2026"
            for fmt in ["%b %d, %Y", "%B %d, %Y", "%B %dth, %Y", "%B %dst, %Y", "%B %dnd, %Y", "%B %drd, %Y"]:
                try:
                    # Remove ordinal suffixes (st, nd, rd, th)
                    clean_date = date_str.replace('st,', ',').replace('nd,', ',').replace('rd,', ',').replace('th,', ',')
                    return datetime.strptime(clean_date, fmt)
                except:
                    continue
            return datetime.min
        except:
            return datetime.min
    
    logs.sort(key=parse_date, reverse=True)
    
    return logs

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

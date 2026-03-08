from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


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
    return {"message": "Maintenance Log API"}


@api_router.post("/logs", response_model=MaintenanceLog)
async def create_log(log_input: MaintenanceLogCreate):
    log_dict = log_input.model_dump()
    log_obj = MaintenanceLog(**log_dict)
    
    doc = log_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.maintenance_logs.insert_one(doc)
    return log_obj


@api_router.get("/logs", response_model=List[MaintenanceLog])
async def get_logs():
    logs = await db.maintenance_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for log in logs:
        if isinstance(log['created_at'], str):
            log['created_at'] = datetime.fromisoformat(log['created_at'])
    
    return logs


@api_router.get("/logs/{log_id}", response_model=MaintenanceLog)
async def get_log(log_id: str):
    log = await db.maintenance_logs.find_one({"id": log_id}, {"_id": 0})
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    if isinstance(log['created_at'], str):
        log['created_at'] = datetime.fromisoformat(log['created_at'])
    
    return log


@api_router.put("/logs/{log_id}", response_model=MaintenanceLog)
async def update_log(log_id: str, log_update: MaintenanceLogUpdate):
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
async def delete_log(log_id: str):
    result = await db.maintenance_logs.delete_one({"id": log_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    
    return {"message": "Log deleted successfully"}


@api_router.get("/config", response_model=List[ConfigItem])
async def get_config():
    config_items = await db.config_items.find({}, {"_id": 0}).to_list(1000)
    return config_items


@api_router.post("/config", response_model=ConfigItem)
async def create_config(config_input: ConfigItemCreate):
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
async def delete_config(config_id: str):
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
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
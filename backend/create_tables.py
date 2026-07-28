from database import engine
from models import SQLModel
SQLModel.metadata.create_all(engine)
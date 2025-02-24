from sqlalchemy import Column, String, JSON
from src.python_backend.database import Base

class Sheet(Base):
    __tablename__ = "sheets"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    index_column = Column(String, nullable=True)
    columns = Column(JSON)
    data = Column(JSON)
    sources = Column(JSON, nullable=True)
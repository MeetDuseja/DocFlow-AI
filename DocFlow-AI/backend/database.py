from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine("sqlite:///./docflow.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
    file_path = Column(String)

class OperationRecord(Base):
    __tablename__ = "operation_records"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer)
    date = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    employee_number = Column(String, nullable=True)
    operation_code = Column(String, nullable=True)
    machine_number = Column(String, nullable=True)
    work_order_number = Column(String, nullable=True)
    quantity_produced = Column(Float, nullable=True)
    time_taken = Column(Float, nullable=True)
    accuracy_scores = Column(Text, default="{}")
    validation_flags = Column(Text, default="[]")
    is_verified = Column(Boolean, default=False)
    raw_text = Column(Text, default="{}")

Base.metadata.create_all(bind=engine)
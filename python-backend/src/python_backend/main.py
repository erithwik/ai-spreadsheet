import json
from typing import List, Dict, Annotated, Union
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uuid
import src.python_backend.models as models
from src.python_backend.database import engine, SessionLocal
from sqlalchemy.orm import Session
from src.python_backend.ai_functions import ai_get_suggested_columns, ai_autofill_index_col, ai_autofill_cells
from pydantic import BaseModel

# Initialize the database

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Initialize the FastAPI app

app = FastAPI()
origins = ['http://localhost:8000', 'http://localhost:8080']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints

@app.get("/")
async def root():
    return {"message": "Hello World"}


# Suggested columns endpoint

class SuggestedColumnsRequest(BaseModel):
    description: str


class SuggestedColumnsResponse(BaseModel):
    results: List[str]

@app.post("/suggested-columns")
async def get_suggested_columns(
        request: SuggestedColumnsRequest) -> SuggestedColumnsResponse:
    columns = ai_get_suggested_columns(request.description)
    return SuggestedColumnsResponse(results=columns)


# Autofill index column endpoint

class AutofillIndexColRequest(BaseModel):
    description: str
    col_name: str
    max_count: int = 10


class AutofillIndexColResponse(BaseModel):
    results: List[str]


@app.post("/autofill-index")
async def autofill_index_col(
        request: AutofillIndexColRequest) -> AutofillIndexColResponse:
    values = ai_autofill_index_col(description=request.description,
                                   col_name=request.col_name,
                                   max_count=request.max_count)
    return AutofillIndexColResponse(results=values)


# Autofill cells endpoint

class AutofillCellsRequest(BaseModel):
    description: str
    columns: List[str]
    index_value: str


class AutofillCellsResponse(BaseModel):
    values: List[str]
    sources: List[str]


@app.post("/autofill-cells")
async def autofill_cells(
        request: AutofillCellsRequest) -> AutofillCellsResponse:
    values, sources = ai_autofill_cells(description=request.description,
                                        selected_cols=request.columns,
                                        index_value=request.index_value)
    return AutofillCellsResponse(values=values, sources=sources)


# Load sheets endpoint

class LoadSheetsResponse(BaseModel):
    sheets: List[Dict]


@app.get("/load-sheets")
async def load_sheets(db: db_dependency) -> LoadSheetsResponse:
    try:
        sheets = db.query(models.Sheet).all()
    except Exception as e:
        print(f"Error loading sheets: {e}")
        sheets = []
    sheets = [{
        "id": sheet.id,
        "sheet": {
            "id": sheet.id,
            "title": sheet.title,
            "description": sheet.description,
            "indexColumn": sheet.index_column,
            "columns": json.loads(sheet.columns),
            "data": json.loads(sheet.data),
            "sources": json.loads(sheet.sources),
        }
    } for sheet in sheets]
    return LoadSheetsResponse(sheets=sheets)


# Save sheet endpoint

class SaveSheetRequest(BaseModel):
    id: str
    sheet: Union[str, Dict]


@app.post("/save-sheet")
async def save_sheet(request: SaveSheetRequest, db: db_dependency) -> None:
    if isinstance(request.sheet, str):
        sheet = json.loads(request.sheet)
    else:
        sheet = request.sheet
    sheet_data = {
        'id': sheet.get("id", str(uuid.uuid4())),
        'title': sheet.get("title", ""),
        'description': sheet.get("description", ""),
        'index_column': sheet.get("indexColumn", ""),
        'columns': json.dumps(sheet.get("columns", [])),
        'data': json.dumps(sheet.get("data", [])),
        'sources': json.dumps(sheet.get("sources", []))
    }

    existing_sheet = db.query(models.Sheet).filter(
        models.Sheet.id == sheet_data["id"]).first()

    if existing_sheet:
        for key, value in sheet_data.items():
            setattr(existing_sheet, key, value)
    else:
        db.add(models.Sheet(**sheet_data))
    db.commit()


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()

import io
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app.models import Message
from app.data_manager import dataset_manager
from app.config import settings
from app.discord_integration.bot_collector import discord_collector

router = APIRouter(prefix="/data", tags=["Data Management"])

REQUIRED_COLUMNS = {"message_id", "timestamp", "user_id", "channel", "message", "reply_to"}

@router.get("/preview")
def get_data_preview(limit: int = 25, offset: int = 0):
    """Returns paginated preview of current messages stored in the database."""
    df = dataset_manager.get_dataframe()
    total = len(df)
    subset = df.iloc[offset: offset + limit]
    return {
        "total_records": total,
        "offset": offset,
        "limit": limit,
        "records": subset.to_dict(orient="records")
    }

@router.get("/stats")
def get_dataset_statistics():
    """Returns dataset health metrics, missing values, duplicates, and column metadata."""
    df = dataset_manager.get_dataframe()
    if df.empty:
        return {"total_records": 0, "columns": []}

    missing_counts = df.isnull().sum().to_dict()
    duplicates_count = int(df.duplicated(subset=["message"]).sum())
    unique_users = int(df["user_id"].nunique())
    channels_list = df["channel"].unique().tolist()
    sources = df["source"].value_counts().to_dict() if "source" in df.columns else {}

    return {
        "total_records": len(df),
        "unique_users": unique_users,
        "unique_channels": len(channels_list),
        "channels": channels_list,
        "duplicate_messages": duplicates_count,
        "missing_values_by_column": missing_counts,
        "sources_distribution": sources,
        "schema_columns": list(df.columns)
    }

@router.post("/upload")
async def upload_csv_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Validates uploaded CSV file against documented schema, handles missing values
    and duplicates, and saves records into the SQLite database.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are accepted.")

    contents = await file.read()
    try:
        new_df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    # Column Validation & Mapping
    col_map = {c.strip().lower(): c for c in new_df.columns}
    missing_cols = [rc for rc in REQUIRED_COLUMNS if rc not in col_map]
    if missing_cols:
        raise HTTPException(
            status_code=422,
            detail=f"Schema validation error. Missing required columns: {', '.join(missing_cols)}. "
                   f"Required schema: message_id, timestamp, user_id, channel, message, reply_to"
        )

    # Standardize column names
    rename_dict = {col_map[rc]: rc for rc in REQUIRED_COLUMNS if rc in col_map}
    new_df = new_df.rename(columns=rename_dict)

    # Clean & Deduplicate
    initial_count = len(new_df)
    new_df = new_df.dropna(subset=["message", "user_id"])
    new_df = new_df.drop_duplicates(subset=["message_id"])

    # Overwrite DB records with uploaded dataset
    db.query(Message).delete()
    
    records = []
    for _, row in new_df.iterrows():
        ts_val = pd.to_datetime(row["timestamp"]) if pd.notnull(row.get("timestamp")) else datetime.utcnow()
        records.append(Message(
            message_id=str(row["message_id"]),
            timestamp=ts_val,
            user_id=str(row["user_id"]),
            channel=str(row["channel"]),
            message=str(row["message"]),
            reply_to=str(row["reply_to"]) if pd.notnull(row.get("reply_to")) and str(row.get("reply_to")).strip() else None,
            game_title=str(row.get("game_title")) if pd.notnull(row.get("game_title")) and str(row.get("game_title")).strip() else None,
            sentiment_label=str(row.get("sentiment_label", "neutral")).lower() if pd.notnull(row.get("sentiment_label")) else "neutral",
            sentiment_score=0.5,
            source="user_upload_csv"
        ))

    db.bulk_save_objects(records)
    db.commit()

    # Synchronize working DataFrame
    dataset_manager.refresh_dataframe(db)

    return {
        "status": "success",
        "message": f"Successfully uploaded and validated {len(records)} records.",
        "initial_rows": initial_count,
        "valid_rows_imported": len(records),
        "removed_duplicates_or_empty": initial_count - len(records)
    }

@router.post("/reset-demo")
def reset_to_demo_dataset(db: Session = Depends(get_db)):
    """Resets the SQLite database to the original 200 synthetic demo records."""
    db.query(Message).delete()
    db.commit()
    dataset_manager.initialize_data()
    return {
        "status": "success",
        "message": "Database reset to the original 200 synthetic demo records."
    }

@router.get("/download")
def download_processed_csv():
    """Streams the current analyzed dataset as a downloadable CSV."""
    df = dataset_manager.get_dataframe()
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=discord_analyzed_dataset.csv"}
    )

@router.get("/discord/status")
def get_discord_integration_status():
    """Returns Discord bot integration status, compliance information, and mode."""
    return discord_collector.get_status()

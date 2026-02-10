# Configuration file for Railway Optimization System

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Geocoding (using OpenStreetMap - FREE, no API key needed!)
GEOCODING_SERVICE = "openstreetmap"  # Free service

# File paths
RAW_DATA_PATH = os.getenv("RAW_DATA_PATH", "data/raw/Train_details.csv")
PROCESSED_DATA_PATH = os.getenv("PROCESSED_DATA_PATH", "data/processed/")
OUTPUT_DATA_PATH = os.getenv("OUTPUT_DATA_PATH", "data/output/")

# API settings
API_DELAY = int(os.getenv("API_DELAY", "1"))  # Required by OpenStreetMap terms
RETRY_ATTEMPTS = int(os.getenv("RETRY_ATTEMPTS", "3"))

# Filtering criteria
SOURCE_STATION = os.getenv("SOURCE_STATION", "CSMT")
DESTINATION_STATION = os.getenv("DESTINATION_STATION", "CSMT")

# Optimization parameters
SAFETY_DISTANCE_MINUTES = int(os.getenv("SAFETY_DISTANCE_MINUTES", "5"))
MAX_DELAY_THRESHOLD = int(os.getenv("MAX_DELAY_THRESHOLD", "30"))
PRIORITY_WEIGHTS = {
    "express": 9,
    "local": 5,
    "freight": 3
}

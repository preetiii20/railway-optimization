"""
Phase 1: Data Preparation
Main script to filter CSMT trains, geocode stations, and build schedules
"""

import sys
from pathlib import Path

# Add utils to path
sys.path.append(str(Path(__file__).parent))

from utils.data_loader import DataLoader
from utils.geocoder import StationGeocoder
from utils.schedule_builder import ScheduleBuilder
import config

def main():
    print("=" * 60)
    print("PHASE 1: DATA PREPARATION")
    print("=" * 60)
    
    # Step 1: Load and filter data
    print("\n--- Step 1: Loading and Filtering Data ---")
    loader = DataLoader(config.RAW_DATA_PATH)
    loader.load_csv()
    
    filtered_df = loader.filter_csmt_trains(
        source_station=config.SOURCE_STATION,
        dest_station=config.DESTINATION_STATION
    )
    
    # Save filtered data
    output_csv = config.PROCESSED_DATA_PATH + "csmt_trains.csv"
    loader.save_to_csv(filtered_df, output_csv)
    
    # Step 2: Extract unique stations
    print("\n--- Step 2: Extracting Unique Stations ---")
    stations = loader.get_unique_stations(filtered_df)
    
    # Save stations (without coordinates yet)
    stations_raw_path = config.PROCESSED_DATA_PATH + "stations_raw.json"
    loader.save_to_json(stations, stations_raw_path)
    
    # Step 3: Geocode stations
    print("\n--- Step 3: Geocoding Stations (OpenStreetMap - FREE!) ---")
    
    geocoder = StationGeocoder(delay=config.API_DELAY)
    
    geocoded_stations, failed_stations = geocoder.geocode_all_stations(stations)
    
    # Save geocoded stations
    stations_geocoded_path = config.PROCESSED_DATA_PATH + "stations_geocoded.json"
    geocoder.save_results(geocoded_stations, stations_geocoded_path)
    
    # Save failed stations
    if failed_stations:
        failed_path = config.PROCESSED_DATA_PATH + "stations_failed.json"
        loader.save_to_json(failed_stations, failed_path)
    
    # Step 4: Build train schedules
    print("\n--- Step 4: Building Train Schedules ---")
    builder = ScheduleBuilder(filtered_df)
    train_schedules = builder.build_train_schedules()
    
    # Save schedules
    schedules_path = config.PROCESSED_DATA_PATH + "train_schedules.json"
    builder.save_schedules(train_schedules, schedules_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("PHASE 1 COMPLETE!")
    print("=" * 60)
    print(f"✓ Filtered trains: {len(filtered_df)} rows")
    print(f"✓ Unique trains: {len(train_schedules)}")
    print(f"✓ Unique stations: {len(stations)}")
    print(f"✓ Geocoded stations: {len(geocoded_stations)}")
    if failed_stations:
        print(f"✗ Failed geocoding: {len(failed_stations)}")
    
    print("\nOutput files:")
    print(f"  - {output_csv}")
    print(f"  - {stations_raw_path}")
    if geocoded_stations:
        print(f"  - {stations_geocoded_path}")
    print(f"  - {schedules_path}")
    
    print("\nNext: Run Phase 2 for AI model development")

if __name__ == "__main__":
    main()

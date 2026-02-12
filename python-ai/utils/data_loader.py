"""
Data Loader Utility
Loads and filters train data from CSV
"""

import pandas as pd
import json
from pathlib import Path

class DataLoader:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        
    def load_csv(self):
        """Load the CSV file"""
        print(f"Loading CSV from {self.csv_path}...")
        self.df = pd.read_csv(self.csv_path)
        print(f"Loaded {len(self.df)} rows")
        return self.df
    
    def filter_csmt_trains(self, source_station="CSMT", dest_station="CSMT"):
        """Filter trains that start or end at CSMT"""
        print(f"Filtering trains for {source_station}...")
        
        # Filter by source or destination
        filtered = self.df[
            (self.df['Source Station'] == source_station) | 
            (self.df['Destination Station'] == dest_station)
        ]
        
        print(f"Found {len(filtered)} rows for CSMT trains")
        
        # Get unique train numbers
        unique_trains = filtered['Train No'].unique()
        print(f"Total unique trains: {len(unique_trains)}")
        
        return filtered
    
    def get_unique_stations(self, filtered_df):
        """Extract unique stations from filtered data"""
        print("Extracting unique stations...")
        
        stations = {}
        
        for _, row in filtered_df.iterrows():
            station_code = row['Station Code']
            station_name = row['Station Name']
            
            if station_code not in stations:
                stations[station_code] = {
                    'code': station_code,
                    'name': station_name,
                    'trains_count': 0
                }
            
            stations[station_code]['trains_count'] += 1
        
        print(f"Found {len(stations)} unique stations")
        return stations
    
    def save_to_csv(self, df, output_path):
        """Save dataframe to CSV"""
        df.to_csv(output_path, index=False)
        print(f"Saved to {output_path}")
    
    def save_to_json(self, data, output_path):
        """Save data to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved to {output_path}")


# Standalone functions for easy import
def load_train_data():
    """Load train data from CSV and return as list of dicts"""
    import os
    
    # Try multiple possible paths
    possible_paths = [
        '../backend/data/Train_details.csv',
        'data/raw/Train_details.csv',
        '../data/Train_details.csv',
        '../../backend/data/Train_details.csv'
    ]
    
    csv_path = None
    for path in possible_paths:
        full_path = Path(__file__).parent / path
        if full_path.exists():
            csv_path = full_path
            break
    
    if not csv_path:
        print("Warning: Train_details.csv not found, using empty dataset")
        return []
    
    print(f"Loading train data from {csv_path}...")
    df = pd.read_csv(csv_path, low_memory=False)
    
    # Convert Distance to numeric, handling errors
    df['Distance'] = pd.to_numeric(df['Distance'], errors='coerce').fillna(0)
    
    # Group by train number to create train objects
    trains = []
    train_groups = df.groupby('Train No')
    
    for train_no, group in train_groups:
        first_row = group.iloc[0]
        
        # Build route from all stops
        route = []
        for idx, row in group.iterrows():
            # Safely get SEQ value
            seq_val = row.get('SEQ', idx)
            try:
                seq = int(seq_val) if pd.notna(seq_val) and str(seq_val).isdigit() else idx
            except:
                seq = idx
            
            route.append({
                'seq': seq,
                'station_code': str(row['Station Code']),
                'station_name': str(row['Station Name']),
                'arrival_time': str(row.get('Arrival time', '')),
                'departure_time': str(row.get('Departure Time', '')),
                'distance': float(row.get('Distance', 0)) if pd.notna(row.get('Distance')) else 0,
                'arrival_minutes': convert_time_to_minutes(row.get('Arrival time', '00:00'))
            })
        
        trains.append({
            'train_id': str(train_no),
            'train_name': str(first_row.get('Train Name', f'Train {train_no}')),
            'train_type': 'passenger',
            'source_code': str(first_row.get('Source Station', '')),
            'source_name': str(first_row.get('Source Station Name', '')),
            'destination_code': str(first_row.get('Destination Station', '')),
            'destination_name': str(first_row.get('Destination Station Name', '')),
            'total_distance': float(group['Distance'].max()) if len(group) > 0 else 0.0,
            'total_stations': len(group),
            'route': route
        })
    
    print(f"Loaded {len(trains)} trains")
    return trains


def load_stations():
    """Load station data and return as dict"""
    import os
    
    # Try to load from processed data first
    processed_path = Path(__file__).parent / '../data/processed/stations_geocoded.json'
    
    if processed_path.exists():
        print(f"Loading stations from {processed_path}...")
        with open(processed_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle different JSON formats
        stations = {}
        if isinstance(data, dict):
            # Already a dict
            stations = data
        elif isinstance(data, list):
            # Convert list to dict with code as key
            for station in data:
                if isinstance(station, dict):
                    code = station.get('code', station.get('station_code', ''))
                    if code:
                        stations[code] = station
        
        print(f"Loaded {len(stations)} stations")
        return stations
    
    # Fallback: Load from CSV
    possible_paths = [
        '../backend/data/Train_details.csv',
        'data/raw/Train_details.csv',
        '../../backend/data/Train_details.csv'
    ]
    
    csv_path = None
    for path in possible_paths:
        full_path = Path(__file__).parent / path
        if full_path.exists():
            csv_path = full_path
            break
    
    if not csv_path:
        print("Warning: No station data found, using empty dataset")
        return {}
    
    print(f"Loading stations from {csv_path}...")
    df = pd.read_csv(csv_path, low_memory=False)
    
    stations = {}
    for _, row in df.iterrows():
        code = row['Station Code']
        if code not in stations:
            stations[code] = {
                'code': code,
                'name': row['Station Name'],
                'latitude': None,
                'longitude': None
            }
    
    print(f"Loaded {len(stations)} stations")
    return stations


def convert_time_to_minutes(time_str):
    """Convert time string (HH:MM) to minutes since midnight"""
    if not time_str or pd.isna(time_str):
        return 0
    
    try:
        parts = str(time_str).split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        return hours * 60 + minutes
    except:
        return 0

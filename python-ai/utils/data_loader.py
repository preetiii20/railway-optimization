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

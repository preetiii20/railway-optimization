"""
Train Schedule Builder
Converts CSV data into structured train schedule JSON
"""

import pandas as pd
import json
from datetime import datetime, timedelta

class ScheduleBuilder:
    def __init__(self, filtered_df):
        self.df = filtered_df
        
    def determine_train_type(self, train_name):
        """Determine train type from name"""
        name_upper = train_name.upper()
        
        if 'SF' in name_upper or 'EXPRESS' in name_upper or 'RAJDHANI' in name_upper:
            return 'express'
        elif 'FREIGHT' in name_upper or 'FTR' in name_upper:
            return 'freight'
        else:
            return 'local'
    
    def get_priority(self, train_type):
        """Get priority based on train type"""
        priority_map = {
            'express': 9,
            'local': 5,
            'freight': 3
        }
        return priority_map.get(train_type, 5)
    
    def parse_time(self, time_str):
        """Parse time string to minutes from midnight"""
        if pd.isna(time_str) or time_str == '00:00:00':
            return None
        
        try:
            parts = time_str.split(':')
            hours = int(parts[0])
            minutes = int(parts[1])
            return hours * 60 + minutes
        except:
            return None
    
    def build_train_schedules(self):
        """Build structured train schedules"""
        print("Building train schedules...")
        
        trains = {}
        
        # Group by train number
        grouped = self.df.groupby('Train No')
        
        for train_no, group in grouped:
            # Sort by sequence
            group = group.sort_values('SEQ')
            
            # Get train metadata
            first_row = group.iloc[0]
            train_name = first_row['Train Name']
            train_type = self.determine_train_type(train_name)
            
            # Build route
            route = []
            for _, row in group.iterrows():
                station = {
                    'seq': int(row['SEQ']),
                    'station_code': row['Station Code'],
                    'station_name': row['Station Name'],
                    'arrival_time': row['Arrival time'],
                    'departure_time': row['Departure Time'],
                    'distance': float(row['Distance']),
                    'arrival_minutes': self.parse_time(row['Arrival time']),
                    'departure_minutes': self.parse_time(row['Departure Time'])
                }
                route.append(station)
            
            # Create train object
            train = {
                'train_id': str(train_no),
                'train_name': train_name,
                'train_type': train_type,
                'priority': self.get_priority(train_type),
                'source_station': first_row['Source Station'],
                'source_name': first_row['Source Station Name'],
                'destination_station': first_row['Destination Station'],
                'destination_name': first_row['Destination Station Name'],
                'total_distance': float(group.iloc[-1]['Distance']),
                'total_stations': len(route),
                'route': route
            }
            
            trains[str(train_no)] = train
        
        print(f"Built schedules for {len(trains)} trains")
        return trains
    
    def save_schedules(self, trains, output_path):
        """Save train schedules to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(trains, f, indent=2, ensure_ascii=False)
        print(f"Saved schedules to {output_path}")

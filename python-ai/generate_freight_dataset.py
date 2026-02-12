"""
Generate Freight Trains and Add to Dataset
Creates 50+ freight trains distributed across 24 hours
"""

import pandas as pd
import json
import random
from datetime import datetime, timedelta

# Load existing passenger train data
print("Loading existing train data...")
df = pd.read_csv('../backend/data/Train_details.csv')
print(f"Loaded {len(df)} passenger train records")

# Load stations
with open('data/processed/stations_geocoded.json', 'r') as f:
    stations_data = json.load(f)
    stations = {s['code']: s for s in stations_data}

print(f"Loaded {len(stations)} stations")

# Get unique station codes
station_codes = list(stations.keys())

# Major stations for freight routes
major_stations = [
    'CSMT', 'PUNE', 'DADAR', 'THANE', 'KALYAN', 'LONAVALA',
    'KARJAT', 'PANVEL', 'VASAI', 'VIRAR', 'BORIVALI', 'ANDHERI',
    'BANDRA', 'KURLA', 'GHATKOPAR', 'MULUND', 'DOMBIVLI', 'AMBERNATH'
]

# Filter to stations that exist
major_stations = [s for s in major_stations if s in stations]

print(f"Using {len(major_stations)} major stations for freight routes")

def generate_time(hour, minute=0):
    """Generate time string in HH:MM:SS format"""
    return f"{hour:02d}:{minute:02d}:00"

def calculate_distance(origin, destination):
    """Calculate approximate distance between stations"""
    if origin not in stations or destination not in stations:
        return random.randint(50, 300)
    
    # Simple distance calculation (you can improve this)
    return random.randint(50, 300)

def generate_freight_trains(num_trains=60):
    """Generate freight trains distributed across 24 hours"""
    freight_trains = []
    
    # Distribute trains across 24 hours (2-3 trains per hour)
    trains_per_hour = num_trains // 24
    extra_trains = num_trains % 24
    
    freight_id = 20000  # Start freight train IDs from 20000
    
    for hour in range(24):
        # Number of trains for this hour
        num_for_hour = trains_per_hour + (1 if hour < extra_trains else 0)
        
        for train_num in range(num_for_hour):
            # Random origin and destination
            origin = random.choice(major_stations)
            destination = random.choice([s for s in major_stations if s != origin])
            
            # Calculate distance and travel time
            distance = calculate_distance(origin, destination)
            avg_speed = random.randint(40, 70)  # Freight trains are slower
            travel_time_hours = distance / avg_speed
            travel_time_minutes = int(travel_time_hours * 60)
            
            # Departure time in this hour
            departure_minute = random.randint(0, 45)
            departure_time = generate_time(hour, departure_minute)
            
            # Arrival time
            arrival_hour = (hour + int(travel_time_hours)) % 24
            arrival_minute = (departure_minute + (travel_time_minutes % 60)) % 60
            arrival_time = generate_time(arrival_hour, arrival_minute)
            
            # Create freight train records (origin and destination)
            # Origin station
            freight_trains.append({
                'Train No': freight_id,
                'Train Name': f'FREIGHT-{freight_id}',
                'SEQ': 1,
                'Station Code': origin,
                'Station Name': stations[origin]['name'] if origin in stations else origin,
                'Arrival time': '00:00:00',
                'Departure Time': departure_time,
                'Distance': 0,
                'Source Station': origin,
                'Source Station Name': stations[origin]['name'] if origin in stations else origin,
                'Destination Station': destination,
                'Destination Station Name': stations[destination]['name'] if destination in stations else destination
            })
            
            # Destination station
            freight_trains.append({
                'Train No': freight_id,
                'Train Name': f'FREIGHT-{freight_id}',
                'SEQ': 2,
                'Station Code': destination,
                'Station Name': stations[destination]['name'] if destination in stations else destination,
                'Arrival time': arrival_time,
                'Departure Time': arrival_time,
                'Distance': distance,
                'Source Station': origin,
                'Source Station Name': stations[origin]['name'] if origin in stations else origin,
                'Destination Station': destination,
                'Destination Station Name': stations[destination]['name'] if destination in stations else destination
            })
            
            freight_id += 1
            
            print(f"Generated FREIGHT-{freight_id-1}: {origin} → {destination} at {departure_time} ({distance} km)")
    
    return freight_trains

# Generate 60 freight trains (distributed across 24 hours)
print("\n🚛 Generating 60 freight trains...")
freight_data = generate_freight_trains(60)

# Convert to DataFrame
freight_df = pd.DataFrame(freight_data)

print(f"\n✅ Generated {len(freight_data)} freight train records ({len(freight_data)//2} trains)")

# Combine with existing passenger trains
print("\n📦 Combining with existing passenger trains...")
combined_df = pd.concat([df, freight_df], ignore_index=True)

# Save to new CSV
output_file = '../backend/data/Train_details_with_freight.csv'
combined_df.to_csv(output_file, index=False)

print(f"\n💾 Saved combined dataset to: {output_file}")
print(f"   Total trains: {len(combined_df['Train No'].unique())}")
print(f"   Passenger trains: {len(df['Train No'].unique())}")
print(f"   Freight trains: {len(freight_df['Train No'].unique())}")

# Create backup of original
import shutil
backup_file = '../backend/data/Train_details_BACKUP.csv'
shutil.copy('../backend/data/Train_details.csv', backup_file)
print(f"\n📋 Backup of original saved to: {backup_file}")

# Replace original with combined
shutil.copy(output_file, '../backend/data/Train_details.csv')
print(f"✅ Replaced Train_details.csv with combined dataset")

print("\n" + "="*60)
print("🎉 SUCCESS! Freight trains added to dataset")
print("="*60)
print("\nYour dataset now includes:")
print(f"  • {len(df['Train No'].unique())} Passenger trains")
print(f"  • {len(freight_df['Train No'].unique())} Freight trains")
print(f"  • Total: {len(combined_df['Train No'].unique())} trains")
print("\nFreight trains are distributed across 24 hours")
print("You can now optimize at any time!")
print("\nNext steps:")
print("  1. Restart backend: cd backend && npm start")
print("  2. Start frontend: cd frontend && npm start")
print("  3. Both passenger and freight trains will show on map!")
print("="*60)

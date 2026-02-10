"""
Geocoder Utility
Fetches coordinates for railway stations using OpenStreetMap Nominatim (FREE!)
No API key required
"""

import requests
import time
import json

class StationGeocoder:
    def __init__(self, api_key=None, delay=1):
        self.delay = delay
        # Using OpenStreetMap Nominatim - FREE, no API key needed!
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {
            'User-Agent': 'RailwayOptimizationSystem/1.0'  # Required by Nominatim
        }
        
    def clean_station_name(self, station_name):
        """Clean and format station name for geocoding"""
        # Remove common suffixes
        name = station_name.replace(' JN', '').replace(' JN.', '')
        name = name.replace(' CANTT', '').replace(' TERMINUS', '')
        
        # Add context
        name = f"{name} railway station India"
        return name
    
    def geocode_station(self, station_code, station_name):
        """Get coordinates for a station using OpenStreetMap"""
        print(f"Geocoding {station_code}: {station_name}...")
        
        # Clean the name
        search_query = self.clean_station_name(station_name)
        
        # Make API request to OpenStreetMap Nominatim
        params = {
            'q': search_query,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'in'  # Limit to India
        }
        
        try:
            response = requests.get(
                self.base_url, 
                params=params, 
                headers=self.headers
            )
            data = response.json()
            
            if len(data) > 0:
                result_data = data[0]
                
                result = {
                    'code': station_code,
                    'name': station_name,
                    'latitude': float(result_data['lat']),
                    'longitude': float(result_data['lon']),
                    'formatted_address': result_data.get('display_name', ''),
                    'status': 'success'
                }
                
                print(f"  ✓ Found: {result['latitude']}, {result['longitude']}")
                return result
            else:
                print(f"  ✗ Not found")
                return {
                    'code': station_code,
                    'name': station_name,
                    'status': 'failed',
                    'error': 'No results found'
                }
                
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            return {
                'code': station_code,
                'name': station_name,
                'status': 'error',
                'error': str(e)
            }
    
    def geocode_all_stations(self, stations_dict):
        """Geocode all stations with delay between requests"""
        results = {}
        failed = []
        
        total = len(stations_dict)
        for i, (code, info) in enumerate(stations_dict.items(), 1):
            print(f"\n[{i}/{total}] Processing {code}...")
            
            result = self.geocode_station(code, info['name'])
            
            if result['status'] == 'success':
                results[code] = result
            else:
                failed.append(result)
            
            # Delay between requests
            if i < total:
                time.sleep(self.delay)
        
        print(f"\n✓ Successfully geocoded: {len(results)}")
        print(f"✗ Failed: {len(failed)}")
        
        return results, failed
    
    def save_results(self, results, output_path):
        """Save geocoding results to JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"Saved results to {output_path}")

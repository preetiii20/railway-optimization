"""
Delay Propagation Model
Calculates how primary delays cause secondary delays (domino effect)
"""

import json
from datetime import datetime, timedelta

class DelayPropagator:
    def __init__(self, train_schedules):
        """
        Initialize with train schedules
        train_schedules: dict of train objects from Phase 1
        """
        self.trains = train_schedules
        self.safety_margin = 5  # Minutes between trains
        
    def inject_primary_delay(self, train_id, station_code, delay_minutes, cause="unknown"):
        """
        Inject a primary delay and calculate propagation
        
        Args:
            train_id: ID of delayed train
            station_code: Station where delay occurs
            delay_minutes: Amount of delay in minutes
            cause: Reason for delay (weather, technical, etc.)
        
        Returns:
            dict with primary delay and all secondary delays
        """
        print(f"\n🚨 Injecting Primary Delay:")
        print(f"   Train: {train_id}")
        print(f"   Station: {station_code}")
        print(f"   Delay: {delay_minutes} minutes")
        print(f"   Cause: {cause}")
        
        # Get the delayed train
        if train_id not in self.trains:
            return {"error": f"Train {train_id} not found"}
        
        delayed_train = self.trains[train_id]
        
        # Find the station in route
        delay_station_index = None
        for i, station in enumerate(delayed_train['route']):
            if station['station_code'] == station_code:
                delay_station_index = i
                break
        
        if delay_station_index is None:
            return {"error": f"Station {station_code} not in train {train_id} route"}
        
        # Create primary delay record
        primary_delay = {
            "train_id": train_id,
            "train_name": delayed_train['train_name'],
            "station": station_code,
            "delay_minutes": delay_minutes,
            "cause": cause,
            "type": "primary"
        }
        
        # Calculate new schedule for delayed train
        updated_schedule = self._update_train_schedule(
            delayed_train, 
            delay_station_index, 
            delay_minutes
        )
        
        # Find secondary delays (trains affected by this delay)
        secondary_delays = self._find_secondary_delays(
            train_id,
            updated_schedule,
            delay_station_index
        )
        
        # Calculate total impact
        total_delay = delay_minutes + sum(d['delay_minutes'] for d in secondary_delays)
        affected_trains = len(secondary_delays) + 1
        
        result = {
            "primary_delay": primary_delay,
            "secondary_delays": secondary_delays,
            "updated_schedule": updated_schedule,
            "summary": {
                "total_network_delay": total_delay,
                "affected_trains": affected_trains,
                "propagation_depth": self._calculate_depth(secondary_delays)
            }
        }
        
        print(f"\n📊 Impact Summary:")
        print(f"   Total Network Delay: {total_delay} minutes")
        print(f"   Affected Trains: {affected_trains}")
        print(f"   Secondary Delays: {len(secondary_delays)}")
        
        return result
    
    def _update_train_schedule(self, train, delay_start_index, delay_minutes):
        """Update train schedule with delay"""
        updated_route = []
        
        for i, station in enumerate(train['route']):
            new_station = station.copy()
            
            # Apply delay to all stations from delay point onwards
            if i >= delay_start_index:
                if new_station['arrival_minutes'] is not None:
                    new_station['arrival_minutes'] += delay_minutes
                    new_station['arrival_time'] = self._minutes_to_time(
                        new_station['arrival_minutes']
                    )
                
                if new_station['departure_minutes'] is not None:
                    new_station['departure_minutes'] += delay_minutes
                    new_station['departure_time'] = self._minutes_to_time(
                        new_station['departure_minutes']
                    )
            
            updated_route.append(new_station)
        
        return updated_route
    
    def _find_secondary_delays(self, delayed_train_id, updated_schedule, delay_start_index):
        """Find trains that get delayed due to the primary delay"""
        secondary_delays = []
        
        # Check each station in the delayed train's remaining route
        for i in range(delay_start_index, len(updated_schedule)):
            station = updated_schedule[i]
            station_code = station['station_code']
            delayed_departure = station['departure_minutes']
            
            if delayed_departure is None:
                continue
            
            # Check all other trains
            for train_id, train in self.trains.items():
                if train_id == delayed_train_id:
                    continue
                
                # Check if this train passes through the same station
                for other_station in train['route']:
                    if other_station['station_code'] == station_code:
                        other_arrival = other_station['arrival_minutes']
                        
                        if other_arrival is None:
                            continue
                        
                        # Check for conflict (other train arrives while delayed train still there)
                        if other_arrival < delayed_departure + self.safety_margin:
                            # Calculate secondary delay
                            required_wait = (delayed_departure + self.safety_margin) - other_arrival
                            
                            if required_wait > 0:
                                secondary_delays.append({
                                    "train_id": train_id,
                                    "train_name": train['train_name'],
                                    "station": station_code,
                                    "delay_minutes": required_wait,
                                    "cause": "track_occupancy",
                                    "caused_by": delayed_train_id,
                                    "type": "secondary"
                                })
                                
                                print(f"   ⚠️  Secondary delay: Train {train_id} at {station_code} (+{required_wait} min)")
        
        return secondary_delays
    
    def _calculate_depth(self, secondary_delays):
        """Calculate propagation depth (how many levels of delays)"""
        # For now, simple count. Can be enhanced to track actual chain depth
        return min(len(secondary_delays), 3)
    
    def _minutes_to_time(self, minutes):
        """Convert minutes from midnight to HH:MM:SS format"""
        if minutes is None:
            return None
        
        hours = int(minutes // 60)
        mins = int(minutes % 60)
        return f"{hours:02d}:{mins:02d}:00"
    
    def simulate_multiple_delays(self, delay_scenarios):
        """
        Simulate multiple delay scenarios
        
        Args:
            delay_scenarios: list of delay dicts
        
        Returns:
            Combined impact analysis
        """
        all_results = []
        total_impact = 0
        
        for scenario in delay_scenarios:
            result = self.inject_primary_delay(
                scenario['train_id'],
                scenario['station'],
                scenario['delay_minutes'],
                scenario.get('cause', 'unknown')
            )
            all_results.append(result)
            total_impact += result['summary']['total_network_delay']
        
        return {
            "scenarios": all_results,
            "combined_impact": total_impact,
            "total_scenarios": len(delay_scenarios)
        }

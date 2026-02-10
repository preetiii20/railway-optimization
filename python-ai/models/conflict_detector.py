"""
Conflict Detection Model
Detects various types of conflicts in train schedules
"""

import json

class ConflictDetector:
    def __init__(self, train_schedules):
        """
        Initialize with train schedules
        """
        self.trains = train_schedules
        self.conflicts = []
        self.conflict_id_counter = 1
        
    def detect_all_conflicts(self):
        """
        Detect all types of conflicts in the schedule
        
        Returns:
            dict with all detected conflicts
        """
        print("\n🔍 Detecting Conflicts...")
        
        self.conflicts = []
        
        # Type 1: Track Occupancy Conflicts
        track_conflicts = self._detect_track_occupancy()
        
        # Type 2: Platform Conflicts
        platform_conflicts = self._detect_platform_conflicts()
        
        # Type 3: Early Arrivals
        early_arrivals = self._detect_early_arrivals()
        
        # Type 4: Excessive Delays
        excessive_delays = self._detect_excessive_delays()
        
        all_conflicts = (
            track_conflicts + 
            platform_conflicts + 
            early_arrivals + 
            excessive_delays
        )
        
        # Categorize by severity
        high_severity = [c for c in all_conflicts if c['severity'] == 'high']
        medium_severity = [c for c in all_conflicts if c['severity'] == 'medium']
        low_severity = [c for c in all_conflicts if c['severity'] == 'low']
        
        print(f"\n📊 Conflict Summary:")
        print(f"   Total Conflicts: {len(all_conflicts)}")
        print(f"   High Severity: {len(high_severity)}")
        print(f"   Medium Severity: {len(medium_severity)}")
        print(f"   Low Severity: {len(low_severity)}")
        
        return {
            "total_conflicts": len(all_conflicts),
            "conflicts": all_conflicts,
            "by_severity": {
                "high": high_severity,
                "medium": medium_severity,
                "low": low_severity
            },
            "by_type": {
                "track_occupancy": track_conflicts,
                "platform_conflict": platform_conflicts,
                "early_arrival": early_arrivals,
                "excessive_delay": excessive_delays
            }
        }
    
    def _detect_track_occupancy(self):
        """Detect when two trains want same track section at same time"""
        conflicts = []
        
        print("\n   Checking track occupancy conflicts...")
        
        # Build station timeline
        station_timeline = {}
        
        for train_id, train in self.trains.items():
            for station in train['route']:
                station_code = station['station_code']
                arrival = station['arrival_minutes']
                departure = station['departure_minutes']
                
                if station_code not in station_timeline:
                    station_timeline[station_code] = []
                
                if arrival is not None and departure is not None:
                    station_timeline[station_code].append({
                        'train_id': train_id,
                        'train_name': train['train_name'],
                        'arrival': arrival,
                        'departure': departure
                    })
        
        # Check for overlaps
        for station_code, trains_at_station in station_timeline.items():
            # Sort by arrival time
            trains_at_station.sort(key=lambda x: x['arrival'])
            
            # Check consecutive trains
            for i in range(len(trains_at_station) - 1):
                train1 = trains_at_station[i]
                train2 = trains_at_station[i + 1]
                
                # If train2 arrives before train1 departs (with safety margin)
                if train2['arrival'] < train1['departure'] + 5:
                    conflict = {
                        'conflict_id': f"C{self.conflict_id_counter:03d}",
                        'type': 'track_occupancy',
                        'severity': 'high',
                        'station': station_code,
                        'trains_involved': [train1['train_id'], train2['train_id']],
                        'train_names': [train1['train_name'], train2['train_name']],
                        'description': f"Trains {train1['train_id']} and {train2['train_id']} overlap at {station_code}",
                        'time_gap': train2['arrival'] - train1['departure'],
                        'recommended_gap': 5
                    }
                    conflicts.append(conflict)
                    self.conflict_id_counter += 1
                    
                    print(f"      ⚠️  Conflict at {station_code}: {train1['train_id']} vs {train2['train_id']}")
        
        return conflicts
    
    def _detect_platform_conflicts(self):
        """Detect platform availability conflicts"""
        conflicts = []
        
        print("\n   Checking platform conflicts...")
        
        # Simplified: Assume each station has limited platforms
        # If more than 2 trains at same time, conflict
        
        station_occupancy = {}
        
        for train_id, train in self.trains.items():
            for station in train['route']:
                station_code = station['station_code']
                arrival = station['arrival_minutes']
                departure = station['departure_minutes']
                
                if arrival is None or departure is None:
                    continue
                
                # Check each minute
                for minute in range(int(arrival), int(departure) + 1):
                    key = f"{station_code}_{minute}"
                    if key not in station_occupancy:
                        station_occupancy[key] = []
                    station_occupancy[key].append(train_id)
        
        # Find conflicts (more than 2 trains at same time)
        for key, trains in station_occupancy.items():
            if len(trains) > 2:
                station_code = key.split('_')[0]
                conflict = {
                    'conflict_id': f"C{self.conflict_id_counter:03d}",
                    'type': 'platform_conflict',
                    'severity': 'medium',
                    'station': station_code,
                    'trains_involved': trains,
                    'description': f"{len(trains)} trains at {station_code} simultaneously",
                    'platform_capacity': 2,
                    'trains_present': len(trains)
                }
                conflicts.append(conflict)
                self.conflict_id_counter += 1
        
        return conflicts
    
    def _detect_early_arrivals(self):
        """Detect trains arriving earlier than scheduled"""
        conflicts = []
        
        print("\n   Checking early arrivals...")
        
        # This would require actual vs scheduled times
        # For now, placeholder for future implementation
        
        return conflicts
    
    def _detect_excessive_delays(self):
        """Detect trains with excessive delays"""
        conflicts = []
        
        print("\n   Checking excessive delays...")
        
        # This would require actual delay data
        # Placeholder for when we have real-time data
        
        return conflicts
    
    def get_conflicts_by_station(self, station_code):
        """Get all conflicts at a specific station"""
        return [c for c in self.conflicts if c.get('station') == station_code]
    
    def get_conflicts_by_train(self, train_id):
        """Get all conflicts involving a specific train"""
        return [c for c in self.conflicts if train_id in c.get('trains_involved', [])]
    
    def get_high_priority_conflicts(self):
        """Get only high severity conflicts"""
        return [c for c in self.conflicts if c['severity'] == 'high']

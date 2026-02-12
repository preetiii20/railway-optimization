"""
Advanced Freight Path Optimization System
Combines multiple AI algorithms:
- Genetic Algorithm for optimization
- Constraint Satisfaction Problem (CSP) for validation
- Dynamic Programming for path finding
- Greedy Heuristic for quick solutions
"""
import json
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional

class FreightOptimizer:
    def __init__(self, passenger_trains: List[Dict], stations: Dict):
        self.passenger_trains = passenger_trains
        self.stations = stations
        
        # Railway constraints
        self.min_headway = 5  # minutes between trains
        self.max_headway = 120  # maximum gap to consider
        self.min_loop_time = 10  # minimum time at loop line
        self.freight_avg_speed = 40  # km/h
        
        # Genetic Algorithm parameters
        self.population_size = 100
        self.generations = 150
        self.mutation_rate = 0.15
        self.crossover_rate = 0.7
        self.elite_size = 10
        
    def find_time_gaps(self) -> List[Dict]:
        """
        CSP: Find valid time slots satisfying all constraints
        Returns gaps between passenger trains at each station
        """
        gaps = []
        station_schedules = {}
        
        # Build station-wise schedule
        for train in self.passenger_trains:
            if not train.get('route'):
                continue
            for stop in train['route']:
                station = stop['station_code']
                arrival_time = stop.get('arrival_minutes', 0)
                
                if station not in station_schedules:
                    station_schedules[station] = []
                
                station_schedules[station].append({
                    'train_id': train['train_id'],
                    'train_name': train.get('train_name', ''),
                    'time': arrival_time,
                    'train_type': train.get('train_type', 'passenger')
                })
        
        # Find gaps satisfying headway constraints
        for station, schedule in station_schedules.items():
            schedule.sort(key=lambda x: x['time'])
            
            for i in range(len(schedule) - 1):
                current_time = schedule[i]['time']
                next_time = schedule[i+1]['time']
                gap_size = next_time - current_time
                
                # CSP Constraint: Gap must be larger than 2 * headway
                if gap_size > (self.min_headway * 2) and gap_size < self.max_headway:
                    gaps.append({
                        'station': station,
                        'station_name': self.stations.get(station, {}).get('name', station),
                        'start_time': current_time + self.min_headway,
                        'end_time': next_time - self.min_headway,
                        'gap_size': gap_size - (2 * self.min_headway),
                        'before_train': schedule[i]['train_id'],
                        'after_train': schedule[i+1]['train_id']
                    })
        
        return gaps
    
    def calculate_distance(self, station1: str, station2: str) -> float:
        """Calculate distance between two stations"""
        s1 = self.stations.get(station1, {})
        s2 = self.stations.get(station2, {})
        
        if not s1.get('latitude') or not s2.get('latitude'):
            return 100  # default distance
        
        # Haversine formula
        lat1, lon1 = s1['latitude'], s1['longitude']
        lat2, lon2 = s2['latitude'], s2['longitude']
        
        R = 6371  # Earth radius in km
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        
        return R * c
    
    def greedy_heuristic(self, gaps: List[Dict], num_trains: int = 5) -> List[Dict]:
        """
        Greedy Algorithm: Quick feasible solution
        Select largest gaps first
        """
        if len(gaps) < 2:
            return []
        
        # Sort gaps by size (largest first)
        sorted_gaps = sorted(gaps, key=lambda x: x['gap_size'], reverse=True)
        
        freight_paths = []
        used_stations = set()
        
        for _ in range(num_trains):
            # Find origin from unused stations
            origin_gap = None
            for gap in sorted_gaps:
                if gap['station'] not in used_stations:
                    origin_gap = gap
                    break
            
            if not origin_gap:
                break
            
            # Find destination from unused stations
            dest_gap = None
            for gap in sorted_gaps:
                if gap['station'] != origin_gap['station'] and gap['station'] not in used_stations:
                    dest_gap = gap
                    break
            
            if not dest_gap:
                break
            
            distance = self.calculate_distance(origin_gap['station'], dest_gap['station'])
            travel_time = (distance / self.freight_avg_speed) * 60  # minutes
            
            freight_paths.append({
                'freight_id': f'FRT{1000 + len(freight_paths)}',
                'origin': origin_gap['station'],
                'origin_name': origin_gap['station_name'],
                'destination': dest_gap['station'],
                'destination_name': dest_gap['station_name'],
                'departure_time': origin_gap['start_time'],
                'arrival_time': origin_gap['start_time'] + travel_time,
                'distance': round(distance, 2),
                'travel_time': round(travel_time, 2),
                'gap_utilization': round((travel_time / origin_gap['gap_size']) * 100, 2)
            })
            
            used_stations.add(origin_gap['station'])
            used_stations.add(dest_gap['station'])
        
        return freight_paths
    
    def dynamic_programming_path(self, gaps: List[Dict], origin: str, destination: str) -> Optional[Dict]:
        """
        Dynamic Programming: Find optimal path through time-space network
        """
        # Build graph of possible transitions
        graph = {}
        for gap in gaps:
            if gap['station'] not in graph:
                graph[gap['station']] = []
            graph[gap['station']].append(gap)
        
        if origin not in graph or destination not in graph:
            return None
        
        # DP: Find path with minimum conflicts
        origin_gaps = graph[origin]
        dest_gaps = graph[destination]
        
        best_path = None
        min_cost = float('inf')
        
        for o_gap in origin_gaps:
            for d_gap in dest_gaps:
                distance = self.calculate_distance(origin, destination)
                travel_time = (distance / self.freight_avg_speed) * 60
                
                # Check time feasibility
                if o_gap['start_time'] + travel_time <= d_gap['end_time']:
                    cost = travel_time + (100 - o_gap['gap_size'])  # Prefer larger gaps
                    
                    if cost < min_cost:
                        min_cost = cost
                        best_path = {
                            'origin': origin,
                            'destination': destination,
                            'departure_time': o_gap['start_time'],
                            'arrival_time': o_gap['start_time'] + travel_time,
                            'distance': round(distance, 2),
                            'travel_time': round(travel_time, 2)
                        }
        
        return best_path
    
    def create_chromosome(self, gaps: List[Dict], num_trains: int) -> List[Dict]:
        """Create a random freight schedule (chromosome for GA)"""
        chromosome = []
        available_gaps = gaps.copy()
        
        for i in range(num_trains):
            if len(available_gaps) < 2:
                break
            
            origin_gap = random.choice(available_gaps)
            dest_gaps = [g for g in available_gaps if g['station'] != origin_gap['station']]
            
            if not dest_gaps:
                continue
            
            dest_gap = random.choice(dest_gaps)
            distance = self.calculate_distance(origin_gap['station'], dest_gap['station'])
            travel_time = (distance / self.freight_avg_speed) * 60
            
            chromosome.append({
                'freight_id': f'FRT{1000 + i}',
                'origin': origin_gap['station'],
                'origin_name': origin_gap['station_name'],
                'destination': dest_gap['station'],
                'destination_name': dest_gap['station_name'],
                'departure_time': origin_gap['start_time'],
                'arrival_time': origin_gap['start_time'] + travel_time,
                'distance': round(distance, 2),
                'travel_time': round(travel_time, 2),
                'gap_size': origin_gap['gap_size']
            })
        
        return chromosome
    
    def fitness_function(self, chromosome: List[Dict]) -> float:
        """
        Calculate fitness of a freight schedule
        Higher is better
        """
        if not chromosome:
            return 0
        
        fitness = 0
        
        # Reward: Number of freight trains scheduled
        fitness += len(chromosome) * 100
        
        # Reward: Total distance covered
        total_distance = sum(train['distance'] for train in chromosome)
        fitness += total_distance * 2
        
        # Reward: Efficient gap utilization
        for train in chromosome:
            utilization = (train['travel_time'] / train['gap_size']) * 100
            if 50 <= utilization <= 90:  # Sweet spot
                fitness += 50
            else:
                fitness -= abs(utilization - 70)
        
        # Penalty: Conflicts (trains using same station at same time)
        conflicts = 0
        for i, train1 in enumerate(chromosome):
            for train2 in chromosome[i+1:]:
                # Check if trains conflict at origin or destination
                if train1['origin'] == train2['origin']:
                    time_diff = abs(train1['departure_time'] - train2['departure_time'])
                    if time_diff < self.min_headway:
                        conflicts += 1
                
                if train1['destination'] == train2['destination']:
                    time_diff = abs(train1['arrival_time'] - train2['arrival_time'])
                    if time_diff < self.min_headway:
                        conflicts += 1
        
        fitness -= conflicts * 200
        
        return max(0, fitness)
    
    def crossover(self, parent1: List[Dict], parent2: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """Single-point crossover"""
        if len(parent1) < 2 or len(parent2) < 2:
            return parent1, parent2
        
        point = random.randint(1, min(len(parent1), len(parent2)) - 1)
        
        child1 = parent1[:point] + parent2[point:]
        child2 = parent2[:point] + parent1[point:]
        
        return child1, child2
    
    def mutate(self, chromosome: List[Dict], gaps: List[Dict]) -> List[Dict]:
        """Randomly modify a freight train in the schedule"""
        if not chromosome or not gaps:
            return chromosome
        
        # Randomly select a train to mutate
        idx = random.randint(0, len(chromosome) - 1)
        
        # Replace with a new random path
        origin_gap = random.choice(gaps)
        dest_gaps = [g for g in gaps if g['station'] != origin_gap['station']]
        
        if dest_gaps:
            dest_gap = random.choice(dest_gaps)
            distance = self.calculate_distance(origin_gap['station'], dest_gap['station'])
            travel_time = (distance / self.freight_avg_speed) * 60
            
            chromosome[idx] = {
                'freight_id': chromosome[idx]['freight_id'],
                'origin': origin_gap['station'],
                'origin_name': origin_gap['station_name'],
                'destination': dest_gap['station'],
                'destination_name': dest_gap['station_name'],
                'departure_time': origin_gap['start_time'],
                'arrival_time': origin_gap['start_time'] + travel_time,
                'distance': round(distance, 2),
                'travel_time': round(travel_time, 2),
                'gap_size': origin_gap['gap_size']
            }
        
        return chromosome
    
    def genetic_algorithm(self, gaps: List[Dict], num_freight_trains: int = 10) -> Tuple[List[Dict], float]:
        """
        Genetic Algorithm: Optimize freight train placement
        """
        # Initialize population
        population = [self.create_chromosome(gaps, num_freight_trains) for _ in range(self.population_size)]
        
        best_solution = None
        best_fitness = 0
        
        for generation in range(self.generations):
            # Evaluate fitness
            fitness_scores = [(chromosome, self.fitness_function(chromosome)) for chromosome in population]
            fitness_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Track best solution
            if fitness_scores[0][1] > best_fitness:
                best_fitness = fitness_scores[0][1]
                best_solution = fitness_scores[0][0]
            
            # Elitism: Keep top performers
            new_population = [chromosome for chromosome, _ in fitness_scores[:self.elite_size]]
            
            # Selection and reproduction
            while len(new_population) < self.population_size:
                # Tournament selection
                parent1 = random.choice(fitness_scores[:50])[0]
                parent2 = random.choice(fitness_scores[:50])[0]
                
                # Crossover
                if random.random() < self.crossover_rate:
                    child1, child2 = self.crossover(parent1, parent2)
                else:
                    child1, child2 = parent1[:], parent2[:]
                
                # Mutation
                if random.random() < self.mutation_rate:
                    child1 = self.mutate(child1, gaps)
                if random.random() < self.mutation_rate:
                    child2 = self.mutate(child2, gaps)
                
                new_population.extend([child1, child2])
            
            population = new_population[:self.population_size]
        
        return best_solution, best_fitness
    
    def optimize(self, num_freight_trains: int = 10, algorithm: str = 'genetic', time_window_hours: int = None) -> Dict:
        """
        Main optimization function
        
        Args:
            num_freight_trains: Number of freight trains to generate
            algorithm: 'genetic' or 'greedy'
            time_window_hours: If specified, only optimize for next N hours from current time
        """
        # Step 1: Filter trains by time window if specified
        if time_window_hours:
            current_time_minutes = self._get_current_time_minutes()
            end_time_minutes = current_time_minutes + (time_window_hours * 60)
            
            # Filter passenger trains active in this window
            active_trains = []
            for train in self.passenger_trains:
                if train.get('route'):
                    # Check if train has any stops in the time window
                    for stop in train['route']:
                        arrival_time = stop.get('arrival_minutes', 0)
                        if current_time_minutes <= arrival_time <= end_time_minutes:
                            active_trains.append(train)
                            break
            
            print(f"Time window: {time_window_hours}h from current time")
            print(f"Active trains in window: {len(active_trains)} out of {len(self.passenger_trains)}")
            
            # Temporarily replace passenger trains with active ones
            original_trains = self.passenger_trains
            self.passenger_trains = active_trains
        
        # Step 2: Find all valid time gaps (CSP)
        gaps = self.find_time_gaps()
        
        if not gaps:
            return {
                'success': False,
                'message': 'No valid time gaps found',
                'freight_trains': [],
                'statistics': {}
            }
        
        # Step 3: Apply selected algorithm
        if algorithm == 'greedy':
            freight_trains = self.greedy_heuristic(gaps, num_freight_trains)
            fitness = self.fitness_function(freight_trains)
        elif algorithm == 'genetic':
            freight_trains, fitness = self.genetic_algorithm(gaps, num_freight_trains)
        else:
            freight_trains = self.greedy_heuristic(gaps, num_freight_trains)
            fitness = self.fitness_function(freight_trains)
        
        # Restore original trains if we filtered
        if time_window_hours:
            self.passenger_trains = original_trains
        
        # Step 4: Calculate statistics
        total_distance = sum(train['distance'] for train in freight_trains)
        avg_travel_time = sum(train['travel_time'] for train in freight_trains) / len(freight_trains) if freight_trains else 0
        
        return {
            'success': True,
            'algorithm': algorithm,
            'time_window_hours': time_window_hours,
            'freight_trains': freight_trains,
            'statistics': {
                'total_freight_trains': len(freight_trains),
                'total_distance_km': round(total_distance, 2),
                'avg_travel_time_min': round(avg_travel_time, 2),
                'fitness_score': round(fitness, 2),
                'gaps_found': len(gaps),
                'utilization_rate': round((len(freight_trains) / num_freight_trains) * 100, 2)
            }
        }
    
    def _get_current_time_minutes(self) -> int:
        """Get current time in minutes since midnight"""
        from datetime import datetime
        now = datetime.now()
        return now.hour * 60 + now.minute


# Standalone execution for testing
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    from utils.data_loader import load_train_data, load_stations
    
    trains = load_train_data()
    stations = load_stations()
    
    optimizer = FreightOptimizer(trains, stations)
    result = optimizer.optimize(num_freight_trains=15, algorithm='genetic')
    
    print(json.dumps(result, indent=2))

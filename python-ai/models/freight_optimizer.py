"""
Freight Path Optimization using Genetic Algorithm
Optimizes freight train insertion between passenger trains
"""
import json
import random
from datetime import datetime, timedelta

class FreightOptimizer:
    def __init__(self, passenger_trains, stations):
        self.passenger_trains = passenger_trains
        self.stations = stations
        self.min_headway = 5  # minutes
        self.population_size = 50
        self.generations = 100
        
    def find_time_gaps(self):
        """Find available time slots between passenger trains"""
        gaps = []
        
        # Group trains by station
        station_schedules = {}
        for train in self.passenger_trains:
            if not train.get('route'):
                continue
            for stop in train['route']:
                station = stop['station_code']
                if station not in station_schedules:
                    station_schedules[station] = []
                station_schedules[station].append({
                    'train_id': train['train_id'],
                    'time': stop.get('arrival_minutes', 0)
                })
        
        # Find gaps at each station
        for station, schedule in station_schedules.items():
            schedule.sort(key=lambda x: x['time'])
            for i in range(len(schedule) - 1):
                gap_size = schedule[i+1]['time'] - schedule[i]['time']
                if gap_size > self.min_headway * 2:  # Enough space for freight
                    gaps.append({
                        'station': station,
                        'start_time': schedule[i]['time'] + self.min_headway,
                        'end_time': schedule[i+1]['time'] - self.min_headway,
                        'gap_size': gap_size
                    })
        
        return gaps

    def create_freight_path(self, gaps):
        """Create a freight train path using available gaps"""
        if len(gaps) < 2:
            return None
        
        # Select random start and end stations
        start_gap = random.choice(gaps)
        end_gaps = [g for g in gaps if g['station'] != start_gap['station']]
        if not end_gaps:
            return None
        end_gap = random.choice(end_gaps)
        
        return {
            'origin': start_gap['station'],
            'destination': end_gap['station'],
            'departure_time': start_gap['start_time'],
            'arrival_time': end_gap['end_time'],
            'duration': (end_gap['end_time'] - start_gap['start_time']) / 60,
            'conflicts': 0
        }
    
    def genetic_algorithm(self, gaps, num_freight_trains=10):
        """Use genetic algorithm to optimize freight placement"""
        population = []
        
        # Create initial population
        for _ in range(self.population_size):
            individual = []
            for _ in range(num_freight_trains):
                path = self.create_freight_path(gaps)
                if path:
                    individual.append(path)
            population.append(individual)
        
        best_solution = None
        best_fitness = 0
        
        for generation in range(self.generations):
            # Evaluate fitness
            fitness_scores = []
            for individual in population:
                fitness = self.calculate_fitness(individual)
                fitness_scores.append(fitness)
                if fitness > best_fitness:
                    best_fitness = fitness
                    best_solution = individual
            
            # Selection and crossover (simplified)
            new_population = []
            for _ in range(self.population_size):
                parent = population[fitness_scores.index(max(fitness_scores))]
                new_population.append(parent[:])
            
            population = new_population
        
        return best_solution, best_fitness

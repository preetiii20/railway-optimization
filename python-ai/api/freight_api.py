"""
Flask API for Freight Optimization
Exposes AI algorithms via REST endpoints
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.freight_optimizer import FreightOptimizer
from utils.data_loader import load_train_data, load_stations

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load data once at startup
print("Loading train data...")
trains = load_train_data()
stations = load_stations()
print(f"Loaded {len(trains)} trains and {len(stations)} stations")

@app.route('/api/freight/optimize', methods=['POST'])
def optimize_freight():
    """
    Optimize freight train placement
    
    Request body:
    {
        "num_trains": 30,
        "algorithm": "genetic",
        "time_window_hours": 2
    }
    """
    try:
        data = request.get_json() or {}
        num_trains = data.get('num_trains', 10)
        algorithm = data.get('algorithm', 'genetic')
        time_window_hours = data.get('time_window_hours', None)
        
        # Validate inputs
        if num_trains < 1 or num_trains > 100:
            return jsonify({
                'success': False,
                'error': 'num_trains must be between 1 and 100'
            }), 400
        
        if algorithm not in ['genetic', 'greedy']:
            return jsonify({
                'success': False,
                'error': 'algorithm must be "genetic" or "greedy"'
            }), 400
        
        # Run optimization
        optimizer = FreightOptimizer(trains, stations)
        result = optimizer.optimize(num_trains, algorithm, time_window_hours)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/freight/gaps', methods=['GET'])
def get_time_gaps():
    """Get all available time gaps between passenger trains"""
    try:
        optimizer = FreightOptimizer(trains, stations)
        gaps = optimizer.find_time_gaps()
        
        return jsonify({
            'success': True,
            'total_gaps': len(gaps),
            'gaps': gaps[:50]  # Return first 50 for performance
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/freight/compare', methods=['POST'])
def compare_algorithms():
    """Compare different optimization algorithms"""
    try:
        data = request.get_json() or {}
        num_trains = data.get('num_trains', 10)
        
        optimizer = FreightOptimizer(trains, stations)
        
        # Run both algorithms
        greedy_result = optimizer.optimize(num_trains, 'greedy')
        genetic_result = optimizer.optimize(num_trains, 'genetic')
        
        return jsonify({
            'success': True,
            'comparison': {
                'greedy': greedy_result['statistics'],
                'genetic': genetic_result['statistics']
            },
            'winner': 'genetic' if genetic_result['statistics']['fitness_score'] > greedy_result['statistics']['fitness_score'] else 'greedy'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'trains_loaded': len(trains),
        'stations_loaded': len(stations)
    })

if __name__ == '__main__':
    print("Starting Freight Optimization API on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)

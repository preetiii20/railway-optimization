#!/usr/bin/env python3
"""
Script to run freight optimization from Node.js backend
"""

import sys
import json
from models.freight_optimizer import freight_optimizer

def main():
    # Read input from command line
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
    else:
        input_data = {}
    
    passenger_trains = input_data.get('passenger_trains', [])
    time_window = input_data.get('time_window', 24)
    
    # Run optimization
    result = freight_optimizer.optimize_paths(passenger_trains, time_window)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == '__main__':
    main()

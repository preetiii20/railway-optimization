"""
Phase 2: AI Model Development
Main script to test delay propagation, conflict detection, and optimization
"""

import sys
import json
from pathlib import Path

# Add models to path
sys.path.append(str(Path(__file__).parent))

from models.delay_propagator import DelayPropagator
from models.conflict_detector import ConflictDetector
from models.optimizer import TrainOptimizer
import config

def load_train_schedules():
    """Load train schedules from Phase 1"""
    schedules_path = config.PROCESSED_DATA_PATH + "train_schedules.json"
    
    print(f"Loading train schedules from {schedules_path}...")
    
    with open(schedules_path, 'r', encoding='utf-8') as f:
        schedules = json.load(f)
    
    print(f"Loaded {len(schedules)} trains")
    return schedules

def save_results(data, filename):
    """Save results to output folder"""
    output_path = config.OUTPUT_DATA_PATH + filename
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved results to {output_path}")

def main():
    print("=" * 60)
    print("PHASE 2: AI MODEL DEVELOPMENT")
    print("=" * 60)
    
    # Load train schedules from Phase 1
    train_schedules = load_train_schedules()
    
    if not train_schedules:
        print("❌ No train schedules found. Please run Phase 1 first.")
        return
    
    # Get first few trains for testing
    train_ids = list(train_schedules.keys())[:5]
    print(f"\nTesting with trains: {', '.join(train_ids)}")
    
    # ========================================
    # MODEL 1: DELAY PROPAGATION
    # ========================================
    print("\n" + "=" * 60)
    print("MODEL 1: DELAY PROPAGATION")
    print("=" * 60)
    
    propagator = DelayPropagator(train_schedules)
    
    # Test scenario: Inject delay on first train
    if len(train_ids) > 0:
        test_train = train_schedules[train_ids[0]]
        test_station = test_train['route'][2]['station_code'] if len(test_train['route']) > 2 else test_train['route'][0]['station_code']
        
        delay_result = propagator.inject_primary_delay(
            train_id=train_ids[0],
            station_code=test_station,
            delay_minutes=15,
            cause="weather"
        )
        
        # Save delay propagation results
        save_results(delay_result, "delay_propagation_result.json")
    
    # ========================================
    # MODEL 2: CONFLICT DETECTION
    # ========================================
    print("\n" + "=" * 60)
    print("MODEL 2: CONFLICT DETECTION")
    print("=" * 60)
    
    detector = ConflictDetector(train_schedules)
    conflicts_result = detector.detect_all_conflicts()
    
    # Save conflict detection results
    save_results(conflicts_result, "conflicts_detected.json")
    
    # ========================================
    # MODEL 3: OPTIMIZATION
    # ========================================
    print("\n" + "=" * 60)
    print("MODEL 3: OPTIMIZATION ENGINE")
    print("=" * 60)
    
    optimizer = TrainOptimizer(train_schedules)
    
    # Get conflicts to optimize
    conflicts_to_optimize = conflicts_result['conflicts'][:5]  # Top 5 conflicts
    
    if conflicts_to_optimize:
        # Test all three methods
        comparison_result = optimizer.compare_methods(conflicts_to_optimize)
        
        # Save optimization results
        save_results(comparison_result, "optimization_results.json")
    else:
        print("   No conflicts found to optimize!")
    
    # ========================================
    # SUMMARY
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 2 COMPLETE!")
    print("=" * 60)
    
    print(f"\n✓ Delay Propagation: Tested with {delay_result['summary']['affected_trains']} affected trains")
    print(f"✓ Conflict Detection: Found {conflicts_result['total_conflicts']} conflicts")
    
    if conflicts_to_optimize:
        print(f"✓ Optimization: Compared 3 methods for {len(conflicts_to_optimize)} conflicts")
    
    print("\nOutput files:")
    print(f"  - {config.OUTPUT_DATA_PATH}delay_propagation_result.json")
    print(f"  - {config.OUTPUT_DATA_PATH}conflicts_detected.json")
    print(f"  - {config.OUTPUT_DATA_PATH}optimization_results.json")
    
    print("\nNext: Run Phase 3 for Recommendation System")

if __name__ == "__main__":
    main()

# AI Algorithms Implemented - SIH Solution

## Core Problem: Freight Path Optimization
**Insert freight trains in gaps between passenger trains while satisfying railway constraints**

---

## 1. Constraint Satisfaction Problem (CSP)
**File:** `python-ai/models/freight_optimizer.py` → `find_time_gaps()`

**Purpose:** Find valid time slots that satisfy all railway constraints

**Constraints:**
- Minimum headway: 5 minutes between trains
- Maximum gap: 120 minutes
- Minimum loop time: 10 minutes
- Block section capacity

**Implementation:**
```python
def find_time_gaps(self) -> List[Dict]:
    # Build station-wise schedule
    # Sort by time
    # Find gaps satisfying: gap_size > (2 * min_headway)
    # Return valid gaps
```

**Output:** List of valid time gaps at each station

---

## 2. Genetic Algorithm (GA)
**File:** `python-ai/models/freight_optimizer.py` → `genetic_algorithm()`

**Purpose:** Optimize freight train placement for maximum efficiency

**Parameters:**
- Population size: 100
- Generations: 150
- Mutation rate: 15%
- Crossover rate: 70%
- Elite size: 10

**Process:**
1. **Initialize** random population of freight schedules
2. **Evaluate** fitness (distance, gap utilization, conflicts)
3. **Select** best performers (tournament selection)
4. **Crossover** parent schedules (single-point)
5. **Mutate** random changes
6. **Repeat** for 150 generations

**Fitness Function:**
```python
fitness = (num_trains × 100) + (total_distance × 2) 
        + gap_utilization_bonus - (conflicts × 200)
```

---

## 3. Dynamic Programming (DP)
**File:** `python-ai/models/freight_optimizer.py` → `dynamic_programming_path()`

**Purpose:** Find optimal path through time-space network

**Implementation:**
```python
def dynamic_programming_path(origin, destination):
    # Build graph of possible transitions
    # Find path with minimum cost
    # Cost = travel_time + (100 - gap_size)
    # Return optimal path
```

**Use Case:** Finding best route between two stations considering time constraints

---

## 4. Greedy Heuristic
**File:** `python-ai/models/freight_optimizer.py` → `greedy_heuristic()`

**Purpose:** Quick feasible solution (baseline comparison)

**Algorithm:**
1. Sort gaps by size (largest first)
2. Select largest available gap for origin
3. Select largest available gap for destination
4. Repeat until all trains scheduled

**Advantage:** Fast execution, guaranteed feasible solution

---

## How They Work Together

### Step 1: CSP finds valid gaps
```
Passenger trains: [T1, T2, T3, T4]
CSP finds gaps: [Gap1: 15min, Gap2: 30min, Gap3: 20min]
```

### Step 2: Algorithm optimizes placement
```
Genetic Algorithm:
- Creates 100 random freight schedules
- Evolves over 150 generations
- Finds best combination

Greedy Algorithm:
- Picks largest gaps first
- Quick solution
```

### Step 3: DP validates paths
```
For each freight train:
- Check if path is feasible
- Minimize conflicts
- Optimize travel time
```

---

## Results Display in Frontend

When you run optimization, the system shows:

### Algorithm Used
- 🧬 Genetic Algorithm (Best Quality)
- ⚡ Greedy Heuristic (Fast)
- 🎲 Random Baseline

### AI Techniques Applied
✓ CSP (Constraint Satisfaction)
✓ Genetic Algorithm / Greedy / Random
✓ Dynamic Programming (Path)
✓ Headway Constraint Validation

### Optimization Statistics
- Gaps Found: Number of valid time slots
- Utilization Rate: % of requested trains scheduled
- Avg Travel Time: Average journey duration
- Fitness Score: Overall solution quality

---

## Code Structure

```
python-ai/models/freight_optimizer.py
├── FreightOptimizer class
│   ├── find_time_gaps()           # CSP
│   ├── genetic_algorithm()        # GA
│   ├── dynamic_programming_path() # DP
│   ├── greedy_heuristic()         # Greedy
│   ├── fitness_function()         # Evaluation
│   ├── crossover()                # GA operator
│   ├── mutate()                   # GA operator
│   └── optimize()                 # Main function
```

---

## API Integration

**Backend:** `backend/routes/ai.js`
```javascript
POST /api/ai/optimize-freight
Body: {
  num_trains: 30,
  algorithm: 'genetic',  // or 'greedy', 'random'
  time_window_hours: 2
}
```

**Frontend:** `frontend/src/components/FreightAnalysis.jsx`
- User selects algorithm in form
- Clicks "Run Optimization"
- Results show which algorithm was used
- Displays AI techniques applied

---

## Comparison: Genetic vs Greedy

| Metric | Genetic Algorithm | Greedy Heuristic |
|--------|------------------|------------------|
| Quality | ⭐⭐⭐⭐⭐ Best | ⭐⭐⭐ Good |
| Speed | 🐢 Slower (30s) | ⚡ Fast (1s) |
| Fitness | Higher score | Lower score |
| Use Case | Final solution | Quick preview |

---

## SIH Problem Statement Alignment

✅ **Freight Path Optimization** - Core solution implemented
✅ **AI/ML Algorithms** - 4 algorithms (CSP, GA, DP, Greedy)
✅ **Constraint Satisfaction** - Headway, capacity, time windows
✅ **Real-time Optimization** - Works with live passenger schedules
✅ **Scalable** - Handles 100+ passenger trains
✅ **Demonstrable** - Visual results on map with metrics

---

## For Project Demonstration

1. **Show the problem:** Passenger trains with gaps
2. **Run Greedy:** Quick solution in 1 second
3. **Run Genetic:** Better solution in 30 seconds
4. **Compare results:** Show fitness scores
5. **Explain algorithms:** CSP → GA → DP working together

This demonstrates deep understanding of AI/ML optimization techniques! 🎯

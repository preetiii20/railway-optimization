# Automatic Algorithm Selection - Smart Optimization

## What Changed

Removed the parameter form. The system now automatically chooses the best algorithm based on current conditions.

---

## How It Works

### Single Button: "🎯 Optimize Now"

When you click the button, the system:

**Step 1: Analyze Current Situation**
```javascript
Current time: 14:30
Time window: 2 hours (next 2 hours)
Active freight trains in window: 3 trains
```

**Step 2: Smart Algorithm Selection**
```javascript
if (active_trains < 5) {
  algorithm = 'genetic'  // Best quality for few trains
} else {
  algorithm = 'greedy'   // Fast for many trains
}
```

**Step 3: Auto-Calculate Parameters**
```javascript
num_trains = max(active_trains, 10)  // At least 10 trains
time_window = 2 hours                 // Fixed 2-hour window
```

**Step 4: Run Optimization**
- Uses selected algorithm
- Optimizes trains in time window
- Shows results on map

---

## Algorithm Selection Logic

### Scenario 1: Few Active Trains (< 5)
```
Active trains: 2
Algorithm: 🧬 Genetic Algorithm
Reason: Best quality optimization
Time: ~30 seconds
Result: Optimal freight placement
```

### Scenario 2: Many Active Trains (≥ 5)
```
Active trains: 8
Algorithm: ⚡ Greedy Heuristic
Reason: Fast solution for many trains
Time: ~1 second
Result: Good quality, quick
```

---

## Example Runs

### Morning (8:00 AM)
```
Click "Optimize Now"
↓
System checks: 2 active trains
↓
Selects: Genetic Algorithm (best quality)
↓
Optimizes: 10 trains (minimum)
↓
Shows: Results with algorithm badge
```

### Afternoon (2:00 PM)
```
Click "Optimize Now"
↓
System checks: 3 active trains
↓
Selects: Genetic Algorithm
↓
Optimizes: 10 trains
↓
Shows: Results
```

### Evening (6:00 PM)
```
Click "Optimize Now"
↓
System checks: 7 active trains
↓
Selects: Greedy Algorithm (fast)
↓
Optimizes: 10 trains
↓
Shows: Results
```

---

## What You See

### Before Clicking
```
🎯 Optimize Now button
All 24 freight trains visible on map
Trains moving based on schedules
```

### After Clicking
```
Loading indicator
↓
Optimization runs (1-30 seconds)
↓
Results appear:
- Algorithm badge: "🧬 Genetic Algorithm" or "⚡ Greedy Heuristic"
- AI techniques applied
- Optimized trains on map
- Metrics updated
```

---

## Console Logs (For Debugging)

```
🚛 Running smart optimization...
⏰ Current time: 14:30:25
📊 Active trains in window: 3
🤖 Auto-selected algorithm: GENETIC
🎯 Target trains: 10
📦 Backend response: {...}
✅ Generated 3 freight trains
📊 Algorithm used: genetic
⏱️ Time window: 2 hours from now
📍 Setting 3 freight trains in state
```

---

## Benefits

✅ **No Form Needed** - Just one click
✅ **Smart Selection** - Chooses best algorithm automatically
✅ **Fast for Many Trains** - Uses Greedy when needed
✅ **Best Quality for Few** - Uses Genetic when possible
✅ **Always Works** - Adapts to current situation
✅ **Simple UX** - No parameters to set

---

## For Demo

**Presenter:** "Let me show you the optimization"

**Action:** Click "Optimize Now"

**System:** 
- Analyzes current trains
- Selects best algorithm
- Shows "Using Genetic Algorithm"
- Displays optimized results

**Presenter:** "The system automatically chose Genetic Algorithm because we have few trains in the current window, giving us the best quality solution"

---

## Technical Details

**Smart Selection Code:**
```javascript
const activeTrainsCount = liveFreightTrains.filter(f => 
  isTrainActiveInWindow(f, currentTimeMinutes, 2)
).length;

const algorithm = activeTrainsCount < 5 ? 'genetic' : 'greedy';
const numTrains = Math.max(activeTrainsCount, 10);
```

**Always Uses:**
- Time window: 2 hours
- Minimum trains: 10
- Auto-selected algorithm

**Result Display:**
- Shows which algorithm was used
- Displays AI techniques
- Updates metrics
- Shows optimized trains on map

Perfect for a clean, professional demo! 🎯

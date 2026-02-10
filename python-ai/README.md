# Railway Optimization System - Python AI Module

## Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run Phase 1 (Data Preparation):**
```bash
python phase1_data_prep.py
```

**Note:** Uses OpenStreetMap Nominatim for geocoding - completely FREE, no API key needed!

## Project Structure

```
python-ai/
├── data/
│   ├── raw/              # Original CSV data
│   ├── processed/        # Filtered and processed data
│   └── output/           # Final outputs for Node.js
├── utils/
│   ├── data_loader.py    # Load and filter CSV
│   ├── geocoder.py       # Get station coordinates
│   └── schedule_builder.py  # Build train schedules
├── models/               # AI models (Phase 2)
├── api/                  # Flask API (Phase 4)
├── config.py             # Configuration
└── requirements.txt      # Python dependencies
```

## Phase 1 Outputs

After running `phase1_data_prep.py`, you'll get:

1. `data/processed/csmt_trains.csv` - Filtered CSMT trains
2. `data/processed/stations_raw.json` - Unique stations
3. `data/processed/stations_geocoded.json` - Stations with coordinates
4. `data/processed/train_schedules.json` - Structured train schedules

## Next Steps

- Phase 2: AI Model Development (delay propagation, conflict detection)
- Phase 3: Recommendation System
- Phase 4: Python API
- Phase 5: Visualization

# ============================================================
# data_store.py — In-Memory Data Store (Simulates AWS DynamoDB)
# ============================================================
# Stores processed weather records per city with time-series
# history, capped at 100 records per city.
# ============================================================

from datetime import datetime
from typing import Dict, List, Optional


class DataStore:
    """In-memory data store for weather records by city."""
    
    def __init__(self, max_records_per_city: int = 100):
        self.max_records = max_records_per_city
        self.cities: Dict[str, List[dict]] = {}
        self.latest_by_city: Dict[str, dict] = {}
        self.total_records_processed = 0
        self.created_at = datetime.now().isoformat()
    
    def put(self, city_name: str, record: dict) -> None:
        """Insert a processed weather record for a city."""
        if city_name not in self.cities:
            self.cities[city_name] = []
        
        self.cities[city_name].append(record)
        self.latest_by_city[city_name] = record
        self.total_records_processed += 1
        
        # Cap history size
        if len(self.cities[city_name]) > self.max_records:
            self.cities[city_name].pop(0)
    
    def get_latest(self, city_name: str) -> Optional[dict]:
        """Get the latest record for a city."""
        return self.latest_by_city.get(city_name)
    
    def get_all_latest(self) -> Dict[str, dict]:
        """Get all latest records across all cities."""
        return dict(self.latest_by_city)
    
    def get_history(self, city_name: str, limit: int = 50, start_ts: float = None, end_ts: float = None) -> List[dict]:
        """Get history for a specific city with optional time filtering."""
        records = self.cities.get(city_name, [])
        
        if start_ts or end_ts:
            filtered = []
            for r in records:
                ts = r.get('timestamp', 0)
                if start_ts and ts < start_ts:
                    continue
                if end_ts and ts > end_ts:
                    continue
                filtered.append(r)
            records = filtered

        return records[-limit:] if limit else records
    
    def get_cities(self) -> List[str]:
        """Get list of all monitored cities."""
        return list(self.cities.keys())
    
    def get_stats(self) -> dict:
        """Get store statistics."""
        created_dt = datetime.fromisoformat(self.created_at)
        uptime_ms = int((datetime.now() - created_dt).total_seconds() * 1000)
        
        return {
            'totalCities': len(self.cities),
            'totalRecordsProcessed': self.total_records_processed,
            'recordsPerCity': {city: len(records) for city, records in self.cities.items()},
            'storeCreatedAt': self.created_at,
            'uptime': uptime_ms
        }

# ============================================================
# lambda_processor.py — AWS Lambda Function Simulator
# ============================================================
# Simulates an AWS Lambda function that processes records from
# the Kinesis stream, transforms the weather data, and stores
# it in the DataStore.
# ============================================================

from datetime import datetime
from typing import Optional


class LambdaProcessor:
    """Simulates an AWS Lambda function processing Kinesis records."""
    
    def __init__(self, kinesis_stream, data_store):
        self.kinesis_stream = kinesis_stream
        self.data_store = data_store
        self.invocations = 0
        self.records_processed = 0
        self.errors = 0
        self.started_at = datetime.now().isoformat()
        
        # Subscribe to Kinesis stream
        self.kinesis_stream.on('record', self._process_record)
        
        print('[Lambda] ✓ Processor initialized and subscribed to Kinesis stream')
    
    def _process_record(self, record: dict) -> None:
        """Process a single record from Kinesis."""
        try:
            self.invocations += 1
            raw_data = record['data']
            city = record['partitionKey']
            
            # Transform the raw OpenWeatherMap data
            transformed = self._transform_weather_data(raw_data, city)
            
            # Store in DataStore
            self.data_store.put(city, transformed)
            
            self.records_processed += 1
            
            print(f'[Lambda] Processed {city}: {transformed["temperature"]}°C, {transformed["weatherDescription"]}')
            
        except Exception as e:
            self.errors += 1
            print(f'[Lambda] Processing error: {e}')
    
    def _transform_weather_data(self, raw: dict, city: str) -> dict:
        """Transform OpenWeatherMap API data into our format."""
        try:
            # Handle both API and mock data structures
            main = raw.get('main', {})
            weather = raw.get('weather', [{}])[0]
            wind = raw.get('wind', {})
            sys = raw.get('sys', {})
            coords = raw.get('coord', {})
            
            return {
                'city': city,
                'temperature': float(f"{main.get('temp', 0):.1f}"),
                'feelsLike': float(f"{main.get('feels_like', 0):.1f}"),
                'tempMin': float(f"{main.get('temp_min', 0):.1f}"),
                'tempMax': float(f"{main.get('temp_max', 0):.1f}"),
                'pressure': main.get('pressure', 0),
                'humidity': main.get('humidity', 0),
                'visibility': raw.get('visibility', 0),
                'uvIndex': raw.get('uvIndex', 0),
                'windSpeed': float(f"{wind.get('speed', 0):.1f}"),
                'windDeg': wind.get('deg', 0),
                'windGust': float(f"{wind.get('gust', 0):.1f}") if wind.get('gust') else None,
                'precipitation': raw.get('rain', {}).get('1h', 0) or raw.get('snow', {}).get('1h', 0) or 0,
                'cloudiness': raw.get('clouds', {}).get('all', 0),
                'weatherMain': weather.get('main', 'Unknown'),
                'weatherDescription': weather.get('description', 'unknown'),
                'weatherIcon': weather.get('icon', '01d'),
                'sunrise': sys.get('sunrise'),
                'sunset': sys.get('sunset'),
                'timezone': raw.get('timezone', 0),
                'latitude': coords.get('lat', 0),
                'longitude': coords.get('lon', 0),
                'timestamp': raw.get('dt') or int(datetime.now().timestamp()),
                'processedAt': datetime.now().isoformat()
            }
        except Exception as e:
            print(f'[Lambda] Transform error: {e}')
            raise
    
    def get_stats(self) -> dict:
        """Get Lambda processor statistics."""
        started_dt = datetime.fromisoformat(self.started_at)
        uptime_ms = int((datetime.now() - started_dt).total_seconds() * 1000)
        
        # Calculate success rate safely (fixed lint error by avoiding round())
        if self.invocations > 0:
            raw_rate = float(self.records_processed) / float(self.invocations) * 100.0
            success_rate = float(f"{raw_rate:.2f}")
        else:
            success_rate = 0.0
        
        return {
            'functionName': 'WeatherDataProcessor',
            'status': 'ACTIVE',
            'invocations': self.invocations,
            'recordsProcessed': self.records_processed,
            'errors': self.errors,
            'successRate': success_rate,
            'startedAt': self.started_at,
            'uptime': uptime_ms
        }

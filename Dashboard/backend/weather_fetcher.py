# ============================================================
# weather_fetcher.py — OpenWeatherMap Data Fetcher
# ============================================================
# Periodically fetches real weather data from OpenWeatherMap
# API and pushes it into the Kinesis stream. Falls back to
# realistic mock data if no API key is configured.
# ============================================================

import math
import random
import requests
import threading
from datetime import datetime
from typing import List, Optional


class WeatherFetcher:
    """Fetches weather data from OpenWeatherMap or generates mock data."""
    
    def __init__(self, kinesis_stream, api_key: str = '', cities: List[str] = None, interval_sec: int = 60):
        self.kinesis_stream = kinesis_stream
        self.api_key = api_key
        self.cities = cities or ['Delhi', 'Mumbai', 'Chennai']
        self.interval_sec = interval_sec
        self.fetch_count = 0
        self.last_fetch: Optional[str] = None
        self.status = 'IDLE'
        self.use_mock_data = not bool(api_key)
        self.timer: Optional[threading.Timer] = None
        
        if self.use_mock_data:
            print('[Fetcher] ⚠ No API key — using realistic mock weather data')
        else:
            print(f'[Fetcher] ✓ API key configured — will fetch real data for: {", ".join(self.cities)}')
    
    def start(self) -> None:
        """Start the periodic fetch cycle."""
        self.status = 'RUNNING'
        print(f'[Fetcher] Started — fetching every {self.interval_sec}s for {len(self.cities)} cities')
        
        # Fetch immediately, then on interval
        self._fetch_all()
    
    def stop(self) -> None:
        """Stop the fetch cycle."""
        if self.timer:
            self.timer.cancel()
            self.timer = None
        self.status = 'STOPPED'
        print('[Fetcher] Stopped')
    
    def _fetch_all(self) -> None:
        """Fetch weather data for all configured cities."""
        for city in self.cities:
            try:
                data = self._generate_mock_data(city) if self.use_mock_data else self._fetch_from_api(city)
                
                # Push into Kinesis stream
                self.kinesis_stream.put_record(data, city)
                self.fetch_count += 1
                self.last_fetch = datetime.now().isoformat()
                
            except Exception as e:
                print(f'[Fetcher] Error fetching {city}: {e}')
        
        # Schedule next fetch
        if self.status == 'RUNNING':
            self.timer = threading.Timer(self.interval_sec, self._fetch_all)
            self.timer.daemon = True
            self.timer.start()
    
    def _fetch_from_api(self, city: str) -> dict:
        """Fetch real data from OpenWeatherMap API."""
        url = f'https://api.openweathermap.org/data/2.5/weather'
        params = {
            'q': city,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    
    def _generate_mock_data(self, city: str) -> dict:
        """Generate realistic mock weather data for a city."""
        city_defaults = self._get_city_defaults(city)
        now = int(datetime.now().timestamp())
        hour = datetime.now().hour
        
        # Temperature varies by time of day
        temp_variation = math.sin((hour - 6) * math.pi / 12) * 5
        base_temp = city_defaults['baseTemp'] + temp_variation + (random.random() - 0.5) * 3
        
        conditions = [
            {'main': 'Clear', 'description': 'clear sky', 'icon': '01d' if 6 <= hour < 18 else '01n'},
            {'main': 'Clouds', 'description': 'scattered clouds', 'icon': '03d' if 6 <= hour < 18 else '03n'},
            {'main': 'Clouds', 'description': 'broken clouds', 'icon': '04d' if 6 <= hour < 18 else '04n'},
            {'main': 'Rain', 'description': 'light rain', 'icon': '10d' if 6 <= hour < 18 else '10n'},
            {'main': 'Haze', 'description': 'haze', 'icon': '50d' if 6 <= hour < 18 else '50n'}
        ]
        condition = random.choice(conditions)
        
        # Calculate sunrise/sunset for the day
        day_start = now - (now % 86400)
        sunrise = day_start + 6 * 3600 + 1800  # 6:30 AM
        sunset = day_start + 18 * 3600 + 1800   # 6:30 PM
        
        return {
            'coord': city_defaults['coord'],
            'weather': [condition],
            'main': {
                'temp': round(base_temp, 1),
                'feels_like': round(base_temp - 1 + random.random() * 2, 1),
                'temp_min': round(base_temp - 2, 1),
                'temp_max': round(base_temp + 2, 1),
                'pressure': 1010 + random.randint(0, 15),
                'humidity': city_defaults['baseHumidity'] + random.randint(-10, 10),
                'sea_level': 1013 + random.randint(0, 5),
                'grnd_level': 1008 + random.randint(0, 5)
            },
            'visibility': 5000 + random.randint(0, 5000),
            'wind': {
                'speed': round(2 + random.random() * 8, 1),
                'deg': random.randint(0, 360),
                'gust': round(5 + random.random() * 10, 1)
            },
            'clouds': {'all': random.randint(0, 100)},
            'dt': now,
            'sys': {
                'country': 'IN',
                'sunrise': sunrise,
                'sunset': sunset
            },
            'timezone': 19800,  # IST: UTC+5:30
            'id': city_defaults['id'],
            'name': city
        }
    
    def _get_city_defaults(self, city: str) -> dict:
        """Default coordinates and baseline weather for Indian cities."""
        defaults = {
            'Delhi': {'id': 1273294, 'coord': {'lon': 77.22, 'lat': 28.67}, 'baseTemp': 25, 'baseHumidity': 50},
            'Mumbai': {'id': 1275339, 'coord': {'lon': 72.88, 'lat': 19.08}, 'baseTemp': 30, 'baseHumidity': 70},
            'Chennai': {'id': 1264527, 'coord': {'lon': 80.27, 'lat': 13.08}, 'baseTemp': 32, 'baseHumidity': 75},
            'Kolkata': {'id': 1275004, 'coord': {'lon': 88.37, 'lat': 22.57}, 'baseTemp': 28, 'baseHumidity': 65},
            'Hyderabad': {'id': 1269843, 'coord': {'lon': 78.47, 'lat': 17.38}, 'baseTemp': 27, 'baseHumidity': 55},
            'Bangalore': {'id': 1277333, 'coord': {'lon': 77.60, 'lat': 12.98}, 'baseTemp': 24, 'baseHumidity': 60}
        }
        return defaults.get(city, {'id': 9999, 'coord': {'lon': 0, 'lat': 0}, 'baseTemp': 25, 'baseHumidity': 50})
    
    def get_stats(self) -> dict:
        """Get fetcher statistics."""
        return {
            'status': self.status,
            'useMockData': self.use_mock_data,
            'cities': self.cities,
            'fetchCount': self.fetch_count,
            'lastFetch': self.last_fetch,
            'intervalSec': self.interval_sec
        }

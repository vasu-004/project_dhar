# ============================================================
# kinesis_simulator.py — AWS Kinesis Stream Simulator
# ============================================================
# Simulates an AWS Kinesis data stream with shards.
# Records are distributed across shards based on partition key.
# Emits events when records are added.
# ============================================================

import hashlib
from datetime import datetime
from typing import Callable, List


class KinesisSimulator:
    """Simulates an AWS Kinesis stream with shards."""
    
    def __init__(self, stream_name: str, shard_count: int = 2):
        self.stream_name = stream_name
        self.shard_count = shard_count
        self.shards = {f'shard-{i}': [] for i in range(shard_count)}
        self.record_count = 0
        self.listeners: List[Callable] = []
        self.created_at = datetime.now().isoformat()
        
        print(f'[Kinesis] ✓ Stream created: {stream_name} (shards: {shard_count})')
    
    def put_record(self, data: dict, partition_key: str) -> dict:
        """Put a record into the stream."""
        # Hash partition key to determine shard
        shard_id = self._get_shard_for_key(partition_key)
        
        record = {
            'sequenceNumber': str(self.record_count),
            'partitionKey': partition_key,
            'data': data,
            'approximateArrivalTimestamp': datetime.now().isoformat()
        }
        
        self.shards[shard_id].append(record)
        self.record_count += 1
        
        # Notify listeners
        self._emit('record', record)
        
        # Cap shard size at 1000 records
        if len(self.shards[shard_id]) > 1000:
            self.shards[shard_id].pop(0)
        
        return {
            'shardId': shard_id,
            'sequenceNumber': record['sequenceNumber']
        }
    
    def _get_shard_for_key(self, partition_key: str) -> str:
        """Determine which shard to use based on partition key."""
        hash_val = int(hashlib.md5(partition_key.encode()).hexdigest(), 16)
        shard_index = hash_val % self.shard_count
        return f'shard-{shard_index}'
    
    def on(self, event: str, callback: Callable) -> None:
        """Register an event listener."""
        if event == 'record':
            self.listeners.append(callback)
    
    def _emit(self, event: str, data: dict) -> None:
        """Emit an event to all listeners."""
        for listener in self.listeners:
            try:
                listener(data)
            except Exception as e:
                print(f'[Kinesis] Listener error: {e}')
    
    def describe_stream(self) -> dict:
        """Return stream metadata."""
        created_dt = datetime.fromisoformat(self.created_at)
        uptime_ms = int((datetime.now() - created_dt).total_seconds() * 1000)
        
        return {
            'streamName': self.stream_name,
            'streamStatus': 'ACTIVE',
            'shardCount': self.shard_count,
            'recordCount': self.record_count,
            'shards': {
                shard_id: len(records) 
                for shard_id, records in self.shards.items()
            },
            'createdAt': self.created_at,
            'uptime': uptime_ms
        }

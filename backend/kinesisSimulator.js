// ============================================================
// kinesisSimulator.js — AWS Kinesis Data Stream Simulator
// ============================================================
// Simulates a Kinesis stream with shards. Raw weather data is
// put into the stream and consumers (Lambda) are notified.
// ============================================================

const EventEmitter = require('events');

class KinesisSimulator extends EventEmitter {
    constructor(streamName = 'WeatherDataStream', shardCount = 1) {
        super();
        this.streamName = streamName;
        this.shardCount = shardCount;
        this.shards = Array.from({ length: shardCount }, (_, i) => ({
            shardId: `shard-${i}`,
            records: [],
            sequenceNumber: 0
        }));
        this.status = 'ACTIVE';
        this.createdAt = new Date().toISOString();
        this.totalRecordsIngested = 0;

        console.log(`[Kinesis] Stream "${this.streamName}" initialized with ${this.shardCount} shard(s)`);
    }

    /**
     * Put a record into the stream (routes to a shard based on partition key).
     */
    putRecord(data, partitionKey) {
        const shardIndex = this._hashPartitionKey(partitionKey) % this.shardCount;
        const shard = this.shards[shardIndex];

        const record = {
            sequenceNumber: String(++shard.sequenceNumber).padStart(21, '0'),
            partitionKey,
            data,
            approximateArrivalTimestamp: new Date().toISOString(),
            shardId: shard.shardId
        };

        shard.records.push(record);
        this.totalRecordsIngested++;

        // Keep shard buffer bounded
        if (shard.records.length > 1000) {
            shard.records = shard.records.slice(-500);
        }

        // Emit for consumers (Lambda)
        this.emit('record', record);

        console.log(`[Kinesis] Record ingested → shard: ${shard.shardId}, seq: ${record.sequenceNumber}, key: ${partitionKey}`);

        return {
            shardId: shard.shardId,
            sequenceNumber: record.sequenceNumber
        };
    }

    /**
     * Put multiple records at once.
     */
    putRecords(records) {
        return records.map(({ data, partitionKey }) => this.putRecord(data, partitionKey));
    }

    /**
     * Get stream description (like AWS DescribeStream).
     */
    describeStream() {
        return {
            streamName: this.streamName,
            streamStatus: this.status,
            shardCount: this.shardCount,
            totalRecordsIngested: this.totalRecordsIngested,
            createdAt: this.createdAt,
            shards: this.shards.map(s => ({
                shardId: s.shardId,
                recordCount: s.records.length,
                latestSequenceNumber: s.sequenceNumber
            }))
        };
    }

    /**
     * Simple hash of partition key to determine shard.
     */
    _hashPartitionKey(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash) + key.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
}

module.exports = KinesisSimulator;

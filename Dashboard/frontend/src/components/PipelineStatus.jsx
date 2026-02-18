import React from 'react';

function PipelineStatus({ pipeline, connected }) {
    if (!pipeline) {
        return (
            <div className="pipeline-container">
                <h3 className="section-title">🔗 AWS Pipeline Status</h3>
                <div className="pipeline-loading">Connecting to pipeline...</div>
            </div>
        );
    }

    const kinesis = pipeline.kinesis || {};
    const lambda = pipeline.lambda || {};
    const store = pipeline.dataStore || {};
    const fetcher = pipeline.fetcher || {};

    const stages = [
        {
            name: 'Data Source',
            subtitle: fetcher.useMockData ? 'Mock Data' : 'OpenWeatherMap',
            status: fetcher.status === 'RUNNING' ? 'active' : 'idle',
            stats: `${fetcher.fetchCount || 0} fetches`,
            icon: '🌐'
        },
        {
            name: 'Kinesis Stream',
            subtitle: kinesis.streamName || 'WeatherDataStream',
            status: kinesis.streamStatus === 'ACTIVE' ? 'active' : 'idle',
            stats: `${kinesis.recordCount || 0} records | ${kinesis.shardCount || 0} shards`,
            icon: '📡'
        },
        {
            name: 'Lambda Processor',
            subtitle: lambda.functionName || 'WeatherDataProcessor',
            status: lambda.status === 'ACTIVE' ? 'active' : 'idle',
            stats: `${lambda.invocations || 0} invocations | ${lambda.successRate || 100}% success`,
            icon: 'λ'
        },
        {
            name: 'Data Store',
            subtitle: 'DynamoDB (Simulated)',
            status: (store.totalRecordsProcessed || 0) > 0 ? 'active' : 'idle',
            stats: `${store.totalRecordsProcessed || 0} records | ${store.totalCities || 0} cities`,
            icon: '💾'
        }
    ];

    return (
        <div className="pipeline-container creative-pipeline">
            <div className="cyber-header">
                <h3 className="section-title">
                    <span className="cyber-icon">🔗</span> AWS Real-time Pipeline
                    <span className={`connection-badge modern ${connected ? 'online' : 'offline'}`}>
                        {connected ? 'SYSTEM ACTIVE' : 'CONNECTION LOST'}
                    </span>
                </h3>
                <div className="cyber-line"></div>
            </div>

            <div className="pipeline-flow-creative">
                {stages.map((stage, i) => (
                    <React.Fragment key={stage.name}>
                        <div className={`pipeline-node ${stage.status}`}>
                            <div className="node-glow"></div>
                            <div className="node-content">
                                <div className="node-icon-hex">
                                    <span className="hex-bg"></span>
                                    <span className="hex-icon">{stage.icon}</span>
                                </div>
                                <div className="node-info">
                                    <div className="node-name">{stage.name}</div>
                                    <div className="node-subtitle">{stage.subtitle}</div>
                                    <div className="node-stats">{stage.stats}</div>
                                </div>
                            </div>
                            <div className={`node-status-marker ${stage.status}`}>
                                <div className="marker-dot"></div>
                                <span className="marker-text">{stage.status.toUpperCase()}</span>
                            </div>
                            <div className="node-decoration">
                                <span className="corner tl"></span>
                                <span className="corner tr"></span>
                                <span className="corner bl"></span>
                                <span className="corner br"></span>
                            </div>
                        </div>
                        {i < stages.length - 1 && (
                            <div className={`pipeline-connector ${stage.status === 'active' ? 'active' : ''}`}>
                                <div className="connector-line"></div>
                                <div className="data-pulses">
                                    <span className="pulse"></span>
                                    <span className="pulse"></span>
                                    <span className="pulse"></span>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {lambda.averageDurationMs !== undefined && (
                <div className="pipeline-system-metrics">
                    <div className="metric-box">
                        <span className="label">LATENCY</span>
                        <span className="value">{lambda.averageDurationMs}ms</span>
                    </div>
                    <div className="metric-box">
                        <span className="label">LAST SYNC</span>
                        <span className="value">
                            {lambda.lastInvocation ? new Date(lambda.lastInvocation).toLocaleTimeString() : 'N/A'}
                        </span>
                    </div>
                    <div className="metric-box status">
                        <span className="label">PROTOCOL</span>
                        <span className="value">WSS / KINESIS</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PipelineStatus;

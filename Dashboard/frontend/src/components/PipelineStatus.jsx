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
            stats: `${kinesis.totalRecordsIngested || 0} records | ${kinesis.shardCount || 0} shards`,
            icon: '📡'
        },
        {
            name: 'Lambda Processor',
            subtitle: lambda.functionName || 'WeatherDataProcessor',
            status: lambda.status === 'ACTIVE' ? 'active' : 'idle',
            stats: `${lambda.invocationCount || 0} invocations | ${lambda.successRate || 100}% success`,
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
        <div className="pipeline-container">
            <h3 className="section-title">
                🔗 AWS Pipeline Status
                <span className={`connection-badge ${connected ? 'online' : 'offline'}`}>
                    {connected ? '● Live' : '○ Offline'}
                </span>
            </h3>

            <div className="pipeline-flow">
                {stages.map((stage, i) => (
                    <React.Fragment key={stage.name}>
                        <div className={`pipeline-stage ${stage.status}`}>
                            <div className="stage-icon">{stage.icon}</div>
                            <div className="stage-info">
                                <div className="stage-name">{stage.name}</div>
                                <div className="stage-subtitle">{stage.subtitle}</div>
                                <div className="stage-stats">{stage.stats}</div>
                            </div>
                            <div className={`stage-indicator ${stage.status}`}></div>
                        </div>
                        {i < stages.length - 1 && (
                            <div className="pipeline-arrow">
                                <span>→</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {lambda.averageDurationMs !== undefined && (
                <div className="pipeline-metrics">
                    <span>Avg Lambda Duration: <strong>{lambda.averageDurationMs}ms</strong></span>
                    <span>Last Invocation: <strong>{lambda.lastInvocation
                        ? new Date(lambda.lastInvocation).toLocaleString()
                        : 'N/A'}</strong></span>
                </div>
            )}
        </div>
    );
}

export default PipelineStatus;

import React from 'react';

function PipelineStatus({ pipeline, connected }) {
    if (!pipeline) {
        return (
            <div className="modern-pipeline-container">
                <div className="pipeline-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    <h3 className="pipeline-title">AWS Pipeline Status</h3>
                </div>
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
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
            )
        },
        {
            name: 'Kinesis Stream',
            subtitle: kinesis.streamName || 'WeatherDataStream',
            status: kinesis.streamStatus === 'ACTIVE' ? 'active' : 'idle',
            stats: `${kinesis.totalRecordsIngested || 0} records | ${kinesis.shardCount || 0} shards`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" />
                    <polyline points="9 10 12 7 15 10" />
                    <line x1="12" y1="7" x2="12" y2="17" />
                </svg>
            )
        },
        {
            name: 'Lambda Processor',
            subtitle: lambda.functionName || 'WeatherDataProcessor',
            status: lambda.status === 'ACTIVE' ? 'active' : 'idle',
            stats: `${lambda.invocationCount || 0} invocations | ${lambda.successRate || 100}% success`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                </svg>
            )
        },
        {
            name: 'Data Store',
            subtitle: 'DynamoDB (Simulated)',
            status: (store.totalRecordsProcessed || 0) > 0 ? 'active' : 'idle',
            stats: `${store.totalRecordsProcessed || 0} records | ${store.totalCities || 0} cities`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            )
        }
    ];

    return (
        <div className="modern-pipeline-container">
            <div className="pipeline-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
                <h3 className="pipeline-title">AWS Pipeline Status</h3>
                <span className={`connection-status ${connected ? 'online' : 'offline'}`}>
                    {connected ? '● Live' : '○ Offline'}
                </span>
            </div>

            <div className="pipeline-stages-grid">
                {stages.map((stage, i) => (
                    <div key={stage.name} className={`pipeline-stage-card ${stage.status}`}>
                        <div className="stage-icon-wrapper">
                            {stage.icon}
                            <div className={`stage-pulse ${stage.status}`}></div>
                        </div>
                        <div className="stage-content">
                            <div className="stage-name">{stage.name}</div>
                            <div className="stage-subtitle">{stage.subtitle}</div>
                            <div className="stage-stats">{stage.stats}</div>
                        </div>
                        <div className={`stage-status-indicator ${stage.status}`}>
                            {stage.status === 'active' ? '✓ Active' : '○ Idle'}
                        </div>
                    </div>
                ))}
            </div>

            {lambda.averageDurationMs !== undefined && (
                <div className="pipeline-footer-metrics">
                    <div className="metric-item">
                        <span className="metric-label">Avg Lambda Duration:</span>
                        <span className="metric-value">{lambda.averageDurationMs}ms</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">Last Invocation:</span>
                        <span className="metric-value">{lambda.lastInvocation
                            ? new Date(lambda.lastInvocation).toLocaleTimeString()
                            : 'N/A'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PipelineStatus;

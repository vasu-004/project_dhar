import React from 'react';
import PipelineStatus from '../components/PipelineStatus';

function Pipeline({ pipeline, connected }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">AWS Pipeline Status</h2>
                <p className="page-subtitle">Real-time data flow monitoring</p>
            </div>

            {/* Pipeline Status - Full Width */}
            <div className="pipeline-full">
                <PipelineStatus pipeline={pipeline} connected={connected} />
            </div>

            {/* Additional Pipeline Info */}
            <div className="pipeline-info-grid">
                <div className="info-card">
                    <h3 className="info-title">Data Source</h3>
                    <p className="info-text">OpenWeatherMap API fetching data every 60 seconds for 6 Indian cities</p>
                    <div className="info-stat">
                        <span className="stat-label">Cities Monitored:</span>
                        <span className="stat-value">{pipeline?.dataStore?.totalCities || 0}</span>
                    </div>
                </div>

                <div className="info-card">
                    <h3 className="info-title">Kinesis Stream</h3>
                    <p className="info-text">WeatherDataStream processes incoming weather data with 2 active shards</p>
                    <div className="info-stat">
                        <span className="stat-label">Records Processed:</span>
                        <span className="stat-value">{pipeline?.kinesis?.recordCount || 0}</span>
                    </div>
                </div>

                <div className="info-card">
                    <h3 className="info-title">Lambda Processor</h3>
                    <p className="info-text">WeatherDataProcessor transforms and validates all incoming records</p>
                    <div className="info-stat">
                        <span className="stat-label">Success Rate:</span>
                        <span className="stat-value">{pipeline?.lambda?.successRate || 0}%</span>
                    </div>
                </div>

                <div className="info-card">
                    <h3 className="info-title">Data Store</h3>
                    <p className="info-text">DynamoDB table storing historical weather data for analysis</p>
                    <div className="info-stat">
                        <span className="stat-label">Total Records:</span>
                        <span className="stat-value">{pipeline?.dataStore?.totalRecordsProcessed || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pipeline;

// ============================================================
// pipelineStatus.js — Pipeline Status Component
// =================================================================

function createPipelineStatus(pipeline, connected) {
    if (!pipeline) {
        return `
            <div class="pipeline-container">
                <h3 class="section-title">
                    ⚙️ AWS Pipeline Status
                    <span class="connection-badge ${connected ? 'online' : 'offline'}">
                        ${connected ? 'Connected' : 'Offline'}
                    </span>
                </h3>
                <div class="pipeline-loading">Loading pipeline data...</div>
            </div>
        `;
    }

    const { kinesis, lambda, dataStore, fetcher } = pipeline;

    return `
        <div class="pipeline-container">
            <h3 class="section-title">
                ⚙️ AWS Pipeline Status
                <span class="connection-badge ${connected ? 'online' : 'offline'}">
                    ${connected ? 'Live' : 'Offline'}
                </span>
            </h3>
            
            <!-- Pipeline Flow -->
            <div class="pipeline-flow">
                <!-- Fetcher -->
                <div class="pipeline-stage ${fetcher?.status === 'RUNNING' ? 'active' : ''}">
                    <span class="stage-indicator ${fetcher?.status === 'RUNNING' ? 'active' : ''}"></span>
                    <div class="stage-icon">🌐</div>
                    <div class="stage-name">Weather Fetcher</div>
                    <div class="stage-subtitle">OpenWeatherMap</div>
                    <div class="stage-stats">
                        ${fetcher?.fetchCount || 0} fetches
                    </div>
                </div>
                
                <div class="pipeline-arrow">→</div>
                
                <!--Kinesis -->
                <div class="pipeline-stage active">
                    <span class="stage-indicator active"></span>
                    <div class="stage-icon">📊</div>
                    <div class="stage-name">Kinesis Stream</div>
                    <div class="stage-subtitle">${kinesis?.shardCount || 0} shards</div>
                    <div class="stage-stats">
                        ${kinesis?.recordCount || 0} records
                    </div>
                </div>
                
                <div class="pipeline-arrow">→</div>
                
                <!-- Lambda -->
                <div class="pipeline-stage ${lambda?.status === 'ACTIVE' ? 'active' : ''}">
                    <span class="stage-indicator ${lambda?.status === 'ACTIVE' ? 'active' : ''}"></span>
                    <div class="stage-icon">⚡</div>
                    <div class="stage-name">Lambda Processor</div>
                    <div class="stage-subtitle">Data Transformer</div>
                    <div class="stage-stats">
                        ${lambda?.recordsProcessed || 0} processed
                    </div>
                </div>
                
                <div class="pipeline-arrow">→</div>
                
                <!-- DataStore -->
                <div class="pipeline-stage active">
                    <span class="stage-indicator active"></span>
                    <div class="stage-icon">💾</div>
                    <div class="stage-name">DataStore</div>
                    <div class="stage-subtitle">In-Memory DB</div>
                    <div class="stage-stats">
                        ${dataStore?.totalCities || 0} cities
                    </div>
                </div>
            </div>
            
            <!-- Pipeline Metrics -->
            <div class="pipeline-metrics">
                <div>
                    <strong>Total Records:</strong> ${dataStore?.totalRecordsProcessed || 0}
                </div>
                <div>
                    <strong>Success Rate:</strong> ${lambda?.successRate || 0}%
                </div>
                <div>
                    <strong>Uptime:</strong> ${formatUptime(dataStore?.uptime || 0)}
                </div>
            </div>
        </div>
    `;
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

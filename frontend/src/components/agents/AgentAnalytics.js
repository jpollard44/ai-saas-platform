import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import './AgentAnalytics.css';

// Mock chart component - in a real app, you'd use a library like Chart.js or Recharts
const Chart = ({ data, type, height = 200 }) => {
  // This is a simplified mock chart component
  // In a real implementation, you would use a proper charting library
  
  const maxValue = Math.max(...data.values) || 1;
  
  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      {type === 'line' && (
        <div className="line-chart">
          {data.values.map((value, index) => {
            const height = (value / maxValue) * 100;
            return (
              <div key={index} className="line-chart-bar-container">
                <div 
                  className="line-chart-bar" 
                  style={{ height: `${height}%` }}
                  title={`${data.labels[index]}: ${value}`}
                />
                <div className="line-chart-label">{data.labels[index]}</div>
              </div>
            );
          })}
        </div>
      )}
      
      {type === 'pie' && (
        <div className="pie-chart">
          <div className="pie-chart-legend">
            {data.labels.map((label, index) => (
              <div key={index} className="pie-chart-legend-item">
                <div 
                  className="pie-chart-legend-color" 
                  style={{ backgroundColor: `hsl(${index * 137.5}, 70%, 65%)` }}
                />
                <div className="pie-chart-legend-label">{label}: {data.values[index]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AgentAnalytics = ({ agentId, timeRange = '7d' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass the timeRange to the API
        const response = await analyticsService.getAgentAnalytics(agentId);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
        
        // Fallback to mock data for demo purposes
        setAnalytics(getMockAnalytics(agentId, selectedTimeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [agentId, selectedTimeRange]);

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={() => setSelectedTimeRange(selectedTimeRange)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="agent-analytics">
      <div className="analytics-header">
        <h3>Performance Analytics</h3>
        <div className="time-range-selector">
          <button 
            className={selectedTimeRange === '24h' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('24h')}
          >
            24h
          </button>
          <button 
            className={selectedTimeRange === '7d' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('7d')}
          >
            7d
          </button>
          <button 
            className={selectedTimeRange === '30d' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('30d')}
          >
            30d
          </button>
          <button 
            className={selectedTimeRange === '90d' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('90d')}
          >
            90d
          </button>
        </div>
      </div>

      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-value">{analytics.totalCalls}</div>
          <div className="metric-label">Total Calls</div>
          <div className="metric-change positive">
            +{analytics.callsGrowth}% from previous period
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.avgResponseTime}ms</div>
          <div className="metric-label">Avg Response Time</div>
          <div className={`metric-change ${analytics.responseTimeChange < 0 ? 'positive' : 'negative'}`}>
            {analytics.responseTimeChange < 0 ? '' : '+'}
            {analytics.responseTimeChange}% from previous period
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{(analytics.successRate * 100).toFixed(1)}%</div>
          <div className="metric-label">Success Rate</div>
          <div className={`metric-change ${analytics.successRateChange > 0 ? 'positive' : 'negative'}`}>
            {analytics.successRateChange > 0 ? '+' : ''}
            {analytics.successRateChange}% from previous period
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-value">${analytics.costIncurred.toFixed(2)}</div>
          <div className="metric-label">Cost Incurred</div>
          <div className={`metric-change ${analytics.costChange < 0 ? 'positive' : 'negative'}`}>
            {analytics.costChange > 0 ? '+' : ''}
            {analytics.costChange}% from previous period
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h4>Usage Over Time</h4>
          <Chart 
            type="line" 
            data={{
              labels: analytics.usageData.labels,
              values: analytics.usageData.values
            }}
          />
        </div>
        <div className="chart-card">
          <h4>Error Distribution</h4>
          <Chart 
            type="pie" 
            data={{
              labels: analytics.errorDistribution.labels,
              values: analytics.errorDistribution.values
            }}
          />
        </div>
      </div>
      
      <div className="analytics-table-container">
        <h4>Recent Interactions</h4>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Query</th>
              <th>Response Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics.recentInteractions.map((interaction, index) => (
              <tr key={index}>
                <td>{new Date(interaction.timestamp).toLocaleString()}</td>
                <td>{interaction.userId}</td>
                <td className="query-cell">{interaction.query}</td>
                <td>{interaction.responseTime}ms</td>
                <td>
                  <span className={`status-badge ${interaction.status.toLowerCase()}`}>
                    {interaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to generate mock analytics data
const getMockAnalytics = (agentId, timeRange) => {
  // Generate different data based on timeRange
  const dataPoints = timeRange === '24h' ? 24 : 
                     timeRange === '7d' ? 7 : 
                     timeRange === '30d' ? 30 : 14;
  
  // Generate labels (dates or hours)
  const labels = [];
  const now = new Date();
  
  if (timeRange === '24h') {
    for (let i = 0; i < dataPoints; i++) {
      const hour = (now.getHours() - (dataPoints - 1) + i + 24) % 24;
      labels.push(`${hour}:00`);
    }
  } else {
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      date.setDate(now.getDate() - (dataPoints - 1) + i);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
  }
  
  // Generate random usage data
  const usageData = {
    labels,
    values: Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 100) + 1)
  };
  
  // Generate random error distribution
  const errorTypes = ['Invalid Input', 'API Timeout', 'Auth Error', 'Rate Limit', 'Other'];
  const errorDistribution = {
    labels: errorTypes,
    values: errorTypes.map(() => Math.floor(Math.random() * 20))
  };
  
  // Generate random recent interactions
  const statuses = ['Success', 'Error', 'Timeout'];
  const queries = [
    'How do I reset my password?',
    'What are your business hours?',
    'Can you help me troubleshoot my account?',
    'I need information about pricing',
    'How do I cancel my subscription?',
    'What payment methods do you accept?',
    'Is there a mobile app available?'
  ];
  
  const recentInteractions = Array.from({ length: 10 }, (_, i) => {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 30);
    
    return {
      timestamp: timestamp.toISOString(),
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      query: queries[Math.floor(Math.random() * queries.length)],
      responseTime: Math.floor(Math.random() * 2000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
  
  // Calculate random metrics
  const totalCalls = usageData.values.reduce((sum, val) => sum + val, 0);
  const avgResponseTime = Math.floor(Math.random() * 1000) + 200;
  const successRate = Math.random() * 0.2 + 0.8; // 80-100%
  const costIncurred = totalCalls * 0.002; // $0.002 per call
  
  return {
    totalCalls,
    callsGrowth: Math.floor(Math.random() * 30) - 10,
    avgResponseTime,
    responseTimeChange: Math.floor(Math.random() * 40) - 20,
    successRate,
    successRateChange: Math.floor(Math.random() * 10) - 5,
    costIncurred,
    costChange: Math.floor(Math.random() * 40) - 10,
    usageData,
    errorDistribution,
    recentInteractions
  };
};

export default AgentAnalytics;

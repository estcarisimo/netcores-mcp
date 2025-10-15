/**
 * NetCores MCP Tools Implementation
 * Implements all 8 NetCores network analysis tools for MCP
 */

const NetCoresAPIClient = require('./client');

class NetCoresTools {
  constructor(apiUrl = process.env.NETCORES_API_URL || 'https://netcores.fi.uba.ar') {
    this.client = new NetCoresAPIClient(apiUrl);
  }

  /**
   * Get all tool definitions for MCP server
   */
  getToolDefinitions() {
    return [
      {
        name: 'netcores_health_check',
        description: 'Check the health and status of the NetCores system',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'netcores_data_summary',
        description: 'Get summary of available network data across IP versions',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'netcores_asn_trend',
        description: 'Analyze k-core shell index trends for a specific ASN over time',
        inputSchema: {
          type: 'object',
          properties: {
            asn: {
              type: 'integer',
              description: 'ASN number to analyze'
            },
            ip_version: {
              type: 'string',
              description: 'IP version (ipv4 or ipv6)',
              enum: ['ipv4', 'ipv6'],
              default: 'ipv4'
            },
            start_date: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            end_date: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of data points to display (default: 20, use 0 for all data)',
              minimum: 0,
              maximum: 1000,
              default: 20
            }
          },
          required: ['asn']
        }
      },
      {
        name: 'netcores_multiple_asn_trends',
        description: 'Compare k-core shell index trends for multiple ASNs over time',
        inputSchema: {
          type: 'object',
          properties: {
            asns: {
              type: 'array',
              items: { type: 'integer' },
              description: 'List of ASN numbers to analyze',
              minItems: 1,
              maxItems: 10
            },
            ip_version: {
              type: 'string',
              description: 'IP version (ipv4 or ipv6)',
              enum: ['ipv4', 'ipv6'],
              default: 'ipv4'
            },
            start_date: {
              type: 'string',
              description: 'Start date in YYYY-MM-DD format',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            end_date: {
              type: 'string',
              description: 'End date in YYYY-MM-DD format',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$'
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of data points to display per ASN (default: 10, use 0 for all data)',
              minimum: 0,
              maximum: 1000,
              default: 10
            }
          },
          required: ['asns']
        }
      },
      {
        name: 'netcores_snapshots',
        description: 'Get information about available network snapshots',
        inputSchema: {
          type: 'object',
          properties: {
            ip_version: {
              type: 'string',
              description: 'IP version to filter by (ipv4, ipv6, or omit for all)',
              enum: ['ipv4', 'ipv6']
            }
          },
          required: []
        }
      },
      {
        name: 'netcores_refresh_data',
        description: 'Trigger data refresh from CAIDA sources',
        inputSchema: {
          type: 'object',
          properties: {
            ip_versions: {
              type: 'array',
              items: { 
                type: 'string',
                enum: ['ipv4', 'ipv6']
              },
              description: 'IP versions to refresh',
              default: ['ipv4', 'ipv6']
            }
          },
          required: []
        }
      },
      {
        name: 'netcores_scheduler_status',
        description: 'Check the status of the automatic data update scheduler',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'netcores_trigger_update',
        description: 'Manually trigger a scheduled data update check',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ];
  }

  /**
   * Execute a tool by name with parameters
   */
  async executeTool(toolName, params = {}) {
    switch (toolName) {
      case 'netcores_health_check':
        return this.healthCheck(params);
      case 'netcores_data_summary':
        return this.dataSummary(params);
      case 'netcores_asn_trend':
        return this.asnTrend(params);
      case 'netcores_multiple_asn_trends':
        return this.multipleAsnTrends(params);
      case 'netcores_snapshots':
        return this.snapshots(params);
      case 'netcores_refresh_data':
        return this.refreshData(params);
      case 'netcores_scheduler_status':
        return this.schedulerStatus(params);
      case 'netcores_trigger_update':
        return this.triggerUpdate(params);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Health Check Tool
   */
  async healthCheck(params) {
    try {
      const result = await this.client.healthCheck();
      
      const statusEmoji = result.status === 'healthy' ? '✅' : '❌';
      const dataEmoji = result.data_status === 'available' ? '📊' : '⚠️';
      
      return `🏥 NetCores Health Check ${statusEmoji}

**System Status:** ${result.status || 'unknown'}
**Version:** ${result.version || 'unknown'}
**Data Status:** ${result.data_status || 'unknown'} ${dataEmoji}

**Database Health:**
- Status: ${result.database?.status || 'unknown'}
- Connection: ${result.database?.connection || 'unknown'}
- Tables: ${result.database?.tables || 0}`;
      
    } catch (error) {
      return `❌ Health check failed: ${error.message}`;
    }
  }

  /**
   * Data Summary Tool
   */
  async dataSummary(params) {
    try {
      const result = await this.client.getDataSummary();
      
      let response = '📊 NetCores Data Summary\n\n';
      
      for (const [ipVersion, data] of Object.entries(result)) {
        const emoji = ipVersion === 'ipv4' ? '🌐' : '🌍';
        response += `**${ipVersion.toUpperCase()} ${emoji}:**\n`;
        response += `- Snapshots: ${data.snapshot_count || 0}\n`;
        
        if (data.date_range) {
          const startDate = data.date_range.start || 'N/A';
          const endDate = data.date_range.end || 'N/A';
          response += `- Date Range: ${startDate} to ${endDate}\n`;
        }
        
        response += `- Total ASNs: ${(data.total_asns || 0).toLocaleString()}\n`;
        response += `- Max Shell Index: ${data.max_shell_index || 0}\n\n`;
      }
      
      return response;
      
    } catch (error) {
      return `❌ Data summary failed: ${error.message}`;
    }
  }

  /**
   * ASN Trend Tool
   */
  async asnTrend(params) {
    try {
      const { asn, ip_version = 'ipv4', start_date, end_date, limit = 20 } = params;
      
      const options = { ipVersion: ip_version };
      if (start_date) options.startDate = start_date;
      if (end_date) options.endDate = end_date;
      
      const result = await this.client.getASNTrend(asn, options);
      
      let response = `📈 ASN ${asn} Trend Analysis\n\n`;
      response += `**IP Version:** ${result.ip_version || 'unknown'}\n`;
      
      if (result.date_range) {
        response += `**Date Range:** ${result.date_range.start || 'N/A'} to ${result.date_range.end || 'N/A'}\n`;
      }
      
      const trendData = result.trend_data || [];
      if (trendData.length > 0) {
        response += `**Total Data Points:** ${trendData.length}\n`;
        
        // Determine how many points to display
        let displayData;
        if (limit === 0) {
          // Show all data
          displayData = trendData;
          response += `**Showing:** All ${trendData.length} data points\n\n`;
        } else {
          // Show limited data (most recent points)
          displayData = trendData.slice(-limit);
          if (trendData.length > limit) {
            response += `**Showing:** Most recent ${displayData.length} of ${trendData.length} data points\n`;
            response += `*Use limit=0 to see all data*\n\n`;
          } else {
            response += `**Showing:** All ${displayData.length} data points\n\n`;
          }
        }
        
        response += '**Trend Data:**\n';
        for (const point of displayData) {
          const date = point.date || 'N/A';
          const shellIdx = point.shell_index || 0;
          const maxShell = point.max_shell_index || 0;
          const normalized = point.normalized_shell_index || 0.0;
          
          response += `- ${date}: Shell ${shellIdx}/${maxShell} (normalized: ${normalized.toFixed(3)})\n`;
        }
      } else {
        response += '**No trend data available for this ASN and date range.**\n';
      }
      
      return response;
      
    } catch (error) {
      return `❌ ASN trend analysis failed: ${error.message}`;
    }
  }

  /**
   * Multiple ASN Trends Tool
   */
  async multipleAsnTrends(params) {
    try {
      const { asns, ip_version = 'ipv4', start_date, end_date, limit = 10 } = params;
      
      const options = { ipVersion: ip_version };
      if (start_date) options.startDate = start_date;
      if (end_date) options.endDate = end_date;
      
      const result = await this.client.getMultipleASNTrends(asns, options);
      
      let response = `📊 Multiple ASN Trend Analysis\n\n`;
      response += `**ASNs:** ${asns.join(', ')}\n`;
      response += `**IP Version:** ${result.ip_version || 'unknown'}\n`;
      
      if (result.date_range) {
        response += `**Date Range:** ${result.date_range.start || 'N/A'} to ${result.date_range.end || 'N/A'}\n`;
      }
      
      // Show limit information
      if (limit === 0) {
        response += `**Showing:** All available data points per ASN\n\n`;
      } else {
        response += `**Showing:** Up to ${limit} most recent data points per ASN\n`;
        response += `*Use limit=0 to see all data*\n\n`;
      }
      
      const trendData = result.trend_data || {};
      
      for (const [asnStr, dataPoints] of Object.entries(trendData)) {
        const asn = parseInt(asnStr);
        response += `**ASN ${asn}:**\n`;
        
        if (dataPoints && dataPoints.length > 0) {
          response += `- Total data points: ${dataPoints.length}\n`;
          
          // Determine how many points to display
          let displayData;
          if (limit === 0) {
            displayData = dataPoints;
          } else {
            displayData = dataPoints.slice(-limit);
          }
          
          if (displayData.length > 1) {
            response += `- Showing recent ${displayData.length} points:\n`;
            for (const point of displayData) {
              const date = point.date || 'N/A';
              const shellIdx = point.shell_index || 0;
              const maxShell = point.max_shell_index || 0;
              const normalized = point.normalized_shell_index || 0.0;
              
              response += `  - ${date}: Shell ${shellIdx}/${maxShell} (normalized: ${normalized.toFixed(3)})\n`;
            }
          } else if (displayData.length === 1) {
            const latest = displayData[0];
            const date = latest.date || 'N/A';
            const shellIdx = latest.shell_index || 0;
            const maxShell = latest.max_shell_index || 0;
            const normalized = latest.normalized_shell_index || 0.0;
            
            response += `- Latest (${date}): Shell ${shellIdx}/${maxShell} (normalized: ${normalized.toFixed(3)})\n`;
          }
          
          response += '\n';
        } else {
          response += '- No data available\n\n';
        }
      }
      
      return response;
      
    } catch (error) {
      return `❌ Multiple ASN trend analysis failed: ${error.message}`;
    }
  }

  /**
   * Snapshots Tool
   */
  async snapshots(params) {
    try {
      const { ip_version } = params;
      
      const result = await this.client.getSnapshots(ip_version);
      
      let response = '📷 Network Snapshots\n\n';
      
      for (const [ipVersion, snapshots] of Object.entries(result)) {
        const emoji = ipVersion === 'ipv4' ? '🌐' : '🌍';
        response += `**${ipVersion.toUpperCase()} ${emoji}:**\n`;
        
        if (snapshots && snapshots.length > 0) {
          response += `- Total snapshots: ${snapshots.length}\n`;
          
          const latest = snapshots[snapshots.length - 1];
          response += `- Latest: ${latest.date || 'N/A'}\n`;
          response += `- Max shell index: ${latest.max_shell_index || 0}\n`;
          response += `- Unique ASNs: ${(latest.unique_asns || 0).toLocaleString()}\n`;
          
          if (snapshots.length > 1) {
            const oldest = snapshots[0];
            response += `- Oldest: ${oldest.date || 'N/A'}\n`;
          }
        } else {
          response += '- No snapshots available\n';
        }
        
        response += '\n';
      }
      
      return response;
      
    } catch (error) {
      return `❌ Snapshots query failed: ${error.message}`;
    }
  }

  /**
   * Refresh Data Tool
   */
  async refreshData(params) {
    try {
      const { ip_versions = ['ipv4', 'ipv6'] } = params;
      
      const result = await this.client.refreshData(ip_versions);
      
      let response = '🔄 Data Refresh Results\n\n';
      
      for (const [ipVersion, refreshResult] of Object.entries(result)) {
        const emoji = ipVersion === 'ipv4' ? '🌐' : '🌍';
        response += `**${ipVersion.toUpperCase()} ${emoji}:**\n`;
        
        if (refreshResult.success) {
          response += '✅ Refresh completed successfully\n';
          const processed = refreshResult.processed_dates || [];
          if (processed.length > 0) {
            response += `- Processed dates: ${processed.join(', ')}\n`;
          }
        } else {
          response += '❌ Refresh failed\n';
          const error = refreshResult.error || 'Unknown error';
          response += `- Error: ${error}\n`;
        }
        
        response += '\n';
      }
      
      return response;
      
    } catch (error) {
      return `❌ Data refresh failed: ${error.message}`;
    }
  }

  /**
   * Scheduler Status Tool
   */
  async schedulerStatus(params) {
    try {
      const result = await this.client.getSchedulerStatus();
      
      const runningEmoji = result.running ? '🟢' : '🔴';
      const enabledEmoji = result.enabled ? '✅' : '❌';
      
      let response = `⏰ Scheduler Status ${runningEmoji}\n\n`;
      response += `**Running:** ${result.running || false} ${runningEmoji}\n`;
      response += `**Enabled:** ${result.enabled || false} ${enabledEmoji}\n`;
      response += `**Schedule:** ${result.schedule || 'N/A'}\n`;
      
      if (result.next_run) {
        response += `**Next Run:** ${result.next_run}\n`;
      } else {
        response += '**Next Run:** Not scheduled\n';
      }
      
      return response;
      
    } catch (error) {
      return `❌ Scheduler status query failed: ${error.message}`;
    }
  }

  /**
   * Trigger Update Tool
   */
  async triggerUpdate(params) {
    try {
      const result = await this.client.triggerUpdate();
      
      let response = '🚀 Manual Update Triggered\n\n';
      response += `**Triggered:** ${result.triggered || false}\n`;
      response += `**Timestamp:** ${result.timestamp || 'N/A'}\n\n`;
      
      const updateResults = result.results || {};
      if (Object.keys(updateResults).length > 0) {
        response += '**Update Results:**\n';
        for (const [ipVersion, updateResult] of Object.entries(updateResults)) {
          const emoji = ipVersion === 'ipv4' ? '🌐' : '🌍';
          response += `- ${ipVersion.toUpperCase()} ${emoji}: `;
          
          if (updateResult.success) {
            response += '✅ Success\n';
          } else {
            response += '❌ Failed\n';
          }
        }
      }
      
      return response;
      
    } catch (error) {
      return `❌ Manual update trigger failed: ${error.message}`;
    }
  }
}

module.exports = NetCoresTools;
/**
 * NetCores API Client for Node.js
 * Communicates with NetCores HTTP API endpoints
 */

const axios = require('axios');

class NetCoresAPIClient {
  constructor(baseUrl = 'https://netcores.fi.uba.ar', options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Create axios instance with default config
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'netcores-mcp/1.0.0'
      }
    });
    
    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || error.response.data?.error || error.message;
          throw new Error(`NetCores API Error (${error.response.status}): ${errorMessage}`);
        } else if (error.request) {
          // Request made but no response received
          throw new Error(`NetCores API Connection Error: ${error.message}`);
        } else {
          // Something else happened
          throw new Error(`NetCores API Error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(method, endpoint, options = {}) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.axios.request({
          method,
          url: endpoint,
          ...options
        });
        return response.data;
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return this.makeRequest('GET', '/api/health');
  }

  /**
   * Get data summary
   */
  async getDataSummary() {
    return this.makeRequest('GET', '/api/summary');
  }

  /**
   * Get ASN trend data
   */
  async getASNTrend(asn, options = {}) {
    const params = new URLSearchParams();
    if (options.ipVersion) params.append('ip_version', options.ipVersion);
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);
    
    const queryString = params.toString();
    const url = `/api/trends/${asn}${queryString ? '?' + queryString : ''}`;
    
    return this.makeRequest('GET', url);
  }

  /**
   * Get multiple ASN trends
   */
  async getMultipleASNTrends(asns, options = {}) {
    const data = {
      asns: asns,
      ip_version: options.ipVersion || 'ipv4'
    };
    
    if (options.startDate) data.start_date = options.startDate;
    if (options.endDate) data.end_date = options.endDate;
    
    return this.makeRequest('POST', '/api/trends', { data });
  }

  /**
   * Get snapshots
   */
  async getSnapshots(ipVersion = null) {
    const params = new URLSearchParams();
    if (ipVersion) params.append('ip_version', ipVersion);
    
    const queryString = params.toString();
    const url = `/api/snapshots${queryString ? '?' + queryString : ''}`;
    
    return this.makeRequest('GET', url);
  }

  /**
   * Refresh data
   */
  async refreshData(ipVersions = ['ipv4', 'ipv6']) {
    return this.makeRequest('POST', '/api/refresh', {
      data: { ip_versions: ipVersions }
    });
  }

  /**
   * Get scheduler status
   */
  async getSchedulerStatus() {
    return this.makeRequest('GET', '/api/scheduler/status');
  }

  /**
   * Trigger manual update
   */
  async triggerUpdate() {
    return this.makeRequest('POST', '/api/scheduler/update');
  }

  /**
   * Test connection to NetCores API
   */
  async testConnection() {
    try {
      const health = await this.healthCheck();
      return {
        success: true,
        status: health.status,
        version: health.version,
        dataStatus: health.data_status,
        baseUrl: this.baseUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        baseUrl: this.baseUrl
      };
    }
  }
}

module.exports = NetCoresAPIClient;
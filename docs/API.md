# NetCores MCP API Documentation

## Overview

NetCores MCP provides 8 tools for network analysis through the Model Context Protocol. Each tool communicates with the NetCores REST API to retrieve AS (Autonomous System) relationship data and k-core decomposition analysis.

## Tool Reference

### 1. Health Check (`netcores_health_check`)

**Description**: Check the health and status of the NetCores system

**Parameters**: None

**Returns**: System status, version, data availability, and database health

**Example Usage**:
```javascript
{
  "name": "netcores_health_check",
  "arguments": {}
}
```

### 2. Data Summary (`netcores_data_summary`)

**Description**: Get summary of available network data across IP versions

**Parameters**: None

**Returns**: Overview of IPv4/IPv6 datasets, snapshot counts, date ranges, ASN counts

**Example Usage**:
```javascript
{
  "name": "netcores_data_summary",
  "arguments": {}
}
```

### 3. ASN Trend Analysis (`netcores_asn_trend`)

**Description**: Analyze k-core shell index trends for a specific ASN over time

**Parameters**:
- `asn` (integer, required): ASN number to analyze
- `ip_version` (string, optional): "ipv4" or "ipv6" (default: "ipv4")
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format

**Returns**: Trend data showing k-core shell indices over time

**Example Usage**:
```javascript
{
  "name": "netcores_asn_trend",
  "arguments": {
    "asn": 15169,
    "ip_version": "ipv4",
    "start_date": "2023-01-01",
    "end_date": "2024-01-01"
  }
}
```

### 4. Multiple ASN Trends (`netcores_multiple_asn_trends`)

**Description**: Compare k-core shell index trends for multiple ASNs over time

**Parameters**:
- `asns` (array, required): List of ASN numbers (1-10 ASNs)
- `ip_version` (string, optional): "ipv4" or "ipv6" (default: "ipv4")
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format

**Returns**: Comparative trend data for multiple ASNs

**Example Usage**:
```javascript
{
  "name": "netcores_multiple_asn_trends",
  "arguments": {
    "asns": [15169, 32934, 13335],
    "ip_version": "ipv4"
  }
}
```

### 5. Network Snapshots (`netcores_snapshots`)

**Description**: Get information about available network snapshots

**Parameters**:
- `ip_version` (string, optional): Filter by "ipv4" or "ipv6"

**Returns**: List of available CAIDA AS-relationship snapshots with metadata

**Example Usage**:
```javascript
{
  "name": "netcores_snapshots",
  "arguments": {
    "ip_version": "ipv4"
  }
}
```

### 6. Data Refresh (`netcores_refresh_data`)

**Description**: Trigger data refresh from CAIDA sources

**Parameters**:
- `ip_versions` (array, optional): IP versions to refresh (default: ["ipv4", "ipv6"])

**Returns**: Refresh status and results for each IP version

**Example Usage**:
```javascript
{
  "name": "netcores_refresh_data",
  "arguments": {
    "ip_versions": ["ipv4", "ipv6"]
  }
}
```

### 7. Scheduler Status (`netcores_scheduler_status`)

**Description**: Check the status of the automatic data update scheduler

**Parameters**: None

**Returns**: Scheduler running status, schedule, and next run time

**Example Usage**:
```javascript
{
  "name": "netcores_scheduler_status",
  "arguments": {}
}
```

### 8. Manual Update Trigger (`netcores_trigger_update`)

**Description**: Manually trigger a scheduled data update check

**Parameters**: None

**Returns**: Update trigger status and results

**Example Usage**:
```javascript
{
  "name": "netcores_trigger_update",
  "arguments": {}
}
```

## API Endpoints

NetCores MCP communicates with these REST API endpoints:

- `GET /api/health` - System health check
- `GET /api/summary` - Data availability summary
- `GET /api/trends/{asn}` - ASN trend analysis
- `POST /api/trends` - Multiple ASN trends
- `GET /api/snapshots` - Network snapshots
- `POST /api/refresh` - Data refresh
- `GET /api/scheduler/status` - Scheduler status
- `POST /api/scheduler/update` - Manual update trigger

## Configuration

### API Server

**Default**: `https://netcores.fi.uba.ar`

### Environment Variables

- `NETCORES_API_URL`: Override default API URL

### Error Handling

All tools include comprehensive error handling:
- Network connectivity issues
- API server errors
- Invalid parameters
- Timeout handling
- Retry logic with exponential backoff

## Data Sources

- **IPv4 Data**: CAIDA AS-relationships since 1998
- **IPv6 Data**: CAIDA AS-relationships since 2014
- **Update Frequency**: Monthly snapshots (1st of each month)
- **Processing**: k-core decomposition analysis using NetworkX

## Schema Validation

All tools use JSON Schema for parameter validation:
- Required vs optional parameters
- Type checking (integer, string, array)
- Format validation (date patterns)
- Enum constraints (IP versions)
- Array size limits (ASN lists)
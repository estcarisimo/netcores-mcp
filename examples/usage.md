# NetCores MCP Usage Examples

This document provides example conversations and use cases for NetCores MCP tools in Claude Desktop.

## Basic System Information

### Check System Health

**User:** "Check the health of the NetCores system"

**Expected Output:**
```
🏥 NetCores Health Check ✅

**System Status:** healthy
**Version:** 1.0.0
**Data Status:** available 📊

**Database Health:**
- Status: healthy
- Connection: active
- Tables: 3
```

### Get Data Summary

**User:** "What data is available in NetCores?"

**Expected Output:**
```
📊 NetCores Data Summary

**IPv4 🌐:**
- Snapshots: 312
- Date Range: 1998-01-01 to 2024-10-01
- Total ASNs: 95,432
- Max Shell Index: 47

**IPv6 🌍:**
- Snapshots: 128
- Date Range: 2014-01-01 to 2024-10-01
- Total ASNs: 45,123
- Max Shell Index: 32
```

## ASN Analysis

### Single ASN Analysis

**User:** "Analyze the k-core trends for Google's ASN 15169"

**Expected Output:**
```
📈 ASN 15169 Trend Analysis

**IP Version:** ipv4
**Date Range:** 1998-01-01 to 2024-10-01
**Data Points:** 312

**Recent Trend (last 5 points):**
- 2024-06-01: Shell 45/47 (normalized: 0.957)
- 2024-07-01: Shell 45/47 (normalized: 0.957)
- 2024-08-01: Shell 46/47 (normalized: 0.979)
- 2024-09-01: Shell 46/47 (normalized: 0.979)
- 2024-10-01: Shell 47/47 (normalized: 1.000)
```

### Multiple ASN Comparison

**User:** "Compare network centrality between Google (AS15169), Meta (AS32934), and Cloudflare (AS13335)"

**Expected Output:**
```
📊 Multiple ASN Trend Analysis

**ASNs:** 15169, 32934, 13335
**IP Version:** ipv4
**Date Range:** 1998-01-01 to 2024-10-01

**ASN 15169:**
- Latest (2024-10-01): Shell 47/47 (normalized: 1.000)
- Data points: 312

**ASN 32934:**
- Latest (2024-10-01): Shell 44/47 (normalized: 0.936)
- Data points: 298

**ASN 13335:**
- Latest (2024-10-01): Shell 42/47 (normalized: 0.894)
- Data points: 267
```

## Research Questions

### Top-Tier ASN Discovery

**User:** "What are the most central ASNs in the current Internet topology?"

This would typically involve:
1. Getting the latest snapshot data
2. Analyzing shell indices to find highest values
3. Identifying ASNs with maximum k-core values

### Historical Trend Analysis

**User:** "How has the Internet's hierarchical structure changed over the past 10 years?"

This could involve:
1. Comparing shell index distributions across time periods
2. Analyzing growth in maximum shell indices
3. Tracking changes in ASN centrality rankings

### Regional Analysis

**User:** "Compare the network centrality of major CDN providers: Cloudflare (AS13335), Fastly (AS54113), and KeyCDN (AS60068)"

### Academic Research Support

**User:** "I'm researching Internet topology evolution. Can you analyze the k-core trends for major transit providers: Level3 (AS3356), Cogent (AS174), and NTT (AS2914) from 2010 to 2020?"

This would involve:
1. Setting date ranges for the analysis
2. Comparing trends across multiple major transit ASNs
3. Identifying patterns in network infrastructure evolution

## Data Management

### Check Available Snapshots

**User:** "What network snapshots are available?"

**Expected Output:**
```
📷 Network Snapshots

**IPv4 🌐:**
- Total snapshots: 312
- Latest: 2024-10-01
- Max shell index: 47
- Unique ASNs: 95,432
- Oldest: 1998-01-01

**IPv6 🌍:**
- Total snapshots: 128
- Latest: 2024-10-01
- Max shell index: 32
- Unique ASNs: 45,123
- Oldest: 2014-01-01
```

### Trigger Data Updates

**User:** "Please refresh the NetCores data from CAIDA"

**Expected Output:**
```
🔄 Data Refresh Results

**IPv4 🌐:**
✅ Refresh completed successfully
- Processed dates: 2024-10-01

**IPv6 🌍:**
✅ Refresh completed successfully
- Processed dates: 2024-10-01
```

## Advanced Usage

### Date Range Analysis

**User:** "Analyze Google's ASN 15169 trends during the COVID-19 period from 2020-01-01 to 2022-12-31"

### IPv6 Specific Analysis

**User:** "Show me IPv6 network centrality trends for Cloudflare AS13335"

### Scheduler Management

**User:** "What's the status of the automatic data update scheduler?"

**Expected Output:**
```
⏰ Scheduler Status 🟢

**Running:** true 🟢
**Enabled:** true ✅
**Schedule:** 0 0 6 * *
**Next Run:** 2024-11-06 06:00:00 UTC
```

## Tips for Effective Usage

1. **Be Specific**: Include ASN numbers when known (e.g., "AS15169" or "15169")
2. **Use Date Ranges**: Specify time periods for focused analysis
3. **Compare Related ASNs**: Group similar organizations or service types
4. **Ask Follow-up Questions**: Build on initial results for deeper insights
5. **Combine Tools**: Use health checks before analysis, refresh data when needed

## Common ASNs for Testing

- **Google**: AS15169
- **Meta/Facebook**: AS32934
- **Cloudflare**: AS13335
- **Amazon**: AS16509
- **Microsoft**: AS8075
- **Apple**: AS714
- **Netflix**: AS2906
- **Level3**: AS3356
- **Cogent**: AS174
- **NTT**: AS2914
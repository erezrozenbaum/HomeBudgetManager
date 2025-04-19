const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      databaseQueries: [],
      memoryUsage: [],
      cpuUsage: []
    };
    this.logFile = path.join(__dirname, '../../logs/performance.log');
  }

  startTimer(label) {
    return performance.now();
  }

  endTimer(startTime, label) {
    const duration = performance.now() - startTime;
    this.metrics[label].push({
      timestamp: new Date().toISOString(),
      duration
    });
    return duration;
  }

  logAPICall(method, endpoint, duration) {
    this.metrics.apiCalls.push({
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      duration
    });
  }

  logDatabaseQuery(query, duration) {
    this.metrics.databaseQueries.push({
      timestamp: new Date().toISOString(),
      query,
      duration
    });
  }

  logMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: new Date().toISOString(),
      ...memoryUsage
    });
  }

  logCPUUsage() {
    const cpuUsage = process.cpuUsage();
    this.metrics.cpuUsage.push({
      timestamp: new Date().toISOString(),
      ...cpuUsage
    });
  }

  getMetrics() {
    return this.metrics;
  }

  saveMetrics() {
    const metrics = this.getMetrics();
    fs.appendFileSync(this.logFile, JSON.stringify(metrics) + '\n');
  }

  clearMetrics() {
    this.metrics = {
      apiCalls: [],
      databaseQueries: [],
      memoryUsage: [],
      cpuUsage: []
    };
  }

  getPerformanceReport() {
    const report = {
      averageAPICallDuration: this.calculateAverage(this.metrics.apiCalls, 'duration'),
      averageQueryDuration: this.calculateAverage(this.metrics.databaseQueries, 'duration'),
      memoryUsageTrend: this.calculateTrend(this.metrics.memoryUsage, 'heapUsed'),
      cpuUsageTrend: this.calculateTrend(this.metrics.cpuUsage, 'user')
    };
    return report;
  }

  calculateAverage(metrics, field) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, curr) => acc + curr[field], 0);
    return sum / metrics.length;
  }

  calculateTrend(metrics, field) {
    if (metrics.length < 2) return 'insufficient data';
    const first = metrics[0][field];
    const last = metrics[metrics.length - 1][field];
    return last > first ? 'increasing' : last < first ? 'decreasing' : 'stable';
  }
}

module.exports = new PerformanceMonitor(); 
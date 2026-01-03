// vite-health-endpoints.js
// API endpoints for health checks and monitoring in Vite

const os = require('os');

const SERVER_START_TIME = Date.now();

/**
 * Setup health check endpoints on the Vite dev server
 * @param {Object} config - Vite config object
 * @param {Object} healthPlugin - Instance of ViteHealthPlugin
 */
function setupViteHealthEndpoints(config, healthPlugin) {
  if (!healthPlugin) {
    console.warn('[Health Check] Health plugin not provided, skipping health endpoints');
    return;
  }

  console.log('[Health Check] Setting up health endpoints for Vite...');

  // Store the health plugin instance for access in middleware
  config.server = config.server || {};
  config.server.configureServer = config.server.configureServer || [];

  const originalConfigureServer = config.server.configureServer;

  config.server.configureServer = (server) => {
    // Call original configureServer if it exists
    if (typeof originalConfigureServer === 'function') {
      originalConfigureServer(server);
    }

    // Setup health endpoints
    setupHealthEndpoints(server, healthPlugin);
  };
}

/**
 * Setup health check endpoints on the server
 * @param {Object} server - Vite dev server instance
 * @param {Object} healthPlugin - Instance of ViteHealthPlugin
 */
function setupHealthEndpoints(server, healthPlugin) {
  // ====================================================================
  // GET /health - Detailed health status (JSON)
  // ====================================================================
  server.middlewares.use("/health", (req, res) => {
    const viteStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;
    const memUsage = process.memoryUsage();

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: viteStatus.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime / 1000),
        formatted: formatDuration(uptime),
      },
      vite: {
        state: viteStatus.state,
        isHealthy: viteStatus.isHealthy,
        hasBuilt: viteStatus.hasBuilt,
        errors: viteStatus.errorCount,
        warnings: viteStatus.warningCount,
        lastBuildTime: viteStatus.lastBuildTime
          ? new Date(viteStatus.lastBuildTime).toISOString()
          : null,
        lastSuccessTime: viteStatus.lastSuccessTime
          ? new Date(viteStatus.lastSuccessTime).toISOString()
          : null,
        buildDuration: viteStatus.buildDuration
          ? `${viteStatus.buildDuration}ms`
          : null,
        totalBuilds: viteStatus.totalBuilds,
        firstBuildTime: viteStatus.firstBuildTime
          ? new Date(viteStatus.firstBuildTime).toISOString()
          : null,
      },
      server: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal),
          rss: formatBytes(memUsage.rss),
          external: formatBytes(memUsage.external),
        },
        systemMemory: {
          total: formatBytes(os.totalmem()),
          free: formatBytes(os.freemem()),
          used: formatBytes(os.totalmem() - os.freemem()),
        },
      },
      environment: process.env.NODE_ENV || 'development',
    }));
  });

  // ====================================================================
  // GET /health/simple - Simple text response (OK/BUILDING/ERROR)
  // ====================================================================
  server.middlewares.use("/health/simple", (req, res) => {
    const viteStatus = healthPlugin.getSimpleStatus();

    if (viteStatus.state === 'success') {
      res.statusCode = 200;
      res.end('OK');
    } else if (viteStatus.state === 'building') {
      res.statusCode = 200;
      res.end('BUILDING');
    } else if (viteStatus.state === 'idle') {
      res.statusCode = 200;
      res.end('IDLE');
    } else {
      res.statusCode = 503;
      res.end('ERROR');
    }
  });

  // ====================================================================
  // GET /health/ready - Readiness check (Kubernetes/load balancer)
  // ====================================================================
  server.middlewares.use("/health/ready", (req, res) => {
    const viteStatus = healthPlugin.getSimpleStatus();

    res.setHeader('Content-Type', 'application/json');
    if (viteStatus.state === 'success') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        ready: true,
        state: viteStatus.state,
      }));
    } else {
      res.statusCode = 503;
      res.end(JSON.stringify({
        ready: false,
        state: viteStatus.state,
        reason: viteStatus.state === 'building'
          ? 'Build in progress'
          : 'Build failed',
      }));
    }
  });

  // ====================================================================
  // GET /health/live - Liveness check (Kubernetes)
  // ====================================================================
  server.middlewares.use("/health/live", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      alive: true,
      timestamp: new Date().toISOString(),
    }));
  });

  // ====================================================================
  // GET /health/errors - Get current errors and warnings
  // ====================================================================
  server.middlewares.use("/health/errors", (req, res) => {
    const viteStatus = healthPlugin.getStatus();

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errorCount: viteStatus.errorCount,
      warningCount: viteStatus.warningCount,
      errors: viteStatus.errors,
      warnings: viteStatus.warnings,
      state: viteStatus.state,
    }));
  });

  // ====================================================================
  // GET /health/stats - Build statistics
  // ====================================================================
  server.middlewares.use("/health/stats", (req, res) => {
    const viteStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      totalBuilds: viteStatus.totalBuilds,
      averageBuildTime: viteStatus.totalBuilds > 0
        ? `${Math.round(uptime / viteStatus.totalBuilds)}ms`
        : null,
      lastBuildDuration: viteStatus.buildDuration
        ? `${viteStatus.buildDuration}ms`
        : null,
      firstBuildTime: viteStatus.firstBuildTime
        ? new Date(viteStatus.firstBuildTime).toISOString()
        : null,
      serverUptime: formatDuration(uptime),
    }));
  });

  console.log('[Health Check] ✓ Health endpoints ready:');
  console.log('  • GET /health         - Detailed status');
  console.log('  • GET /health/simple  - Simple OK/ERROR');
  console.log('  • GET /health/ready   - Readiness check');
  console.log('  • GET /health/live    - Liveness check');
  console.log('  • GET /health/errors  - Error details');
  console.log('  • GET /health/stats   - Statistics');
}

// ====================================================================
// Helper Functions
// ====================================================================

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = setupViteHealthEndpoints;
// vite-health-plugin.js
// Vite plugin that tracks build state and health metrics

class ViteHealthPlugin {
  constructor() {
    this.status = {
      state: 'idle',           // idle, building, success, failed
      errors: [],
      warnings: [],
      lastBuildTime: null,
      lastSuccessTime: null,
      buildDuration: 0,
      totalBuilds: 0,
      firstBuildTime: null,
    };
  }

  getStatus() {
    return {
      ...this.status,
      // Add computed fields
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
      hasBuilt: this.status.totalBuilds > 0,
    };
  }

  // Get simplified status for quick checks
  getSimpleStatus() {
    return {
      state: this.status.state,
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
    };
  }

  // Reset statistics (useful for testing)
  reset() {
    this.status = {
      state: 'idle',
      errors: [],
      warnings: [],
      lastBuildTime: null,
      lastSuccessTime: null,
      buildDuration: 0,
      totalBuilds: 0,
      firstBuildTime: null,
    };
  }
}

function viteHealthPlugin() {
  const healthTracker = new ViteHealthPlugin();

  return {
    name: 'vite-health-plugin',
    buildStart() {
      const now = Date.now();
      healthTracker.status.state = 'building';
      healthTracker.status.lastBuildTime = now;

      if (!healthTracker.status.firstBuildTime) {
        healthTracker.status.firstBuildTime = now;
      }
    },
    buildEnd() {
      healthTracker.status.totalBuilds++;
      healthTracker.status.buildDuration = Date.now() - healthTracker.status.lastBuildTime;
      healthTracker.status.state = 'success';
      healthTracker.status.lastSuccessTime = Date.now();
      healthTracker.status.errors = [];
      healthTracker.status.warnings = [];
    },
    renderError(error) {
      healthTracker.status.state = 'failed';
      healthTracker.status.errors = [{
        message: error.message,
        stack: error.stack,
        plugin: error.plugin,
        id: error.id,
      }];
      healthTracker.status.buildDuration = Date.now() - healthTracker.status.lastBuildTime;
    },
    generateBundle(options, bundle) {
      // Check for warnings in the bundle
      const warnings = [];
      Object.values(bundle).forEach((chunk) => {
        if (chunk.warnings) {
          warnings.push(...chunk.warnings);
        }
      });
      healthTracker.status.warnings = warnings.map(w => ({
        message: w.message,
        plugin: w.plugin,
      }));
    },
    // Expose health tracker for external access
    api: healthTracker,
  };
}

module.exports = viteHealthPlugin;
# Production Monitoring

Monitor performance, errors, and user experience in production TypeScript applications.

## APM Tools

### DataDog

```typescript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.DD_APPLICATION_ID!,
  clientToken: process.env.DD_CLIENT_TOKEN!,
  site: 'datadoghq.com',
  service: 'my-app',
  env: 'production',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input'
});

// Custom metrics
datadogRum.addAction('checkout', {
  amount: 99.99,
  items: 3
});
```

### Sentry

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  release: process.env.RELEASE_VERSION,

  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});

// Performance monitoring
const transaction = Sentry.startTransaction({
  name: 'checkout-flow',
  op: 'transaction'
});

const span = transaction.startChild({
  op: 'api-call',
  description: 'Create order'
});

try {
  await createOrder(data);
  span.setStatus('ok');
} catch (error) {
  span.setStatus('internal_error');
  Sentry.captureException(error);
} finally {
  span.finish();
  transaction.finish();
}
```

---

## Custom Metrics

### Performance Metrics

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  track(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  flush(): void {
    // Send to monitoring service
    for (const [name, values] of this.metrics) {
      const stats = this.getStats(name);
      console.log(`Metric: ${name}`, stats);
    }
    this.metrics.clear();
  }
}

// Usage
const monitor = new PerformanceMonitor();

async function processData(data: any[]) {
  const start = performance.now();

  // Process data
  await process(data);

  const duration = performance.now() - start;
  monitor.track('data-processing', duration);
}
```

---

## Error Tracking

### Structured Error Logging

```typescript
interface ErrorContext {
  userId?: string;
  action: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  track(error: Error, context: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(errorData);
    } else {
      console.error('Error:', errorData);
    }
  }

  private sendToService(data: any): void {
    // Send to Sentry, DataDog, etc.
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

// Usage
const errorTracker = new ErrorTracker();

try {
  await riskyOperation();
} catch (error) {
  errorTracker.track(error as Error, {
    userId: currentUser.id,
    action: 'checkout',
    metadata: { orderId: order.id }
  });
}
```

---

## Real User Monitoring (RUM)

### Custom RUM Implementation

```typescript
class RUMCollector {
  private events: any[] = [];

  trackPageLoad(): void {
    window.addEventListener('load', () => {
      const timing = performance.timing;

      this.events.push({
        type: 'pageload',
        metrics: {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ttfb: timing.responseStart - timing.requestStart,
          download: timing.responseEnd - timing.responseStart,
          domProcessing: timing.domComplete - timing.domLoading,
          total: timing.loadEventEnd - timing.navigationStart
        }
      });

      this.flush();
    });
  }

  trackInteraction(name: string, duration: number): void {
    this.events.push({
      type: 'interaction',
      name,
      duration,
      timestamp: Date.now()
    });
  }

  trackError(error: Error): void {
    this.events.push({
      type: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  flush(): void {
    if (this.events.length === 0) return;

    navigator.sendBeacon('/api/rum', JSON.stringify(this.events));
    this.events = [];
  }
}

// Initialize
const rum = new RUMCollector();
rum.trackPageLoad();

// Track interactions
button.addEventListener('click', () => {
  const start = performance.now();

  handleClick();

  const duration = performance.now() - start;
  rum.trackInteraction('button-click', duration);
});
```

---

## Performance Budgets

### Enforce Budgets in CI

```typescript
// performance-budget.ts
export const budgets = {
  'index.js': 200 * 1024,      // 200kb
  'vendor.js': 300 * 1024,     // 300kb
  'index.css': 50 * 1024,      // 50kb
  'total': 600 * 1024          // 600kb
};

// check-budgets.ts
import { budgets } from './performance-budget';
import fs from 'fs';
import path from 'path';

function checkBudgets(distPath: string): boolean {
  let passed = true;
  let totalSize = 0;

  for (const [file, budget] of Object.entries(budgets)) {
    if (file === 'total') continue;

    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;

    totalSize += size;

    if (size > budget) {
      console.error(`❌ ${file}: ${size} bytes (budget: ${budget} bytes)`);
      passed = false;
    } else {
      console.log(`✅ ${file}: ${size} bytes (budget: ${budget} bytes)`);
    }
  }

  if (totalSize > budgets.total) {
    console.error(`❌ Total: ${totalSize} bytes (budget: ${budgets.total} bytes)`);
    passed = false;
  }

  return passed;
}

// Run in CI
if (!checkBudgets('./dist')) {
  process.exit(1);
}
```

---

## Alerting

### Performance Degradation Alerts

```typescript
interface PerformanceThreshold {
  metric: string;
  threshold: number;
  window: number; // minutes
}

const thresholds: PerformanceThreshold[] = [
  { metric: 'api-latency', threshold: 500, window: 5 },
  { metric: 'error-rate', threshold: 0.01, window: 5 },
  { metric: 'memory-usage', threshold: 0.9, window: 10 }
];

class AlertManager {
  async checkThresholds(metrics: Map<string, number>): Promise<void> {
    for (const threshold of thresholds) {
      const value = metrics.get(threshold.metric);

      if (value && value > threshold.threshold) {
        await this.sendAlert({
          severity: 'warning',
          metric: threshold.metric,
          value,
          threshold: threshold.threshold,
          message: `${threshold.metric} exceeded threshold`
        });
      }
    }
  }

  private async sendAlert(alert: any): Promise<void> {
    // Send to Slack, PagerDuty, etc.
    console.error('ALERT:', alert);

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Performance Alert: ${alert.message}`,
        attachments: [{
          fields: [
            { title: 'Metric', value: alert.metric },
            { title: 'Value', value: alert.value },
            { title: 'Threshold', value: alert.threshold }
          ]
        }]
      })
    });
  }
}
```

---

## Dashboard Example

### Metrics API

```typescript
// api/metrics.ts
import express from 'express';

const router = express.Router();

router.post('/rum', async (req, res) => {
  const events = req.body;

  // Store in database or send to monitoring service
  await storeMetrics(events);

  res.sendStatus(204);
});

router.get('/stats', async (req, res) => {
  const { start, end } = req.query;

  const stats = await getStats(
    new Date(start as string),
    new Date(end as string)
  );

  res.json(stats);
});

export default router;
```

---

## Best Practices

1. **Monitor Key Metrics**
   - Response times
   - Error rates
   - Resource usage
   - User interactions

2. **Set Up Alerts**
   - Performance degradation
   - Error rate spikes
   - Resource exhaustion

3. **Review Regularly**
   - Weekly performance reviews
   - Monthly trend analysis
   - Quarterly goal setting

4. **Act on Data**
   - Investigate anomalies
   - Fix performance regressions
   - Optimize bottlenecks

---

## Tools Comparison

| Tool | Strengths | Best For |
|------|-----------|----------|
| **DataDog** | Full-stack APM | Enterprise |
| **Sentry** | Error tracking | All apps |
| **New Relic** | Deep insights | Complex apps |
| **Lighthouse CI** | Web vitals | Web apps |
| **Custom** | Flexibility | Specific needs |

---

**Remember**: What gets measured gets managed. Monitor continuously!

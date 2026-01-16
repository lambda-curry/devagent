#!/usr/bin/env bun
/**
 * Standalone performance test script for concurrent log streaming
 * 
 * This script tests performance when multiple clients stream logs simultaneously.
 * It can be run independently for comprehensive performance analysis.
 * 
 * Usage:
 *   bun run apps/ralph-monitoring/scripts/performance-test.ts [--clients=10] [--duration=5000]
 * 
 * Options:
 *   --clients=N    Number of concurrent clients (default: 10)
 *   --duration=N   Test duration in milliseconds (default: 5000)
 *   --iterations=N Number of test iterations (default: 1)
 */

import { writeFileSync, unlinkSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { getLogFilePath } from '../app/utils/logs.server';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: string): number => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? parseInt(arg.split('=')[1] || defaultValue, 10) : parseInt(defaultValue, 10);
};

const CLIENT_COUNTS = [5, 10, 20];
const TEST_DURATION_MS = getArg('duration', '5000');
const ITERATIONS = getArg('iterations', '1');
const TEST_TASK_ID = 'perf-test-task';

interface ResourceSnapshot {
  timestamp: number;
  memory: {
    rss: number; // MB
    heapUsed: number; // MB
    heapTotal: number; // MB
    external: number; // MB
  };
  cpu: {
    user: number; // microseconds
    system: number; // microseconds
  };
  tailProcessCount: number;
  fileDescriptors?: number;
}

interface ClientResult {
  clientId: number;
  bytesReceived: number;
  eventsReceived: number;
  firstEventLatency: number; // ms
  errors: string[];
  success: boolean;
}

interface TestResult {
  clientCount: number;
  iteration: number;
  setupTime: number; // ms
  clients: ClientResult[];
  resources: {
    before: ResourceSnapshot;
    peak: ResourceSnapshot;
    after: ResourceSnapshot;
  };
  summary: {
    totalBytes: number;
    totalEvents: number;
    averageLatency: number;
    successRate: number;
    errors: string[];
  };
}

/**
 * Get current resource usage
 */
function getResourceSnapshot(): ResourceSnapshot {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: Date.now(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    tailProcessCount: 0, // Will be set separately
  };
}

/**
 * Count tail processes
 */
async function countTailProcesses(): Promise<number> {
  return new Promise((resolve) => {
    try {
      const result = spawn('ps', ['-A', '-o', 'comm'], { stdio: ['pipe', 'pipe', 'pipe'] });
      let output = '';
      result.stdout?.on('data', (chunk) => {
        output += chunk.toString();
      });
      result.on('close', () => {
        const count = (output.match(/^tail$/gm) || []).length;
        resolve(count);
      });
      result.on('error', () => resolve(0));
    } catch {
      resolve(0);
    }
  });
}

/**
 * Get file descriptor count (Unix only)
 */
async function getFileDescriptorCount(): Promise<number | undefined> {
  try {
    const pid = process.pid;
    // This is Linux-specific, on macOS we can't easily get this
    // For now, return undefined
    void pid; // Suppress unused variable warning
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Create test log file
 */
function createTestLogFile(taskId: string, initialLines: number = 10): string {
  const logPath = getLogFilePath(taskId);
  const logDir = join(logPath, '..');
  
  // Ensure directory exists
  try {
    mkdirSync(logDir, { recursive: true });
  } catch {
    // Directory might already exist
  }
  
  const lines: string[] = [];
  for (let i = 0; i < initialLines; i++) {
    lines.push(`[${new Date().toISOString()}] Initial log line ${i + 1}`);
  }
  
  writeFileSync(logPath, `${lines.join('\n')}\n`, 'utf-8');
  return logPath;
}

/**
 * Continuously write to log file
 */
function startLogWriter(logPath: string, intervalMs: number = 50): () => void {
  let lineCount = 0;
  let intervalId: NodeJS.Timeout | null = null;
  
  const writeInterval = () => {
    lineCount++;
    const line = `[${new Date().toISOString()}] Streaming log line ${lineCount}\n`;
    try {
      appendFileSync(logPath, line, 'utf-8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  };
  
  intervalId = setInterval(writeInterval, intervalMs);
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

/**
 * Connect to SSE stream
 */
async function connectToStream(
  taskId: string,
  clientId: number,
  durationMs: number
): Promise<ClientResult> {
  // Import loader dynamically to avoid issues
  const { loader } = await import('../app/routes/api.logs.$taskId.stream');
  
  const request = new Request(`http://localhost/api/logs/${taskId}/stream`);
  const response = await loader({ params: { taskId }, request });
  
  if (!response.ok) {
    const errorText = await response.text();
    return {
      clientId,
      bytesReceived: 0,
      eventsReceived: 0,
      firstEventLatency: 0,
      errors: [`Failed to connect: ${response.status} ${errorText}`],
      success: false,
    };
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    return {
      clientId,
      bytesReceived: 0,
      eventsReceived: 0,
      firstEventLatency: 0,
      errors: ['No response body reader'],
      success: false,
    };
  }
  
  const decoder = new TextDecoder();
  let bytesReceived = 0;
  let eventsReceived = 0;
  let firstEventTime: number | null = null;
  const errors: string[] = [];
  const startTime = Date.now();
  
  try {
    while (Date.now() - startTime < durationMs) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }
      
      if (value) {
        bytesReceived += value.length;
        const text = decoder.decode(value, { stream: true });
        
        // Count SSE events
        const eventMatches = text.match(/^(data|event):/gm);
        if (eventMatches) {
          eventsReceived += eventMatches.length;
          if (firstEventTime === null) {
            firstEventTime = Date.now();
          }
        }
        
        // Check for errors
        if (text.includes('event: error')) {
          const errorMatch = text.match(/data: ({[^}]+})/);
          if (errorMatch) {
            try {
              const errorData = JSON.parse(errorMatch[1]);
              errors.push(errorData.error || 'Unknown error');
            } catch {
              errors.push('Error parsing error event');
            }
          }
        }
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    try {
      reader.cancel();
    } catch {
      // Ignore
    }
  }
  
  return {
    clientId,
    bytesReceived,
    eventsReceived,
    firstEventLatency: firstEventTime ? firstEventTime - startTime : 0,
    errors,
    success: errors.length === 0,
  };
}

/**
 * Run performance test
 */
async function runTest(clientCount: number, iteration: number): Promise<TestResult> {
  const logPath = createTestLogFile(TEST_TASK_ID, 10);
  const stopLogWriter = startLogWriter(logPath, 50);
  
  try {
    // Before snapshot
    const beforeSnapshot = getResourceSnapshot();
    beforeSnapshot.tailProcessCount = await countTailProcesses();
    beforeSnapshot.fileDescriptors = await getFileDescriptorCount();
    
    const setupStart = Date.now();
    
    // Start all connections
    const connections = Array.from({ length: clientCount }, (_, i) =>
      connectToStream(TEST_TASK_ID, i + 1, TEST_DURATION_MS)
    );
    
    const setupTime = Date.now() - setupStart;
    
    // Monitor resources during test
    const resourceSnapshots: ResourceSnapshot[] = [beforeSnapshot];
    const monitorInterval = setInterval(async () => {
      const snapshot = getResourceSnapshot();
      snapshot.tailProcessCount = await countTailProcesses();
      snapshot.fileDescriptors = await getFileDescriptorCount();
      resourceSnapshots.push(snapshot);
    }, 500);
    
    // Wait for all connections
    const clientResults = await Promise.all(connections);
    
    clearInterval(monitorInterval);
    
    // Find peak resource usage
    const peakSnapshot = resourceSnapshots.reduce((peak, current) => {
      if (current.memory.rss > peak.memory.rss) {
        return current;
      }
      return peak;
    }, beforeSnapshot);
    
    // After snapshot
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for cleanup
    const afterSnapshot = getResourceSnapshot();
    afterSnapshot.tailProcessCount = await countTailProcesses();
    afterSnapshot.fileDescriptors = await getFileDescriptorCount();
    
    // Calculate summary
    const totalBytes = clientResults.reduce((sum, r) => sum + r.bytesReceived, 0);
    const totalEvents = clientResults.reduce((sum, r) => sum + r.eventsReceived, 0);
    const successfulClients = clientResults.filter((r) => r.success).length;
    const allErrors = clientResults.flatMap((r) => r.errors);
    const latencies = clientResults
      .filter((r) => r.firstEventLatency > 0)
      .map((r) => r.firstEventLatency);
    const averageLatency =
      latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    
    return {
      clientCount,
      iteration,
      setupTime,
      clients: clientResults,
      resources: {
        before: beforeSnapshot,
        peak: peakSnapshot,
        after: afterSnapshot,
      },
      summary: {
        totalBytes,
        totalEvents,
        averageLatency,
        successRate: (successfulClients / clientCount) * 100,
        errors: allErrors,
      },
    };
  } finally {
    stopLogWriter();
    try {
      if (existsSync(logPath)) {
        unlinkSync(logPath);
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Format and print results
 */
function printResults(results: TestResult[]): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log('PERFORMANCE TEST RESULTS');
  console.log(`${'='.repeat(80)}\n`);
  
  for (const result of results) {
    console.log(`Test: ${result.clientCount} concurrent clients (iteration ${result.iteration})`);
    console.log('-'.repeat(80));
    console.log(`Setup Time:        ${result.setupTime}ms`);
    console.log(`Success Rate:      ${result.summary.successRate.toFixed(1)}%`);
    console.log(`Total Bytes:       ${result.summary.totalBytes.toLocaleString()}`);
    console.log(`Total Events:       ${result.summary.totalEvents.toLocaleString()}`);
    console.log(`Avg Latency:       ${result.summary.averageLatency.toFixed(2)}ms`);
    console.log('');
    console.log('Resource Usage:');
    console.log(`  Memory (RSS):    ${result.resources.before.memory.rss}MB → ${result.resources.peak.memory.rss}MB → ${result.resources.after.memory.rss}MB`);
    console.log(`  Heap Used:       ${result.resources.before.memory.heapUsed}MB → ${result.resources.peak.memory.heapUsed}MB → ${result.resources.after.memory.heapUsed}MB`);
    console.log(`  Tail Processes:  ${result.resources.before.tailProcessCount} → ${result.resources.peak.tailProcessCount} → ${result.resources.after.tailProcessCount}`);
    if (result.summary.errors.length > 0) {
      console.log(`  Errors:          ${result.summary.errors.length}`);
      result.summary.errors.slice(0, 5).forEach((err) => {
        console.log(`    - ${err}`);
      });
      if (result.summary.errors.length > 5) {
        console.log(`    ... and ${result.summary.errors.length - 5} more`);
      }
    }
    console.log('');
  }
  
  // Summary statistics
  console.log('='.repeat(80));
  console.log('SUMMARY STATISTICS');
  console.log(`${'='.repeat(80)}\n`);
  
  const byClientCount = new Map<number, TestResult[]>();
  for (const result of results) {
    const existing = byClientCount.get(result.clientCount) || [];
    existing.push(result);
    byClientCount.set(result.clientCount, existing);
  }
  
  for (const [clientCount, testResults] of byClientCount.entries()) {
    const avgSuccessRate =
      testResults.reduce((sum, r) => sum + r.summary.successRate, 0) / testResults.length;
    const avgPeakMemory =
      testResults.reduce((sum, r) => sum + r.resources.peak.memory.rss, 0) / testResults.length;
    const avgPeakProcesses =
      testResults.reduce((sum, r) => sum + r.resources.peak.tailProcessCount, 0) /
      testResults.length;
    
    console.log(`${clientCount} clients:`);
    console.log(`  Avg Success Rate: ${avgSuccessRate.toFixed(1)}%`);
    console.log(`  Avg Peak Memory:  ${avgPeakMemory.toFixed(1)}MB`);
    console.log(`  Avg Peak Processes: ${avgPeakProcesses.toFixed(1)}`);
    console.log('');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Starting performance tests...');
  console.log(`Duration: ${TEST_DURATION_MS}ms per test`);
  console.log(`Iterations: ${ITERATIONS}`);
  console.log(`Client counts: ${CLIENT_COUNTS.join(', ')}\n`);
  
  const allResults: TestResult[] = [];
  
  for (const clientCount of CLIENT_COUNTS) {
    for (let iteration = 1; iteration <= ITERATIONS; iteration++) {
      console.log(`Running: ${clientCount} clients (iteration ${iteration}/${ITERATIONS})...`);
      const result = await runTest(clientCount, iteration);
      allResults.push(result);
      
      // Brief pause between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  printResults(allResults);
  
  // Check for issues
  const hasFailures = allResults.some((r) => r.summary.successRate < 100);
  const hasHighMemory = allResults.some((r) => r.resources.peak.memory.rss > 500);
  const hasExcessiveProcesses = allResults.some(
    (r) => r.resources.peak.tailProcessCount > r.clientCount + 10
  );
  
  if (hasFailures || hasHighMemory || hasExcessiveProcesses) {
    console.log('\n⚠️  WARNINGS DETECTED:');
    if (hasFailures) {
      console.log('  - Some tests had failures');
    }
    if (hasHighMemory) {
      console.log('  - High memory usage detected (>500MB)');
    }
    if (hasExcessiveProcesses) {
      console.log('  - Excessive tail processes detected');
    }
    process.exit(1);
  } else {
    console.log('\n✓ All performance tests passed');
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('performance-test.ts')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

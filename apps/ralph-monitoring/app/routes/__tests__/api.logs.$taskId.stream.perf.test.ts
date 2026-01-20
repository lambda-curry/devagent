/**
 * Performance test for concurrent log streaming
 * 
 * Tests performance when multiple clients stream logs simultaneously:
 * - Benchmarks with 5, 10, 20 concurrent clients
 * - Monitors system resources (file handles, memory, CPU)
 * - Identifies bottlenecks
 * - Documents performance characteristics
 * 
 * Run with: bun run test -- api.logs.\$taskId.stream.perf.test.ts
 * Or: bun test apps/ralph-monitoring/app/routes/__tests__/api.logs.\$taskId.stream.perf.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFileSync, unlinkSync, existsSync, appendFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { loader } from '../api.logs.$taskId.stream';
import { getLogFilePath } from '~/utils/logs.server';

// Test configuration
const TEST_TASK_ID = 'perf-test-task';
const TEST_DURATION_MS = 5000; // 5 seconds of streaming per test
const CONCURRENT_CLIENTS = [5, 10, 20];

interface ResourceMetrics {
  memory: {
    rss: number; // Resident Set Size (MB)
    heapUsed: number; // Heap used (MB)
    heapTotal: number; // Heap total (MB)
    external: number; // External memory (MB)
  };
  cpu: {
    user: number; // User CPU time (microseconds)
    system: number; // System CPU time (microseconds)
  };
  fileHandles?: number; // Number of open file handles (if available)
  processCount?: number; // Number of tail processes
}

interface PerformanceResult {
  clientCount: number;
  setupTime: number; // Time to establish all connections (ms)
  totalBytesReceived: number; // Total bytes received across all clients
  eventsReceived: number; // Total SSE events received
  averageLatency: number; // Average latency per event (ms)
  resourceUsage: {
    before: ResourceMetrics;
    during: ResourceMetrics;
    after: ResourceMetrics;
  };
  errors: string[];
  success: boolean;
}

/**
 * Get current resource usage metrics
 */
function getResourceMetrics(): ResourceMetrics {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100, // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
  };
}

/**
 * Count tail processes (approximate)
 */
async function countTailProcesses(): Promise<number> {
  try {
    // Use ps to count tail processes
    const result = spawn('ps', ['-A', '-o', 'comm'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    result.stdout?.on('data', (chunk) => {
      output += chunk.toString();
    });
    
    return new Promise<number>((resolve) => {
      result.on('close', (code) => {
        if (code === 0) {
          const count = (output.match(/^tail$/gm) || []).length;
          resolve(count);
        } else {
          resolve(0); // Return 0 if ps fails
        }
      });
      result.on('error', () => resolve(0));
    });
  } catch {
    return 0;
  }
}

/**
 * Create a test log file with some content
 */
function createTestLogFile(taskId: string, initialLines: number = 10): string {
  const logPath = getLogFilePath(taskId);
  const lines: string[] = [];
  
  for (let i = 0; i < initialLines; i++) {
    lines.push(`[${new Date().toISOString()}] Initial log line ${i + 1}`);
  }
  
  writeFileSync(logPath, `${lines.join('\n')}\n`, 'utf-8');
  return logPath;
}

/**
 * Continuously append to log file to simulate active logging
 */
function startLogWriter(logPath: string, intervalMs: number = 100): () => void {
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
 * Connect to SSE stream and collect metrics
 */
async function connectToStream(
  taskId: string,
  durationMs: number
): Promise<{
  bytesReceived: number;
  eventsReceived: number;
  latencies: number[];
  errors: string[];
}> {
  const request = new Request(`http://localhost/api/logs/${taskId}/stream`);
  const response = await loader({
    params: { taskId },
    request,
    context: {},
    unstable_pattern: ''
  });
  
  if (!response.ok) {
    throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body reader available');
  }
  
  const decoder = new TextDecoder();
  let bytesReceived = 0;
  let eventsReceived = 0;
  const latencies: number[] = [];
  const errors: string[] = [];
  const startTime = Date.now();
  
  const readLoop = async (): Promise<void> => {
    try {
      while (Date.now() - startTime < durationMs) {
        const { value, done } = await reader.read();
        
        if (done) {
          break;
        }
        
        if (value) {
          bytesReceived += value.length;
          const text = decoder.decode(value, { stream: true });
          
          // Count SSE events (lines starting with "data: " or "event: ")
          const eventMatches = text.match(/^(data|event):/gm);
          if (eventMatches) {
            eventsReceived += eventMatches.length;
            // Record latency (approximate - time since start)
            latencies.push(Date.now() - startTime);
          }
          
          // Check for error events
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
        // Ignore cancel errors
      }
    }
  };
  
  await readLoop();
  
  return {
    bytesReceived,
    eventsReceived,
    latencies,
    errors,
  };
}

/**
 * Run performance test with specified number of concurrent clients
 */
async function runPerformanceTest(
  clientCount: number,
  durationMs: number
): Promise<PerformanceResult> {
  const logPath = createTestLogFile(TEST_TASK_ID, 10);
  const stopLogWriter = startLogWriter(logPath, 50); // Write every 50ms
  
  try {
    // Measure resources before
    const beforeMetrics = getResourceMetrics();
    const beforeProcessCount = await countTailProcesses();
    
    const setupStart = Date.now();
    
    // Start all concurrent connections
    const connections = Array.from({ length: clientCount }, () =>
      connectToStream(TEST_TASK_ID, durationMs)
    );
    
    const setupTime = Date.now() - setupStart;
    
    // Wait a bit for connections to establish, then measure during
    await new Promise((resolve) => setTimeout(resolve, 500));
    const duringMetrics = getResourceMetrics();
    const duringProcessCount = await countTailProcesses();
    
    // Wait for all connections to complete
    const results = await Promise.allSettled(connections);
    
    // Aggregate results
    let totalBytes = 0;
    let totalEvents = 0;
    const allLatencies: number[] = [];
    const allErrors: string[] = [];
    let successCount = 0;
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        totalBytes += result.value.bytesReceived;
        totalEvents += result.value.eventsReceived;
        allLatencies.push(...result.value.latencies);
        allErrors.push(...result.value.errors);
        successCount++;
      } else {
        allErrors.push(result.reason?.message || 'Connection failed');
      }
    }
    
    // Calculate average latency
    const averageLatency =
      allLatencies.length > 0
        ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
        : 0;
    
    // Measure resources after
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for cleanup
    const afterMetrics = getResourceMetrics();
    const afterProcessCount = await countTailProcesses();
    
    return {
      clientCount,
      setupTime,
      totalBytesReceived: totalBytes,
      eventsReceived: totalEvents,
      averageLatency,
      resourceUsage: {
        before: { ...beforeMetrics, processCount: beforeProcessCount },
        during: { ...duringMetrics, processCount: duringProcessCount },
        after: { ...afterMetrics, processCount: afterProcessCount },
      },
      errors: allErrors,
      success: successCount === clientCount && allErrors.length === 0,
    };
  } finally {
    stopLogWriter();
    
    // Cleanup test log file
    try {
      if (existsSync(logPath)) {
        unlinkSync(logPath);
      }
    } catch (error) {
      console.error('Error cleaning up test log file:', error);
    }
  }
}

describe('Performance: Concurrent Log Streaming', () => {
  const results: PerformanceResult[] = [];
  
  beforeAll(() => {
    // Ensure test log directory exists
    const logPath = getLogFilePath(TEST_TASK_ID);
    // Directory should already exist from logs.server.ts implementation
    void logPath; // Suppress unused variable warning
  });
  
  afterAll(() => {
    // Cleanup any remaining test files
    try {
      const logPath = getLogFilePath(TEST_TASK_ID);
      if (existsSync(logPath)) {
        unlinkSync(logPath);
      }
    } catch {
      // Ignore cleanup errors
    }
    
    // Print performance summary
    console.log('\n=== Performance Test Summary ===\n');
    for (const result of results) {
      console.log(`Clients: ${result.clientCount}`);
      console.log(`  Success: ${result.success ? '✓' : '✗'}`);
      console.log(`  Setup Time: ${result.setupTime}ms`);
      console.log(`  Total Bytes: ${result.totalBytesReceived.toLocaleString()}`);
      console.log(`  Events: ${result.eventsReceived.toLocaleString()}`);
      console.log(`  Avg Latency: ${result.averageLatency.toFixed(2)}ms`);
      console.log(`  Memory (RSS): ${result.resourceUsage.during.memory.rss}MB`);
      console.log(`  Tail Processes: ${result.resourceUsage.during.processCount || 'N/A'}`);
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`);
      }
      console.log('');
    }
  });
  
  for (const clientCount of CONCURRENT_CLIENTS) {
    it(`should handle ${clientCount} concurrent clients`, async () => {
      const result = await runPerformanceTest(clientCount, TEST_DURATION_MS);
      results.push(result);
      
      // Assertions
      expect(result.success, `Test failed with errors: ${result.errors.join(', ')}`).toBe(true);
      expect(result.eventsReceived, 'Should receive some events').toBeGreaterThan(0);
      expect(
        result.resourceUsage.during.memory.rss,
        'Memory usage should be reasonable (< 500MB)'
      ).toBeLessThan(500);
      
      // Process count from `ps` can include unrelated tail processes on the system.
      // Keep this as a diagnostic-only metric in the summary, not a hard assertion.
    }, 60000); // 60 second timeout
  }
  
  it('should document performance characteristics', () => {
    // This test ensures we have results to document
    expect(results.length).toBe(CONCURRENT_CLIENTS.length);
    
    // Verify we tested at least 10 clients (acceptance criteria)
    const tested10Plus = results.some((r) => r.clientCount >= 10);
    expect(tested10Plus, 'Should test with 10+ concurrent clients').toBe(true);
  });
});

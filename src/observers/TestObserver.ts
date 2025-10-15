
export interface TestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    timestamp: Date;
}

export interface TestSuite {
    suiteName: string;
    results: TestResult[];
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    totalDuration: number;
}

export interface TestObserver {
    onTestStart(testName: string): void;
    onTestComplete(result: TestResult): void;
    onSuiteComplete(suite: TestSuite): void;
}

export interface TestSubject {
    addObserver(observer: TestObserver): void;
    removeObserver(observer: TestObserver): void;
    notifyTestStart(testName: string): void;
    notifyTestComplete(result: TestResult): void;
    notifySuiteComplete(suite: TestSuite): void;
}

export class TestResultNotifier implements TestSubject {
    private observers: TestObserver[] = [];

    addObserver(observer: TestObserver): void {
        this.observers.push(observer);
    }

    removeObserver(observer: TestObserver): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyTestStart(testName: string): void {
        this.observers.forEach(observer => observer.onTestStart(testName));
    }

    notifyTestComplete(result: TestResult): void {
        this.observers.forEach(observer => observer.onTestComplete(result));
    }

    notifySuiteComplete(suite: TestSuite): void {
        this.observers.forEach(observer => observer.onSuiteComplete(suite));
    }
}

export class ConsoleTestObserver implements TestObserver {
    onTestStart(testName: string): void {
        console.log(`🧪 Starting test: ${testName}`);
    }

    onTestComplete(result: TestResult): void {
        const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
        console.log(`${icon} ${result.testName} - ${result.status} (${result.duration}ms)`);

        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    }

    onSuiteComplete(suite: TestSuite): void {
        console.log(`\n📊 Test Suite: ${suite.suiteName}`);
        console.log(`   Total: ${suite.totalTests} | Passed: ${suite.passedTests} | Failed: ${suite.failedTests} | Skipped: ${suite.skippedTests}`);
        console.log(`   Duration: ${suite.totalDuration}ms\n`);
    }
}

export class FileTestObserver implements TestObserver {
    private logs: string[] = [];

    onTestStart(testName: string): void {
        this.logs.push(`[${new Date().toISOString()}] TEST_START: ${testName}`);
    }

    onTestComplete(result: TestResult): void {
        this.logs.push(`[${result.timestamp.toISOString()}] TEST_COMPLETE: ${result.testName} - ${result.status} (${result.duration}ms)`);
        if (result.error) {
            this.logs.push(`[${result.timestamp.toISOString()}] ERROR: ${result.error}`);
        }
    }

    onSuiteComplete(suite: TestSuite): void {
        this.logs.push(`[${new Date().toISOString()}] SUITE_COMPLETE: ${suite.suiteName} - ${suite.passedTests}/${suite.totalTests} passed`);
    }

    getLogs(): string[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
    }
}

export class MetricsTestObserver implements TestObserver {
    private metrics = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        totalDuration: 0,
        averageDuration: 0,
        slowestTest: { name: '', duration: 0 },
        fastestTest: { name: '', duration: Infinity }
    };

    onTestStart(testName: string): void {

    }

    onTestComplete(result: TestResult): void {
        this.metrics.totalTests++;
        this.metrics.totalDuration += result.duration;

        switch (result.status) {
            case 'passed':
                this.metrics.passedTests++;
                break;
            case 'failed':
                this.metrics.failedTests++;
                break;
            case 'skipped':
                this.metrics.skippedTests++;
                break;
        }


        if (result.duration > this.metrics.slowestTest.duration) {
            this.metrics.slowestTest = { name: result.testName, duration: result.duration };
        }
        if (result.duration < this.metrics.fastestTest.duration) {
            this.metrics.fastestTest = { name: result.testName, duration: result.duration };
        }

        this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalTests;
    }

    onSuiteComplete(suite: TestSuite): void {

    }

    getMetrics() {
        return { ...this.metrics };
    }

    reset(): void {
        this.metrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
            averageDuration: 0,
            slowestTest: { name: '', duration: 0 },
            fastestTest: { name: '', duration: Infinity }
        };
    }
}

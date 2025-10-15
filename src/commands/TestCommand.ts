import { RandomUserApiClient } from '../api/randomuser.client';
import { RandomUserResponse } from '../types/randomuser.types';
import { TestResult } from '../observers/TestObserver';
export interface TestCommand {
    execute(): Promise<TestResult>;
    undo(): Promise<void>;
    getCommandName(): string;
    getDescription(): string;
}

export abstract class BaseTestCommand implements TestCommand {
    protected client: RandomUserApiClient;
    protected startTime: number = 0;
    protected result?: RandomUserResponse;

    constructor(client: RandomUserApiClient) {
        this.client = client;
    }

    abstract execute(): Promise<TestResult>;

    async undo(): Promise<void> {


    }

    abstract getCommandName(): string;
    abstract getDescription(): string;

    protected createTestResult(testName: string, status: 'passed' | 'failed' | 'skipped', error?: string): TestResult {
        return {
            testName,
            status,
            duration: Date.now() - this.startTime,
            error,
            timestamp: new Date()
        };
    }
}

export class FetchSingleUserCommand extends BaseTestCommand {
    async execute(): Promise<TestResult> {
        this.startTime = Date.now();

        try {
            this.result = await this.client.getSingleUser();

            if (this.result.results.length === 1) {
                return this.createTestResult(this.getCommandName(), 'passed');
            } else {
                return this.createTestResult(this.getCommandName(), 'failed', 'Expected 1 user, got ' + this.result.results.length);
            }
        } catch (error) {
            return this.createTestResult(this.getCommandName(), 'failed', (error as Error).message);
        }
    }

    getCommandName(): string {
        return 'FetchSingleUser';
    }

    getDescription(): string {
        return 'Fetches a single user from the API';
    }
}

export class FetchMultipleUsersCommand extends BaseTestCommand {
    private count: number;

    constructor(client: RandomUserApiClient, count: number) {
        super(client);
        this.count = count;
    }

    async execute(): Promise<TestResult> {
        this.startTime = Date.now();

        try {
            this.result = await this.client.getMultipleUsers(this.count);

            if (this.result.results.length === this.count) {
                return this.createTestResult(this.getCommandName(), 'passed');
            } else {
                return this.createTestResult(this.getCommandName(), 'failed', `Expected ${this.count} users, got ${this.result.results.length}`);
            }
        } catch (error) {
            return this.createTestResult(this.getCommandName(), 'failed', (error as Error).message);
        }
    }

    getCommandName(): string {
        return `FetchMultipleUsers(${this.count})`;
    }

    getDescription(): string {
        return `Fetches ${this.count} users from the API`;
    }
}

export class FetchUsersByGenderCommand extends BaseTestCommand {
    private gender: 'male' | 'female';
    private count: number;

    constructor(client: RandomUserApiClient, gender: 'male' | 'female', count: number = 1) {
        super(client);
        this.gender = gender;
        this.count = count;
    }

    async execute(): Promise<TestResult> {
        this.startTime = Date.now();

        try {
            this.result = await this.client.getUsersByGender(this.gender, this.count);

            const allCorrectGender = this.result.results.every(user => user.gender === this.gender);

            if (this.result.results.length === this.count && allCorrectGender) {
                return this.createTestResult(this.getCommandName(), 'passed');
            } else {
                const error = !allCorrectGender ? 'Not all users have correct gender' : `Expected ${this.count} users, got ${this.result.results.length}`;
                return this.createTestResult(this.getCommandName(), 'failed', error);
            }
        } catch (error) {
            return this.createTestResult(this.getCommandName(), 'failed', (error as Error).message);
        }
    }

    getCommandName(): string {
        return `FetchUsersByGender(${this.gender}, ${this.count})`;
    }

    getDescription(): string {
        return `Fetches ${this.count} ${this.gender} users from the API`;
    }
}

export class PerformanceTestCommand extends BaseTestCommand {
    private maxDuration: number;
    private operation: () => Promise<RandomUserResponse>;
    private operationName: string;

    constructor(
        client: RandomUserApiClient,
        operation: () => Promise<RandomUserResponse>,
        operationName: string,
        maxDuration: number = 5000
    ) {
        super(client);
        this.operation = operation;
        this.operationName = operationName;
        this.maxDuration = maxDuration;
    }

    async execute(): Promise<TestResult> {
        this.startTime = Date.now();

        try {
            this.result = await this.operation();
            const duration = Date.now() - this.startTime;

            if (duration <= this.maxDuration) {
                return this.createTestResult(this.getCommandName(), 'passed');
            } else {
                return this.createTestResult(this.getCommandName(), 'failed', `Operation took ${duration}ms, expected <= ${this.maxDuration}ms`);
            }
        } catch (error) {
            return this.createTestResult(this.getCommandName(), 'failed', (error as Error).message);
        }
    }

    getCommandName(): string {
        return `PerformanceTest(${this.operationName})`;
    }

    getDescription(): string {
        return `Tests performance of ${this.operationName} operation (max ${this.maxDuration}ms)`;
    }
}

export class TestCommandInvoker {
    private history: TestCommand[] = [];
    private currentIndex: number = -1;

    async executeCommand(command: TestCommand): Promise<TestResult> {

        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(command);
        this.currentIndex++;

        return await command.execute();
    }

    async undoLastCommand(): Promise<void> {
        if (this.currentIndex >= 0) {
            const command = this.history[this.currentIndex];
            await command.undo();
            this.currentIndex--;
        }
    }

    async redoCommand(): Promise<TestResult | null> {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            return await command.execute();
        }
        return null;
    }

    getHistory(): TestCommand[] {
        return [...this.history];
    }

    clearHistory(): void {
        this.history = [];
        this.currentIndex = -1;
    }

    canUndo(): boolean {
        return this.currentIndex >= 0;
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }
}

export class MacroTestCommand implements TestCommand {
    private commands: TestCommand[] = [];
    private name: string;
    private description: string;

    constructor(name: string, description: string, commands: TestCommand[] = []) {
        this.name = name;
        this.description = description;
        this.commands = commands;
    }

    addCommand(command: TestCommand): void {
        this.commands.push(command);
    }

    async execute(): Promise<TestResult> {
        const startTime = Date.now();
        const results: TestResult[] = [];

        try {
            for (const command of this.commands) {
                const result = await command.execute();
                results.push(result);


                if (result.status === 'failed') {
                    return {
                        testName: this.getCommandName(),
                        status: 'failed',
                        duration: Date.now() - startTime,
                        error: `Command ${command.getCommandName()} failed: ${result.error}`,
                        timestamp: new Date()
                    };
                }
            }

            return {
                testName: this.getCommandName(),
                status: 'passed',
                duration: Date.now() - startTime,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                testName: this.getCommandName(),
                status: 'failed',
                duration: Date.now() - startTime,
                error: (error as Error).message,
                timestamp: new Date()
            };
        }
    }

    async undo(): Promise<void> {

        for (let i = this.commands.length - 1; i >= 0; i--) {
            await this.commands[i].undo();
        }
    }

    getCommandName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }
}

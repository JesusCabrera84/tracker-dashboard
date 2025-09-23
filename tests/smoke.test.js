import { describe, it, expect } from 'vitest';

describe('CI smoke test', () => {
	it('adds numbers correctly', () => {
		expect(1 + 1).toBe(2);
	});

	it('environment is set up', () => {
		expect(process.env.NODE_ENV).toBeDefined();
	});
});

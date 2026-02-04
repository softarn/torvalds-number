import assert from 'node:assert';
import { setMockDriver } from '../src/lib/neo4j';
import { GET } from '../src/app/api/autocomplete/route';

// Mock driver and session
const queries: string[] = [];
let mockSessionRun = async (query: string, params: any) => {
    queries.push(query);
    // Return empty result
    return { records: [] };
};

const mockSession = {
    run: async (query: string, params: any) => mockSessionRun(query, params),
    close: async () => {},
};

const mockDriver = {
    session: () => mockSession,
    close: async () => {},
};

// Inject mock driver
setMockDriver(mockDriver as any);

async function runTests() {
    console.log('Running autocomplete verification tests...');

    // Test 1: Fulltext search is used first
    console.log('Test 1: Fulltext search is used first');
    queries.length = 0; // Clear queries
    const req1 = new Request('http://localhost:3000/api/autocomplete?q=torvalds');

    await GET(req1);

    assert.ok(queries.length > 0, 'No queries executed');
    assert.ok(queries[0].includes('CALL db.index.fulltext.queryNodes'), 'First query should be fulltext search');
    console.log('Test 1 Passed.');

    // Test 2: Fallback to standard query on error
    console.log('Test 2: Fallback to standard query on error');
    queries.length = 0;
    // Mock run to fail on first call, succeed on second
    let callCount = 0;
    mockSessionRun = async (query: string, params: any) => {
        queries.push(query);
        callCount++;
        if (callCount === 1) {
            throw new Error('Index not found');
        }
        return { records: [] };
    };

    const req2 = new Request('http://localhost:3000/api/autocomplete?q=linux');
    await GET(req2);

    assert.strictEqual(queries.length, 2, 'Should execute 2 queries (attempt + fallback)');
    assert.ok(queries[0].includes('CALL db.index.fulltext.queryNodes'), 'First query should be fulltext search');
    assert.ok(queries[1].includes('MATCH (d:Developer)'), 'Second query should be fallback standard search');
    console.log('Test 2 Passed.');
}

runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});

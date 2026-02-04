import { unstable_cache } from 'next/cache';
import { getNeo4jDriver } from './neo4j';

export interface DatabaseStats {
    developers: number;
    repositories: number;
    contributions: number;
}

/**
 * Fetches database statistics with 1-hour caching via Vercel's edge cache.
 */
export const getStats = unstable_cache(
    async (): Promise<DatabaseStats> => {
        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            const result = await session.run(`
                MATCH (d:Developer) WITH count(d) as developers
                MATCH (r:Repository) WITH developers, count(r) as repositories
                MATCH ()-[c:CONTRIBUTED_TO]->() 
                RETURN developers, repositories, count(c) as contributions
            `);

            if (result.records.length === 0) {
                return { developers: 0, repositories: 0, contributions: 0 };
            }

            const record = result.records[0];
            return {
                developers: toNumber(record.get('developers')),
                repositories: toNumber(record.get('repositories')),
                contributions: toNumber(record.get('contributions')),
            };
        } finally {
            await session.close();
        }
    },
    ['database-stats'],
    { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Robust number conversion for Neo4j's custom Integer type.
 */
function toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (value && typeof value === 'object' && 'toNumber' in value) {
        return (value as { toNumber: () => number }).toNumber();
    }
    return 0;
}

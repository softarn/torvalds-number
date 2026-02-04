import { NextResponse } from 'next/server';
import { getNeo4jDriver } from '@/lib/neo4j';
import { AutocompleteResponse } from '@/lib/types';

export async function GET(request: Request): Promise<NextResponse<AutocompleteResponse>> {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
        let result;
        try {
            // Try using the fulltext index first for better performance
            result = await session.run(
                `CALL db.index.fulltext.queryNodes("developer_usernames", $query + "*")
                 YIELD node, score
                 RETURN node.username AS username
                 ORDER BY username
                 LIMIT 3`,
                { query }
            );
        } catch (error) {
            // Fallback to standard query if index is missing or other error
            console.warn('Fulltext search failed, falling back to standard query:', error);
            result = await session.run(
                `MATCH (d:Developer)
                 WHERE toLower(d.username) STARTS WITH $query
                 RETURN d.username AS username
                 ORDER BY d.username
                 LIMIT 3`,
                { query }
            );
        }

        const suggestions = result.records.map(record => record.get('username') as string);

        return NextResponse.json({ suggestions });
    } finally {
        await session.close();
    }
}

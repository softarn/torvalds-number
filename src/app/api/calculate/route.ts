import { NextResponse } from 'next/server';
import { getNeo4jDriver } from '@/lib/neo4j';
import { ingestUser } from '@/lib/ingestion';
import { PathStep, CalculateResponse, CalculateErrorResponse, Developer, Repository, ContributionFacts } from '@/lib/types';
import { Node, Relationship, Path } from 'neo4j-driver';

export async function POST(request: Request): Promise<NextResponse<CalculateResponse | CalculateErrorResponse>> {
    try {
        const body = await request.json();
        const { username } = body;

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Try to find path
        let pathResult = await findShortestPath(normalizedUsername);

        // If no path found, try to ingest user data and retry
        if (!pathResult) {
            console.log(`[Calculate] No path found for ${normalizedUsername}, attempting ingestion...`);

            const ingestionResult = await ingestUser(normalizedUsername);

            if (ingestionResult.success) {
                console.log(`[Calculate] Ingestion complete, retrying path search...`);
                pathResult = await findShortestPath(normalizedUsername);
            } else {
                console.log(`[Calculate] Ingestion failed: ${ingestionResult.error}`);
            }
        }

        if (!pathResult) {
            return NextResponse.json(
                { error: `No path found between "${username}" and torvalds. The user may not be in our database or not connected to Torvalds.` },
                { status: 404 }
            );
        }

        const pathSteps = convertPathToSteps(pathResult);

        // The Torvalds Number is the count of Repository nodes in the path
        const thorvaldsNumber = pathSteps.filter(step => step.type === 'repository').length;

        return NextResponse.json({
            number: thorvaldsNumber,
            path: pathSteps,
            username: normalizedUsername,
        });
    } catch (error) {
        console.error('Error calculating path:', error);
        return NextResponse.json(
            { error: 'An error occurred while calculating the path' },
            { status: 500 }
        );
    }
}

async function findShortestPath(username: string): Promise<Path | null> {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (start:Developer), (end:Developer)
            WHERE toLower(start.username) = toLower($username) 
            AND toLower(end.username) = 'torvalds'
            MATCH path = shortestPath((start)-[:CONTRIBUTED_TO*..50]-(end))
            RETURN path`,
            { username }
        );

        if (result.records.length === 0) {
            return null;
        }

        return result.records[0].get('path') as Path;
    } finally {
        await session.close();
    }
}

function convertPathToSteps(path: Path): PathStep[] {
    const steps: PathStep[] = [];
    const segments = path.segments;

    // Add the starting node
    const startNode = path.start;
    steps.push(nodeToStep(startNode));

    // Process each segment (relationship + end node)
    for (const segment of segments) {
        const rel = segment.relationship;
        const endNode = segment.end;

        // Add relationship facts to the previous step if it's a developer going to a repo
        const previousStep = steps[steps.length - 1];
        if (previousStep.type === 'developer' && endNode.labels.includes('Repository')) {
            // The relationship facts describe this developer's contribution to the repo
            previousStep.facts = relationshipToFacts(rel);
        }

        steps.push(nodeToStep(endNode));

        // If we just added a repo and the previous was a developer, 
        // the next developer will need facts too (from repo to developer)
        if (steps.length >= 2) {
            const currentStep = steps[steps.length - 1];
            const prevStep = steps[steps.length - 2];
            if (currentStep.type === 'developer' && prevStep.type === 'repository') {
                currentStep.facts = relationshipToFacts(rel);
            }
        }
    }

    return steps;
}

function nodeToStep(node: Node): PathStep {
    const labels = node.labels;

    if (labels.includes('Developer')) {
        const developer: Developer = {
            githubId: toNumber(node.properties.github_id),
            username: node.properties.username as string,
        };
        return { type: 'developer', developer };
    } else if (labels.includes('Repository')) {
        const repository: Repository = {
            githubId: toNumber(node.properties.github_id),
            name: node.properties.name as string,
        };
        return { type: 'repository', repository };
    }

    throw new Error(`Unknown node type: ${labels.join(', ')}`);
}

function relationshipToFacts(rel: Relationship): ContributionFacts {
    return {
        totalCommits: toNumber(rel.properties.total_commits) || 0,
        linesAdded: toNumber(rel.properties.lines_added) || 0,
        primaryLanguage: (rel.properties.primary_language as string) || 'Unknown',
    };
}

function toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (value && typeof value === 'object' && 'toNumber' in value) {
        return (value as { toNumber: () => number }).toNumber();
    }
    return 0;
}

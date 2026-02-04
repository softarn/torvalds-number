/**
 * User ingestion logic - fetches GitHub data and writes to Neo4j.
 */

import { getNeo4jDriver } from './neo4j';
import { getUser, getUserRepos, getRepoContributors, getAllTimeContributedRepos } from './github';

interface IngestionResult {
    success: boolean;
    developersAdded: number;
    repositoriesAdded: number;
    contributionsAdded: number;
    error?: string;
}

/**
 * Ingest a user's GitHub data into Neo4j.
 * Fetches user, their repos, and repo contributors.
 */
export async function ingestUser(username: string): Promise<IngestionResult> {
    console.log(`[Ingestion] Starting ingestion for user: ${username}`);

    const result: IngestionResult = {
        success: false,
        developersAdded: 0,
        repositoriesAdded: 0,
        contributionsAdded: 0,
    };

    try {
        // 1. Fetch user from GitHub
        console.log(`[Ingestion] Fetching GitHub user: ${username}`);
        const user = await getUser(username);
        if (!user) {
            result.error = `User "${username}" not found on GitHub or GitHub API error`;
            console.log(`[Ingestion] Failed to fetch user: ${result.error}`);
            return result;
        }
        console.log(`[Ingestion] Found GitHub user: ${user.login} (ID: ${user.databaseId})`);


        const driver = getNeo4jDriver();
        const session = driver.session();

        try {
            // 2. Create the developer node (MERGE to avoid duplicates)
            await session.run(
                `MERGE (d:Developer {github_id: $githubId})
                 SET d.username = $username`,
                { githubId: user.databaseId, username: user.login }
            );
            result.developersAdded++;

            // 3. Fetch user's repositories (all-time contributions)
            const repos = await getAllTimeContributedRepos(username, 0); // Get all, no star minimum
            console.log(`[Ingestion] Found ${repos.length} repos for ${username}`);

            for (const repo of repos) {
                // Create repository node
                await session.run(
                    `MERGE (r:Repository {github_id: $githubId})
                     SET r.name = $name, r.language = $language`,
                    { githubId: repo.githubId, name: repo.name, language: repo.language }
                );
                result.repositoriesAdded++;

                // Create contribution from user to repo
                await session.run(
                    `MATCH (d:Developer {github_id: $devId})
                     MATCH (r:Repository {github_id: $repoId})
                     MERGE (d)-[c:CONTRIBUTED_TO]->(r)
                     SET c.primary_language = $language, c.total_commits = $commits`,
                    { devId: user.databaseId, repoId: repo.githubId, language: repo.language, commits: repo.commits ?? 1 }
                );
                result.contributionsAdded++;

                // 4. Fetch contributors for each repo
                const contributors = await getRepoContributors(repo.name, 50); // Limit per repo
                console.log(`[Ingestion]   -> ${repo.name}: ${contributors.length} contributors`);

                for (const contrib of contributors) {
                    // Skip if same as the user we're ingesting
                    if (contrib.githubId === user.databaseId) continue;

                    // Create contributor as developer
                    await session.run(
                        `MERGE (d:Developer {github_id: $githubId})
                         SET d.username = $username`,
                        { githubId: contrib.githubId, username: contrib.username }
                    );
                    result.developersAdded++;

                    // Create contribution relationship
                    await session.run(
                        `MATCH (d:Developer {github_id: $devId})
                         MATCH (r:Repository {github_id: $repoId})
                         MERGE (d)-[c:CONTRIBUTED_TO]->(r)
                         SET c.total_commits = $commits, c.primary_language = $language`,
                        {
                            devId: contrib.githubId,
                            repoId: repo.githubId,
                            commits: contrib.commits,
                            language: repo.language,
                        }
                    );
                    result.contributionsAdded++;
                }
            }

            result.success = true;
            console.log(`[Ingestion] Complete: ${result.developersAdded} devs, ${result.repositoriesAdded} repos, ${result.contributionsAdded} contributions`);
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('[Ingestion] Error:', error);
        result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
}

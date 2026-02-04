/**
 * GitHub API Client for fetching user and repository data.
 * Ported from Python ingestion script.
 */

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';
const MIN_STARS = 100;

interface GitHubUser {
    databaseId: number;
    login: string;
}

interface GitHubRepo {
    githubId: number;
    name: string;
    stars: number;
    language: string | null;
    commits?: number;  // User's commit count (only from getAllTimeContributedRepos)
}

interface GitHubContributor {
    githubId: number;
    username: string;
    commits: number;
}

function getHeaders(): HeadersInit {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('[GitHub] GITHUB_TOKEN environment variable is not set!');
        throw new Error('GITHUB_TOKEN environment variable is not set');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    const payload: { query: string; variables?: Record<string, unknown> } = { query };
    if (variables) {
        payload.variables = variables;
    }

    try {
        const response = await fetch(GITHUB_GRAPHQL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        if (response.status === 403) {
            console.error('[GitHub] API rate limited (403)');
            return null;
        }

        if (!response.ok) {
            const text = await response.text();
            console.error(`[GitHub] API error ${response.status}: ${text}`);
            return null;
        }

        const data = await response.json();
        if (data.errors) {
            console.error('[GitHub] GraphQL errors:', JSON.stringify(data.errors));
            return null;
        }

        return data.data as T;
    } catch (error) {
        console.error('[GitHub] API request failed:', error);
        return null;
    }
}

/**
 * Fetch user details by username.
 */
export async function getUser(username: string): Promise<GitHubUser | null> {
    const query = `
        query($login: String!) {
            user(login: $login) {
                databaseId
                login
            }
        }
    `;

    const result = await graphql<{ user: GitHubUser | null }>(query, { login: username });
    return result?.user ?? null;
}

/**
 * Fetch user's popular repositories (owned and contributed to).
 * @param minStars - Minimum star count to include (default 0 for on-demand ingestion)
 */
export async function getUserRepos(username: string, limit: number = 20, minStars: number = 0): Promise<GitHubRepo[]> {
    const query = `
        query($login: String!, $first: Int!) {
            user(login: $login) {
                repositories(
                    first: $first
                    orderBy: {field: STARGAZERS, direction: DESC}
                    ownerAffiliations: [OWNER]
                    isFork: false
                ) {
                    nodes {
                        databaseId
                        nameWithOwner
                        stargazerCount
                        primaryLanguage { name }
                    }
                }
                repositoriesContributedTo(
                    first: $first
                    contributionTypes: [COMMIT]
                    orderBy: {field: STARGAZERS, direction: DESC}
                ) {
                    nodes {
                        databaseId
                        nameWithOwner
                        stargazerCount
                        primaryLanguage { name }
                    }
                }
            }
        }
    `;

    interface RepoNode {
        databaseId: number;
        nameWithOwner: string;
        stargazerCount: number;
        primaryLanguage: { name: string } | null;
    }

    interface QueryResult {
        user: {
            repositories: { nodes: RepoNode[] };
            repositoriesContributedTo: { nodes: RepoNode[] };
        } | null;
    }

    const result = await graphql<QueryResult>(query, { login: username, first: limit });
    if (!result?.user) {
        console.log(`[GitHub] No user data returned for ${username}`);
        return [];
    }

    // Debug: log what we got
    const ownedCount = result.user.repositories?.nodes?.length ?? 0;
    const contributedCount = result.user.repositoriesContributedTo?.nodes?.length ?? 0;
    console.log(`[GitHub] Raw repos for ${username}: ${ownedCount} owned, ${contributedCount} contributed to`);

    const repos: GitHubRepo[] = [];
    const seenIds = new Set<number>();

    const processNodes = (nodes: RepoNode[], source: string) => {
        for (const node of nodes) {
            if (!node || seenIds.has(node.databaseId)) continue;
            console.log(`[GitHub]   ${source}: ${node.nameWithOwner} (${node.stargazerCount} stars)`);
            if (node.stargazerCount >= minStars) {
                seenIds.add(node.databaseId);
                repos.push({
                    githubId: node.databaseId,
                    name: node.nameWithOwner,
                    stars: node.stargazerCount,
                    language: node.primaryLanguage?.name ?? null,
                });
            }
        }
    };

    processNodes(result.user.repositories.nodes, 'owned');
    processNodes(result.user.repositoriesContributedTo.nodes, 'contributed');

    // Sort by stars descending
    repos.sort((a, b) => b.stars - a.stars);
    return repos.slice(0, limit);
}

/**
 * Fetch all-time contributed repositories using contributionsCollection.
 * GitHub's repositoriesContributedTo only returns last year; this queries each year.
 */
export async function getAllTimeContributedRepos(username: string, minStars: number = 0): Promise<GitHubRepo[]> {
    // Query contributions for each year since GitHub was founded (2008)
    const currentYear = new Date().getFullYear();
    const startYear = 2008;
    const repos: GitHubRepo[] = [];
    const seenIds = new Set<number>();

    console.log(`[GitHub] Fetching all-time contributions for ${username} (${startYear}-${currentYear})`);

    for (let year = currentYear; year >= startYear; year--) {
        const from = `${year}-01-01T00:00:00Z`;
        const to = `${year}-12-31T23:59:59Z`;

        const query = `
            query($login: String!, $from: DateTime!, $to: DateTime!) {
                user(login: $login) {
                    contributionsCollection(from: $from, to: $to) {
                        commitContributionsByRepository(maxRepositories: 100) {
                            repository {
                                databaseId
                                nameWithOwner
                                stargazerCount
                                primaryLanguage { name }
                            }
                            contributions {
                                totalCount
                            }
                        }
                    }
                }
            }
        `;

        interface RepoContribution {
            repository: {
                databaseId: number;
                nameWithOwner: string;
                stargazerCount: number;
                primaryLanguage: { name: string } | null;
            };
            contributions: { totalCount: number };
        }

        interface QueryResult {
            user: {
                contributionsCollection: {
                    commitContributionsByRepository: RepoContribution[];
                };
            } | null;
        }

        const result: QueryResult | null = await graphql<QueryResult>(query, { login: username, from, to });
        if (!result?.user?.contributionsCollection) continue;

        const yearRepos = result.user.contributionsCollection.commitContributionsByRepository;
        console.log(`[GitHub]   ${year}: ${yearRepos.length} repos`);

        for (const contrib of yearRepos) {
            const repo = contrib.repository;
            if (!repo || seenIds.has(repo.databaseId)) continue;
            if (repo.stargazerCount >= minStars) {
                seenIds.add(repo.databaseId);
                repos.push({
                    githubId: repo.databaseId,
                    name: repo.nameWithOwner,
                    stars: repo.stargazerCount,
                    language: repo.primaryLanguage?.name ?? null,
                    commits: contrib.contributions.totalCount,
                });
            }
        }

        // Stop if we've gone too many years without finding anything new
        if (yearRepos.length === 0 && year < currentYear - 3) {
            console.log(`[GitHub]   Stopping - no contributions for ${year}`);
            break;
        }
    }

    console.log(`[GitHub] Found ${repos.length} total repos across all years`);
    repos.sort((a, b) => b.stars - a.stars);
    return repos;
}

/**
 * Fetch contributors for a repository via REST API.
 */
export async function getRepoContributors(repoName: string, limit: number = 100): Promise<GitHubContributor[]> {
    const contributors: GitHubContributor[] = [];
    let page = 1;
    const perPage = 100;

    const headers: HeadersInit = {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
    };

    while (contributors.length < limit) {
        const url = `https://api.github.com/repos/${repoName}/contributors?per_page=${perPage}&page=${page}`;

        try {
            const response = await fetch(url, { headers });

            if (response.status === 403) {
                console.log(`Rate limited or repo too large for ${repoName}, using GraphQL fallback`);
                return getRepoContributorsGraphQL(repoName, limit);
            }

            if (!response.ok) {
                break;
            }

            interface ContributorData {
                id: number;
                login: string;
                contributions: number;
                type: string;
            }

            const data: ContributorData[] = await response.json();
            if (!data || data.length === 0) break;

            for (const contrib of data) {
                if (contrib.type !== 'User') continue;
                contributors.push({
                    githubId: contrib.id,
                    username: contrib.login,
                    commits: contrib.contributions,
                });
                if (contributors.length >= limit) break;
            }

            if (data.length < perPage) break;
            page++;
        } catch {
            break;
        }
    }

    return contributors;
}

/**
 * Fallback: Get contributors from commit history via GraphQL.
 */
async function getRepoContributorsGraphQL(repoName: string, limit: number = 100): Promise<GitHubContributor[]> {
    const [owner, name] = repoName.split('/', 2);
    const query = `
        query($owner: String!, $name: String!, $first: Int!, $after: String) {
            repository(owner: $owner, name: $name) {
                defaultBranchRef {
                    target {
                        ... on Commit {
                            history(first: $first, after: $after) {
                                pageInfo {
                                    hasNextPage
                                    endCursor
                                }
                                nodes {
                                    author {
                                        user {
                                            databaseId
                                            login
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    interface CommitNode {
        author: {
            user: { databaseId: number; login: string } | null;
        } | null;
    }

    interface QueryResult {
        repository: {
            defaultBranchRef: {
                target: {
                    history: {
                        pageInfo: { hasNextPage: boolean; endCursor: string | null };
                        nodes: CommitNode[];
                    };
                };
            } | null;
        } | null;
    }

    const contributors: GitHubContributor[] = [];
    const seenIds = new Set<number>();
    let cursor: string | null = null;
    let pages = 0;
    const maxPages = 10; // Examine up to 1000 commits

    while (contributors.length < limit && pages < maxPages) {
        const result: QueryResult | null = await graphql<QueryResult>(query, {
            owner,
            name,
            first: 100,
            after: cursor,
        });

        if (!result?.repository?.defaultBranchRef?.target) break;

        const history: QueryResult['repository'] extends { defaultBranchRef: { target: { history: infer H } } | null } | null ? H : never = result.repository.defaultBranchRef.target.history;

        for (const commit of history.nodes) {
            const user = commit?.author?.user;
            if (!user || seenIds.has(user.databaseId)) continue;

            seenIds.add(user.databaseId);
            contributors.push({
                githubId: user.databaseId,
                username: user.login,
                commits: 1,
            });

            if (contributors.length >= limit) break;
        }

        if (!history.pageInfo.hasNextPage) break;
        cursor = history.pageInfo.endCursor;
        pages++;
    }

    return contributors;
}

export interface Developer {
    githubId: number;
    username: string;
}

export interface Repository {
    githubId: number;
    name: string;
}

export interface ContributionFacts {
    totalCommits: number;
    linesAdded: number;
    primaryLanguage: string;
}

export interface PathStep {
    type: 'developer' | 'repository';
    developer?: Developer;
    repository?: Repository;
    facts?: ContributionFacts;
}

export interface CalculateResponse {
    number: number;
    path: PathStep[];
    username: string;
}

export interface CalculateErrorResponse {
    error: string;
}

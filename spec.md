# Project Specification: Thorvalds Number

## 1. Overview
The **Thorvalds Number** is a web application that calculates the "degrees of separation" between any GitHub user and **Linus Torvalds** based on shared repository contributions.

## 2. Technical Stack
- **Database:** Neo4j (Graph Database), hosted on Neo4j Aura or self-hosted.
- **Data Ingestion:** Python scripts (GitHub REST/GraphQL API).
- **Web Application:** **Next.js** (TypeScript) deployed to **Vercel**.
    - Uses the App Router (`/app` directory).
    - API Routes handle Neo4j queries via the `neo4j-driver` package.
    - Server-side rendering (SSR) for optimal performance and SEO.

## 3. Data Model
The graph is designed to find paths between developers via their shared work.

### Nodes
- **Developers:** Represent individuals.
    - `github_id` (Unique Identifier/Long): Primary key for identification.
    - `username` (String): Used for display and initial search.
- **Repositories:** Represent the projects.
    - `github_id` (Unique Identifier/Long).
    - `name` (String).

### Relationships
- **CONTRIBUTED_TO:** A directed relationship from a Developer to a Repository.
- **Properties (Facts):** Snapshots captured at the time of ingestion (not updated).
    - `total_commits`: Number of commits by this developer to this repo.
    - `lines_added`: Total lines of code added.
    - `primary_language`: Main language used by the developer in this repo.

## 4. Guiding Principles (Dos and Don'ts)

### Dos
- **Undirected Pathfinding:** While relationships are stored as directed (Dev -> Repo), the pathfinding logic must treat the graph as undirected to find links between developers sharing a repository.
- **Defining the "Number":** The Thorvalds Number is defined as the total number of Repository nodes in the shortest path between the user and Linus Torvalds.
- **Crawler Stop Condition:** The ingestion script must stop once the database reaches 200,000 nodes (combined total of Developers and Repositories).
- **Prioritize Quality Data:** Use BFS starting from `torvalds`. Filter for repositories with at least 1,000 stars.
- **Visual Path Logic:** UI must display the sequence: `User -> [Facts] -> Repo -> [Facts] -> User...` until `torvalds`.
- **Tie-breaking:** Use the first shortest path returned by the Neo4j engine.

### Don'ts
- **No Micro-Crawls:** Only search against the existing 200k node database.
- **No Updates:** Relationship "facts" are snapshots; do not spend API quota updating existing edges.
- **No Complex Queries:** Stick to standard shortest-path algorithms.

## 5. Components

### A. Python Ingestion Script (`ingest.py`)
- **Responsibility:** Populate the graph using BFS and star-filtering.
- **ID Management:** Use GitHub's internal unique ID to handle renames or multiple aliases.

### B. Next.js Application

#### API Routes (`/app/api/`)
- **`POST /api/calculate`**: Receives a username, queries Neo4j for the shortest path, returns JSON with path data.
- **`GET /api/health`**: Health check endpoint.

#### Neo4j Integration (`/lib/neo4j.ts`)
- Singleton driver instance using `neo4j-driver`.
- Helper functions for executing Cypher queries.
- Connection pooling handled by the driver.

#### Pages (`/app/`)
- **`/`**: Home page with search input for GitHub username.
- **`/result/[username]`**: Dynamic route displaying the path visualization.

#### Components (`/components/`)
- **`SearchForm`**: Input field with submit handling.
- **`PathVisualization`**: Renders the developer-repo-developer chain.
- **`DeveloperNode`**: Displays developer information with GitHub avatar.
- **`RepositoryNode`**: Displays repository information with contribution facts.
- **`NumberDisplay`**: Shows the calculated Thorvalds Number prominently.

#### Styling
- Use **Tailwind CSS** or **CSS Modules** for styling.
- Dark mode support recommended.

## 6. Environment Variables

### Vercel Environment Variables
```
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
```

### Local Development (`.env.local`)
Same variables as above for local development with `npm run dev`.

## 7. Deployment Architecture
- **Web Application:** Single Next.js project deployed to Vercel.
- **Database:** Neo4j Aura (managed) or self-hosted Neo4j with public access.
- **Ingestion:** Python scripts run locally or via CI/CD to populate the database.

```
┌─────────────────────────────────────────────────┐
│                    Vercel                       │
│  ┌───────────────┐    ┌───────────────────┐    │
│  │   Next.js     │    │   API Routes      │    │
│  │   Frontend    │───▶│   (Serverless)    │    │
│  └───────────────┘    └─────────┬─────────┘    │
└─────────────────────────────────┼───────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │   Neo4j Aura   │
                         │   (Database)   │
                         └────────────────┘
                                  ▲
                                  │
                         ┌────────────────┐
                         │ Python Script  │
                         │  (Ingestion)   │
                         └────────────────┘
```

## 8. Implementation Plan
1. **Infrastructure:** Set up Neo4j Aura instance (or Dockerize Neo4j for local dev).
2. **Scripting:** Develop `ingest.py` with BFS, 1k star filter, and 200k node limit.
3. **Next.js Setup:** Initialize Next.js project with TypeScript and App Router.
4. **Neo4j Integration:** Create driver singleton and query helpers.
5. **API Routes:** Implement `/api/calculate` with undirected `shortestPath` query.
6. **UI Development:** Build search interface and path visualization components.
7. **Styling:** Apply modern, responsive design with dark mode.
8. **Deployment:** Deploy to Vercel, configure environment variables.
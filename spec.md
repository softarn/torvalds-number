# Project Specification: Thorvalds Number

## 1. Overview
The **Thorvalds Number** is a web application that calculates the "degrees of separation" between any GitHub user and **Linus Torvalds** based on shared repository contributions.

## 2. Technical Stack
- **Database:** Neo4j (Graph Database).
- **Data Ingestion:** Python scripts (GitHub REST/GraphQL API).
- **Backend:** Java 21 (Spring Boot).
    - Use **Records** for DTOs.
    - If Database Entities cannot be mapped to Records by the chosen library, use standard Classes.
    - **Strictly no Lombok.**
- **Frontend:** **HTMX** with a Java-based template engine (e.g., Thymeleaf).

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
- **No Lombok:** Maintain standard Java POJOs/Classes or Records.
- **No Complex Queries:** Stick to standard shortest-path algorithms.

## 5. Components

### A. Python Ingestion Script (`ingest.py`)
- **Responsibility:** Populate the graph using BFS and star-filtering.
- **ID Management:** Use GitHub's internal unique ID to handle renames or multiple aliases.

### B. Java Backend
- **Services:**
    - `GraphService`: Executes undirected pathfinding. Returns a DTO containing the ordered list of nodes and relationships.
- **Endpoints:**
    - `POST /calculate`: Receives a username, finds the `github_id`, and returns the HTML fragment for the path.

### C. HTMX Logic
- **Interactions:** Uses `hx-post` for searches. Iterates over the path to render the developer-repo-developer chain.

## 6. Implementation Plan
1. **Infrastructure:** Dockerize Neo4j.
2. **Scripting:** Develop `ingest.py` with BFS, 1k star filter, and 200k node limit.
3. **Core:** Initialize Java Spring Boot project.
4. **Integration:** Connect Java to Neo4j; implement undirected `shortestPath` query.
5. **Hypermedia:** Build the HTMX interface for path visualization.
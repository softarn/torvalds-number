# Thorvalds Number

Calculate your "degrees of separation" from Linus Torvalds through shared GitHub repository contributions.

## Quick Start

### 1. Start Neo4j

```bash
docker-compose up -d
```

Access Neo4j Browser at http://localhost:7474 (credentials: `neo4j`/`thorvalds`)

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your GitHub token
```

### 3. Run Ingestion (Python)

```bash
cd scripts
pip install -r requirements.txt
python ingest.py
```

### 4. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Open http://localhost:8080

## Project Structure

```
├── docker-compose.yml    # Neo4j infrastructure
├── scripts/              # Python ingestion
│   └── ingest.py
└── backend/              # Spring Boot + HTMX
```

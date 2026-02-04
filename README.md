# Torvalds Number

Calculate your "degrees of separation" from Linus Torvalds through shared GitHub repository contributions.

> 🎯 **Developed using Spec Driven Development (SDD)** at [JFokus 2026](https://www.jfokus.se/), inspired by sessions on SDD and Neo4j.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Neo4j credentials:
```
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Data Ingestion

The Python scripts populate Neo4j with GitHub contribution data:

```bash
cd scripts
pip install -r requirements.txt
python ingest.py
```

For local Neo4j (optional):
```bash
docker-compose up -d
```
Access Neo4j Browser at http://localhost:7474 (credentials: `neo4j`/`thorvalds`)

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (serverless)
│   │   │   ├── calculate/
│   │   │   └── health/
│   │   └── result/[username]/
│   ├── components/       # React components
│   └── lib/              # Neo4j driver & types
├── scripts/              # Python ingestion
│   └── ingest.py
└── docker-compose.yml    # Local Neo4j
```

## Deployment

Deploy to Vercel:
1. Connect your GitHub repository
2. Add environment variables: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
3. Deploy

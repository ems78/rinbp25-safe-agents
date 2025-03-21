# SafeAgents

SafeAgents is a platform designed for security testing of AI agents, with a focus on identifying and mitigating prompt injection attacks and data leakage vulnerabilities. The system creates a controlled environment where AI agents can be tested against a curated database of attack patterns, while using network analysis techniques to map basic relationships between vulnerabilities and attack vectors.

## Core Features

- Basic AI agent security testing functionality
- Attack pattern database with MongoDB
- Vulnerability relationship mapping with Neo4j
- Essential reporting and analytics
- Sandboxed test execution with Daytona
- Basic UI for system interaction
- Fundamental graph analysis for vulnerability relationships

## Optional Features

- Complex AI security testing algorithms (multi-step attack simulation, advanced AI evasion techniques)
- Advanced graph algorithms (community detection, attack path traversal)
- Advanced UI/UX features
- Scalability and performance optimization
- Distributed architecture
- Complex monitoring stacks

## Tech Stack

### Backend
- Node.js with Express and TypeScript
- MongoDB for document storage
- Neo4j for graph database

### Frontend
- React with TypeScript

### Databases
- MongoDB (Attack patterns and test results)
- Neo4j (Vulnerability relationships)

### Analysis Tools
- NetworkX
- Neo4j Graph Algorithms
- D3.js for visualization

### Infrastructure
- Docker
- Daytona for sandboxed environments
- GitHub Actions for CI/CD

## Prerequisites

- Node.js (latest LTS version)
- Docker
- MongoDB
- Neo4j
- Daytona CLI

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/safe-agents.git
cd safe-agents
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start all services (including Python analysis service):
```bash
docker compose up
```

## Development

1. Start the backend services:
```bash
cd backend
npm install
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm install
npm run dev
```

Note: The Python analysis service runs in a Docker container and is started automatically with `docker compose up`.

## Testing

Basic testing can be run using:
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Project Structure

```
safe-agents/
├── backend/           # Node.js Express backend with TypeScript
│   ├── src/          # Source code
│   ├── dist/         # Compiled JavaScript
│   └── tests/        # Test files
├── frontend/         # React frontend with TypeScript
├── analysis/         # Python analysis services
│   ├── service.py    # Main analysis service
│   └── utils/        # Analysis utilities
├── docs/            # Documentation
└── docker/          # Docker configurations
```

## Documentation

- [Functional & Technical Specification](SPECS.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Testing Guide](docs/TESTING.md)

## Contributing

This is a university project developed as part of coursework covering NoSQL databases and network analysis.

## License

[MIT License](LICENSE)

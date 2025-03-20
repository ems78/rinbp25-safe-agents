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
- Node.js with Express
- Python for analysis components

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
- Python 3.8+
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

2. Install backend dependencies:
```bash
# Python dependencies
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Node.js dependencies
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the databases:
```bash
docker-compose up -d mongodb neo4j
```

## Development

1. Start the backend services:
```bash
# Start Node.js server
cd backend
npm run dev

# Start Python analysis service
cd analysis
python service.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

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
├── backend/           # Node.js Express backend
├── analysis/          # Python analysis services
├── frontend/          # React frontend
├── docker/            # Docker configurations
├── daytona/           # Daytona environment configs
├── docs/              # Documentation
└── test/              # Integration tests
```

## Documentation

- [Functional & Technical Specification](SPECS.md)
- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Testing Guide](docs/TESTING.md)

## Contributing

This is a university project developed as part of coursework covering NoSQL databases and network analysis.

## License

[MIT License](LICENSE)


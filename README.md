# TypeScript Dependency Analyzer

A service for analyzing TypeScript file dependencies using custom analysis and Gemini LLM.

## Project Structure

```
.
├── files_from_git/     # contains the 4 ts files for testesting files given by the task
├── src/                    #contains all the modules for solving the task
│   ├── server.ts               # Handles the API requests
│   ├── scraping_functions.ts   # Functions which get the file, and scrape the imports and exports
│   ├── my_analyzator.ts        # Custom function for analyzing
│   └── gemini.ts              # Gemini API integration
├── results/                   #The folder which gives saves JSON files as an output from the two types of analyzing the TS files. Each output is saved by an ID in each subfolder depends from the type of analysis called. 
│   ├── LLM_analyze/           # Gemini analysis outputs
│   └── myanalyze/            # Custom analysis outputs
└── config files
    ├── package.json
    ├── package-lock.json 
    ├── tsconfig.json
    └── env.example            # API key configuration template
```

## Getting Started

### Prerequisites
- Node.js installed
- Google API key for Gemini

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

3. Install dependencies:
```bash
npm install
```

4. Start the service:
```bash
npm run dev
```

### Usage

Test the API endpoints:

```bash
# Run Gemini analysis
curl -X POST http://localhost:3000/api/version1/analyze \
  -H "Content-Type: application/json" \
  -d '{"folders": ["/service_app/files_from_git"]}'

# Run custom analysis
curl -X POST http://localhost:3000/api/version1/myanalyze \
  -H "Content-Type: application/json" \
  -d '{"folders": ["/service_app/files_from_git"]}'

# Retrieve results
curl http://localhost:3000/results/940f5b80-ce3a-475d-8836-16acf7af6959
```

## Notes:
- It's my first time writting in this languages, so i don't know if there are some naming conventions or rules.
- I should have made more tests to test my solution, but i didn't.
- Despite being able to retrieve diff extensions, there are imports (like require, ...) which are in legacy/older versions code of js, which i haven't covered as case.
- Despite my first time writing in ts, it wasn't so bad as i thought it will be.
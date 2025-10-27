Structure:

- /files_from_git/ - contains the 4 test .ts files given by the task
- /src/ - contains all the modules for solving the task
    1. server.ts - Handles the API requests
    2. scraping_functions.ts - Functions which get the file, and scrape the imports and exports
    3. my_analyzator.ts - Custom function for analyzing
    4. gemini.ts - the gemini module which handles the gemini api; creates the prompt and clears the output in "structured" way. 
- /results/ - The folder which gives saves JSON files as an output from the two types of analyzing the TS files. Each output is saved by an ID in each subfolder.
    1. /LLM_analyze/ - stores the outputs from the GEMINI prompt.
    2. /myanaluze/ - stores the outputs from custom approach for calculating the dependencies.
- {package, package-lock, tsconfig}.json - configuration files for setting up the enviroment for the solution
- env.example - Example of how i set up the API key in .env file for this solution. (If we are in production env is good, but otherwise not a good choice)


How to run the solution:
1. Clone this repository with git clone. 
2. Set up the GOOGLE_API_KEY in .env.example with your personal one. Plus change .env.example to .env.
3. Install dependecies with npm install.
3. Start the solution with npm run dev.
4. Test with the following commands: 
    - curl -X POST http://localhost:3000/api/version1/analyze   -H "Content-Type: application/json"   -d '{"folders": ["/service_app/files_from_git"]}'
    - curl -X POST http://localhost:3000/api/version1/myanalyze   -H "Content-Type: application/json"   -d '{"folders": ["/service_app/files_from_git"]}'

    If it was successfull, the results are stored in the results folder. We can retrieve them by
    - curl http://localhost:3000/results/940f5b80-ce3a-475d-8836-16acf7af6959



Other Notes:
- It's my first time writting in this languages, so i don't know if there are some naming conventions or rules.
- I should have made more tests to test my solution, but i didn't.
- Despite being able to retrieve diff extensions, there are imports (like require, ...) which are in legacy/older versions code of js, which i haven't covered as case.
- Despite my first time writing in ts, it wasn't so bad as i thought it will be.
import express from "express";
import { my_analyzing_function } from "./my_analyzator.js";
import { analyzeFolders } from "./scraping_functions.js";
import { analyzeDependecies } from "./gemini.js"
import {v4 as uuidv4 } from "uuid";
import fs, { stat } from "fs";
import path from "path";

const app = express();

app.use(express.json());

const RESULTS_DIR = path.resolve("results");
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR);
}


app.post("/api/version1/analyze", async (req, res) => {
    try {
        const {folders} = req.body;
        if(!folders || !Array.isArray(folders)){
            return res.status(400).json({error: "Invalid 'folders' parameter"});
        }
        console.log("Analyzing folders:", folders);
        const analysisData = analyzeFolders(folders);

        console.log("Sending data to Gemini");
        const geminiResponse = await analyzeDependecies(analysisData);
        
        const analysisId = uuidv4(); // We assign each analysis a unique ID in this module (alternative to doing it in gemini.ts, but if 
        // we do it there, we can't know it here to save the file with that name and then see the results of the operation even if Gemini call fails)

        const resultData = {
            id: analysisId,
            timestamp: new Date().toISOString(),
            dependencies: analysisData,
            geminiAnalysis: JSON.parse(geminiResponse),
        };

        const llmDir = path.join(RESULTS_DIR, "LLM_analyze");
        if (!fs.existsSync(llmDir)) {
            fs.mkdirSync(llmDir, { recursive: true });
        }

        const filePath = path.join(llmDir, `${analysisId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2), "utf-8");
        console.log(`Analysis saved to: ${filePath}`);

        res.json({
            status: "success",
            id: analysisId,
            message: "Succesfully completed",
            resultFile: filePath,
            data: resultData,
        });

    } catch (error) {
        console.error("Error during analysis:", error);
        res.status(500).json({error: "Internal server error"});
    }
    
});

app.get("/results/:id", (req, res) => {
    const { id } = req.params;
    const possiblePaths = [ path.resolve(RESULTS_DIR, "LLM_analyze", `${id}.json`), path.resolve(RESULTS_DIR, "myanalyze", `${id}.json`)];

    const resultPath = possiblePaths.find(p => fs.existsSync(p));

    if(!resultPath){
        return res.status(404).json({error: "Analysis result not found"});
    }
    
    try{
        const data = JSON.parse(fs.readFileSync(resultPath, "utf-8"));
        res.json({status: "success", source: path.basename(path.dirname(resultPath)), data,});
    }
    catch(error){
        console.error("Error reading analysis result:", error);
        res.status(500).json({error: "Error reading analysis result"});
    }
});

app.post("/api/version1/myanalyze", (req, res) => {
  try {
    const { folders } = req.body;
    if (!folders || !Array.isArray(folders)) 
      return res.status(400).json({ error: "Invalid 'folders'" });

    const scrapedData = analyzeFolders(folders);

    const analysisResult = my_analyzing_function(scrapedData);
    const analysisId = uuidv4();

    const myAnalyzeDir = path.join(RESULTS_DIR, "myanalyze");
    if (!fs.existsSync(myAnalyzeDir)) fs.mkdirSync(myAnalyzeDir, { recursive: true });
    const resultData = {
      id: analysisId,
      timestamp: new Date().toISOString(),
      folders,
      analysis: analysisResult,
    };

    const filePath = path.join(myAnalyzeDir, `${analysisId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2), "utf-8");
    console.log(`Programmatic analysis saved to: ${filePath}`);

    res.json({
      status: "success",
      id: analysisId,
      message: "Programmatic analysis completed",
      resultFile: filePath,
      data: resultData,
    });
  } catch (error) {
    console.error("Error during programmatic analysis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
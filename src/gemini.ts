import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv  from "dotenv";
import fs from "fs";
import path from "path";

function cleanTheOutputFromGemini(text: string): string {
    const jsonCorrectness = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if(jsonCorrectness){
        return jsonCorrectness[1].trim();
    }
    return text.replace(/```/g, "").trim();

}

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function analyzeDependecies(dependecies: Record<string, any>) {
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const prompt = `
    You are a TypeScript dependency analyzer.

    Given the following files and their import/export lines:

    Task:
    1. Classify all imports by type:
      - named imports (import { ... } from ...)
      - default imports (import Foo from ...)
      - namespace imports (import * as Foo from ...)
      - type-only imports (import type { ... } from ...)
      - side-effect imports (import './file')
    2. Classify all exports by type:
      - named exports (export const / function / class ...)
      - default exports (export default ...)
      - re-exports/aggregation (export { ... } from './file')
      - type-only exports (export type / interface / enum ...)
    3.Detect circular dependencies between files.
    4.Suggest refactoring recommendations for tightly coupled modules or possible redundant imports/exports.
    5.Return a JSON strictly following this structure:

    {
      "files": {
        "path/to/file.ts": {
          "imports": {
            "named": [string],
            "default": [string],
            "namespace": [string],
            "type_only": [string],
            "side_effect": [string]
          },
          "exports": {
            "named": [string],
            "default": [string],
            "re_exports": [string],
            "type_only": [string]
          },
          "issues": [string],
          "metrics": {
            "import_count": number,
            "export_count": number,
            "complexity_score": number
          }
        }
      },
      "summary": {
        "total_files": number,
        "total_external_dependencies": number,
        "circular_dependencies_detected": number
      }
    }

    Return only valid JSON.
    Here is the input data:
    ${JSON.stringify(dependecies, null, 2)}
  `;

    const result = await model.generateContent(prompt);
    let responseTextFromResult = result.response.text();

    responseTextFromResult = cleanTheOutputFromGemini(responseTextFromResult);

    const outputPath = path.resolve("gemini_analysis_output.json");
    fs.writeFileSync(outputPath, responseTextFromResult, "utf-8");
    console.log(`Gem analysis is saved to: ${outputPath}`);

    return responseTextFromResult
}
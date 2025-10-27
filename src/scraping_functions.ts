import * as fs from "fs"
import * as path from "path"
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"]

function getAllFiles(dir: string): string[] {
    const entries =  fs.readdirSync(dir, { withFileTypes: true })
    return entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            return getAllFiles(fullPath)
        } else if (EXTENSIONS.includes(path.extname(entry.name))) {
            return [fullPath]
        } else {
            return []
        }
    });
}
// Function for screping lines by regex ( not used)
function scrape_importing_lines(fileContent: string): string[] {
    const importReget = /import\s+(?:[\w*\s{},]+from\s+)?["']([^"']+)["'];?/g;

    const matches: string[] = [];

    let match;
    while ((match = importReget.exec(fileContent)) !== null) {
        matches.push(match[1]);
    }

    return matches;
}

function scrape_imported_lines(fileContent: string): string[] {
  const lines = fileContent.split(/\r?\n/);
  return lines.filter((line) => line.trim().startsWith("import")).map((line) => line.trim().replace(/^import\s+/, "").trim());
}

function scrape_exported_lines(fileContent: string): string[] {
  const lines = fileContent.split(/\r?\n/);
  return lines.filter((line) => line.trim().startsWith("export")).map((line) => line.trim().replace(/^export\s+/, "").trim());
}


export function analyzeFolders(folders: string[]): Record<string, { imports: string[]; exports: string[] }> {
  const results: Record<string, { imports: string[]; exports: string[] } > = {};

  const projectRoot = path.resolve(process.cwd(), "..");

  for (const folder of folders) {
    const absFolder = path.resolve(projectRoot, folder);
    if (!fs.existsSync(absFolder)) {
      console.error("Folder does not exist:", absFolder);
      continue;
    }

    const files = getAllFiles(absFolder);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const imports = scrape_imported_lines(content);
      const exports = scrape_exported_lines(content);
      console.log(`Analyzed file:  ${file}, Imports: ${imports}, Exports: ${exports}`);
      results[file] = { imports, exports };
    }
  }

  return results;
}
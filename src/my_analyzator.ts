import path from "path";

type FileAnalysis = {
  imports: {
    named: string[];
    default: string[];
    namespace: string[];
    type_only: string[];
    side_effect: string[];
  };
  exports: {
    named: string[];
    default: string[];
    re_exports: string[];
    type_only: string[];
  };
  issues: string[];
  metrics: {
    import_number: number;
    export_number: number;
    complexity_score: number;
  };
};

type AnalysisResult = {
  files: Record<string, FileAnalysis>;
  summary_report: {
    total_files: number;
    total_external_dependencies: number;
    circular_dependencies_detected: number;
  };
};

export function my_analyzing_function(data: Record<string, { imports: string[]; exports: string[] }>): AnalysisResult {
  const files: Record<string, FileAnalysis> = {};
  const internalGraph: Record<string, string[]> = {};
  const externalSet = new Set<string>();

  for (const [file, content] of Object.entries(data)) {
    const imports = {
      named: [] as string[],
      default: [] as string[],
      namespace: [] as string[],
      type_only: [] as string[],
      side_effect: [] as string[],
    };
    const exports = {
      named: [] as string[],
      default: [] as string[],
      re_exports: [] as string[],
      type_only: [] as string[],
    };
    const issues: string[] = [];

    for (const imp of content.imports) {
      if (/^type\s+{/.test(imp)) imports.type_only.push(imp);
      else if (/^\{.*\}/.test(imp)) imports.named.push(imp);
      else if (/^\*\s+as/.test(imp)) imports.namespace.push(imp);
      else if (/^['"].*['"]$/.test(imp)) imports.side_effect.push(imp);
      else imports.default.push(imp);

      if (!imp.startsWith(".") && !imp.startsWith("/")) externalSet.add(imp);
    }

    for (const exp of content.exports) {
      if (/^default /.test(exp)) exports.default.push(exp);
      else if (/^{.*} from /.test(exp)) exports.re_exports.push(exp);
      else if (/^(type|interface|enum) /.test(exp)) exports.type_only.push(exp);
      else exports.named.push(exp);
    }

    internalGraph[file] = content.imports.filter((i) => i.startsWith(".") || i.startsWith("/"));


    const import_number = content.imports.length;
    const export_number = content.exports.length;
    const complexity_score = import_number + export_number + internalGraph[file].length;

    files[file] = {
      imports,
      exports,
      issues,
      metrics: { import_number, export_number, complexity_score },
    };
  }

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};

  function dfs_algo(file: string): boolean {
    if (!visited[file]) {
      visited[file] = true;
      recStack[file] = true;

      for (const neighbor of internalGraph[file] || []) {
        const resolvedNeighbor = path.resolve(path.dirname(file), neighbor);
        if (!visited[resolvedNeighbor] && dfs_algo(resolvedNeighbor)) return true;
        else if (recStack[resolvedNeighbor]) {
          files[file].issues.push(`There is a cycle dependency involving ${resolvedNeighbor}`);
          return true;
        }
      }
    }
    recStack[file] = false;
    return false;
  }

  let circularCount = 0;
  for (const file of Object.keys(files)) {
    if (dfs_algo(file)) circularCount++;
  }

  for (const [file, fdata] of Object.entries(files)) {
    if ((fdata.metrics.complexity_score || 0) > 10) {
      fdata.issues.push("It's very complex / It's tightly coupled module");
    }
  }

  const summary_report = {
    total_files: Object.keys(files).length,
    total_external_dependencies: externalSet.size,
    circular_dependencies_detected: circularCount,
  };

  return { files, summary_report };
}

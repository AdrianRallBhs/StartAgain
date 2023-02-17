// import { info } from "@actions/core";

// export class Graph {
//     vertices: any[];
//     adjacent: any[];
//     edges: number;

//     constructor() {
//         this.vertices = [];
//         this.adjacent = [];
//         this.edges = 0;
//     }

//     addVertex(v: any) {
//         this.vertices.push(v);
//         this.adjacent[v] = [];
//     }

//     addEdge(v: any, w: any) {
//         this.adjacent[v].push(w);
//         this.adjacent[w].push(v);
//         this.edges++;
//     }

//     getVertices() {
//         return this.vertices;
//     }
    
//     getAdjazent() {
//         return this.adjacent
//     }


//     topoSort(v:any = this.vertices, discovered?: boolean[], s?: any) {
//         const stack = s || [];
//         // v = this.vertices;
//         let adj = this.adjacent;
//             if (typeof discovered !== 'undefined') {
//                 discovered[v] = true;

//                 for (let i = 0; i < adj[v].length; i++) {
//                     let w = adj[v][i];

//                     if (!discovered[w]) {
//                         this.topoSort(w, discovered, stack);
//                     }
//                 }
//             }
        
//         stack.unshift(v);
//         return stack || false;
//     }
// }


import { info } from "@actions/core";

export class Graph {
    vertices: string[];
    adjacent: { [key: string]: string[] };
    edges: number;
  
    constructor() {
      this.vertices = [];
      this.adjacent = {};
      this.edges = 0;
    }
  
    addVertex(v: string) {
      this.vertices.push(v);
      this.adjacent[v] = [];
    }
  
    addEdge(v: string, w: string) {
      this.adjacent[v].push(w);
      this.edges++;
    }
  
    getVertices() {
      return this.vertices;
    }
  
    getAdjacent() {
      return this.adjacent;
    }
  
    topologicalSort(): string[] {
      const visited: { [key: string]: boolean } = {};
      const stack: string[] = [];
  
      for (const vertex of this.vertices) {
        if (!visited[vertex]) {
          if (!this.dfs(vertex, visited, stack, [])) {
            return [];
          }
        }
      }
  
      return stack.reverse();
    }
  
    dfs(vertex: string, visited: { [key: string]: boolean }, stack: string[], cycle: string[]): boolean {
      visited[vertex] = true;
      cycle.push(vertex);
  
      for (const neighbor of this.adjacent[vertex]) {
        if (!visited[neighbor]) {
          if (!this.dfs(neighbor, visited, stack, cycle)) {
            return false;
          }
        } else if (cycle.includes(neighbor)) {
          return false;
        }
      }
  
      cycle.pop();
      stack.push(vertex);
      return true;
    }
  }
  

export class OutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;

  constructor(name: string, current: string, wanted: string, latest: string) {
    this.name = name;
    this.current = current;
    this.wanted = wanted;
    this.latest = latest;
  }
}

export async function processOutdatedPackages(
  outdatedPackages: OutdatedPackage[],
  projectDependencies: Map<string, string[]>
): Promise<string[]> {
  const graph = new Graph();

  for (const [project, dependencies] of projectDependencies) {
    graph.addVertex(project);
    for (const dep of dependencies) {
      const depPackage = outdatedPackages.find((p) => p.name === dep);
      if (depPackage) {
        graph.addVertex(depPackage.name);
        graph.addEdge(project, depPackage.name);
      }
    }
  }

  const topoSorted = graph.topologicalSort();
  if (topoSorted.length === 0) {
    throw new Error("Cycle detected in dependencies");
  }

  const plantumlString = topoSorted.map((v) => `"${v}"`).join(" -> ");

  return [plantumlString];
}

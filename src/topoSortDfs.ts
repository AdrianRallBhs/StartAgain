import { info } from "@actions/core";

export class Graph {
    vertices: any[];
    adjacent: any[];
    edges: number;

    constructor() {
        this.vertices = [];
        this.adjacent = [];
        this.edges = 0;
    }

    addVertex(v: any) {
        this.vertices.push(v);
        this.adjacent[v] = [];
    }

    addEdge(v: any, w: any) {
        this.adjacent[v].push(w);
        this.adjacent[w].push(v);
        this.edges++;
    }

    getVertices() {
        return this.vertices;
    }
    
    getAdjazent() {
        return this.adjacent
    }


    topologicalSort(v:any = this.vertices, discovered?: boolean[], s?: any) {
        const stack = s || [];
        // v = this.vertices;
        let adj = this.adjacent;
            if (typeof discovered !== 'undefined') {
                discovered[v] = true;

                for (let i = 0; i < adj[v].length; i++) {
                    let w = adj[v][i];

                    if (!discovered[w]) {
                        this.topologicalSort(w, discovered, stack);
                    }
                }
            }
        
        stack.unshift(v);
        return stack || false;
    }
}


// import { info } from "@actions/core";
// import { OutdatedPackage } from "./dotnet-command-manager";

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
//         this.edges++;
//     }

//     getVertices() {
//         return this.vertices;
//     }

//     hasCycle() {
//         const visited = new Set<any>();
//         const recStack = new Set<any>();

//         for (let i = 0; i < this.vertices.length; i++) {
//             if (this.hasCycleHelper(this.vertices[i], visited, recStack)) {
//                 return true;
//             }
//         }

//         return false;
//     }

//     hasCycleHelper(v: any, visited: Set<any>, recStack: Set<any>) {
//         if (!visited.has(v)) {
//             visited.add(v);
//             recStack.add(v);

//             for (let i = 0; i < this.adjacent[v].length; i++) {
//                 const w = this.adjacent[v][i];

//                 if (!visited.has(w) && this.hasCycleHelper(w, visited, recStack)) {
//                     return true;
//                 } else if (recStack.has(w)) {
//                     return true;
//                 }
//             }
//         }

//         recStack.delete(v);

//         return false;
//     }

//     topologicalSort(): any[] {
//         const stack: any[] = [];
//         const visited = new Set<any>();

//         for (let i = 0; i < this.vertices.length; i++) {
//             if (!visited.has(this.vertices[i])) {
//                 this.topoSortHelper(this.vertices[i], visited, stack, new Set<any>());
//             }
//         }

//         return stack.reverse();
//     }

//     topoSortHelper(v: any, visited: Set<any>, stack: any[], recStack: Set<any>) {
//         visited.add(v);
//         recStack.add(v);

//         for (let i = 0; i < this.adjacent[v].length; i++) {
//             const w = this.adjacent[v][i];

//             if (!visited.has(w)) {
//                 this.topoSortHelper(w, visited, stack, recStack);
//             } else if (recStack.has(w)) {
//                 const cycleIndex = stack.indexOf(w);

//                 if (cycleIndex !== -1) {
//                     stack.splice(cycleIndex, stack.length - cycleIndex);
//                 }
//             }
//         }

//         recStack.delete(v);
//         stack.push(v);
//     }
// }
  

// export async function processOutdatedPackages(
//     outdatedPackages: OutdatedPackage[],
//     projects: string[]
//   ): Promise<string[]> {
//     const graph = new Graph();
//     const map = new Map<string, Set<string>>();
  
//     for (const project of projects) {
//       graph.addVertex(project);
//     }
  
//     for (const outdatedPackage of outdatedPackages) {
//       const dependencies = await getNugetDependencies(outdatedPackage.name, outdatedPackage.current);
//       const dependentProjects = projects.filter((project) => {
//         const projectDependencies = map.get(project) || new Set();
//         return dependencies.some((dep) => projectDependencies.has(dep));
//       });
  
//       for (const dependentProject of dependentProjects) {
//         graph.addEdge(dependentProject, outdatedPackage);
//       }
  
//       map.set(outdatedPackage, new Set(dependentProjects));
//     }
  
//     const sortedProjects = graph.topologicalSort();
  
//     return sortedProjects;
//   }
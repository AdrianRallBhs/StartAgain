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
// import { OutdatedPackage } from './dotnet-command-manager'

// export class Graph {
//     vertices: { [key: string]: any };
//     adjacent: { [key: string]: any[] };
//     edges: number;

//     constructor() {
//         this.vertices = {};
//         this.adjacent = {};
//         this.edges = 0;
//     }

//     addVertex(v: string) {
//         this.vertices[v] = true;
//         this.adjacent[v] = [];
//     }

//     addEdge(v: string, w: string) {
//         this.adjacent[v].push(w);
//         this.edges++;
//     }

//     getVertices() {
//         return Object.keys(this.vertices);
//     }

//     getAdjacent() {
//         return this.adjacent;
//     }

//     //Topological sorting with Depth-first search
//     topologicalSort(v: any = this.vertices, discovered?: boolean[], s?: any) {
//         const stack = s || [];
//         // v = this.vertices;
//         let adj = this.adjacent;
//         if (typeof discovered !== 'undefined') {
//             discovered[v] = true;

//             for (let i = 0; i < adj[v].length; i++) {
//                 let w = adj[v][i];

//                 if (!discovered[w]) {
//                     this.topologicalSort(w, discovered, stack);
//                 }
//             }
//         }

//         stack.unshift(v);
//         return stack || false;
//     }
// }



// // Type Map 
// type PackageVersionMap = { [packageName: string]: string[] };

// // [DependencyName: CurrentDependencyVersion]
// // Input parameter: Collection of the OutdatedPackages
// export function buildPackageVersionMap(dependencies: OutdatedPackage[]): PackageVersionMap {
//     const map: PackageVersionMap = {};

//     for (const dep of dependencies) {
//         if (!(dep.name in map)) {
//             map[dep.name] = [];
//         }
//         map[dep.name].push(dep.current);
//     }

//     return map;
// }

// //Returns PorjectName with his packageversion
// export function createUniqueVertices(graph: Graph, project: string, packageVersions: string[]) {
//     for (const packageVersion of packageVersions) {
//         const vertexName = `${project} ${packageVersion}`;
//         graph.addVertex(vertexName);
//     }
// }


// export function addDependencyEdges(graph: Graph, project: string, packageVersions: string[], dependencies: PackageVersionMap) {
//     for (const [packageName, packageVersionsUsed] of Object.entries(dependencies)) {
//         for (const packageVersionUsed of packageVersionsUsed) {
//             const vertexNameUsed = `${project} ${packageVersionUsed}`;
//             graph.addEdge(vertexNameUsed, packageName);

//             for (const packageVersion of packageVersions) {
//                 if (compareVersions(packageVersion, packageVersionUsed) >= 0) {
//                     const vertexName = `${project} ${packageVersion}`;
//                     graph.addEdge(vertexName, vertexNameUsed);
//                 }
//             }
//         }
//     }
// }

// export function buildModuleDependencyGraph(projects: string[], dependencies: OutdatedPackage[]): Graph {
//     const graph = new Graph();
//     const packageVersionMap = buildPackageVersionMap(dependencies);

//     for (const project of projects) {
//         const packageVersions = packageVersionMap[project];
//         if (packageVersions) {
//             createUniqueVertices(graph, project, packageVersions);
//             addDependencyEdges(graph, project, packageVersions, packageVersionMap);
//         } else {
//             graph.addVertex(project);
//         }
//     }

//     return graph;
// }

// // A simple implementation of version comparison without using semver
// export function compareVersions(v1: string, v2: string): number {
//     const parts1 = v1.split('.').map(p => parseInt(p, 10));
//     const parts2 = v2.split('.').map(p => parseInt(p, 10));

//     for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
//         const part1 = parts1[i] || 0;
//         const part2 = parts2[i] || 0;
//         if (part1 !== part2) {
//             return part1 - part2;
//         }
//     }

//     return 0;
// }
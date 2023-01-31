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

    getAdjazent() {
        return this.vertices;
    }


    topoSort(v = this.vertices[0], discovered?: boolean[], s?: any) {
        const stack = s || [];

        let adj = this.adjacent;

        if (typeof discovered !== 'undefined') {
            discovered[v] = true;

            for (let i = 0; i < adj[v].length; i++) {
                let w = adj[v][i];

                if (!discovered[w]) {
                    this.topoSort(w, discovered, stack);
                }
            }
        }
        stack.unshift(v);
        return stack || false;
    }
}

// const g = new Graph();

// g.addVertex("Bhs.Design");
// g.addVertex("BlazorProject1");
// g.addVertex("CCC 2.0");
// g.addVertex("DataManager");
// g.addVertex("Express");
// g.addVertex("FileManager");
// g.addVertex("GrpcConnector");

// g.addEdge("Bhs.Design","BlazorProject1");
// g.addEdge("Bhs.Design","CCC 2.0");
// g.addEdge("Bhs.Design","DataManager");
// g.addEdge("BlazorProject1","CCC 2.0");
// g.addEdge("BlazorProject1","DataManager");
// g.addEdge("CCC 2.0","DataManager");
// g.addEdge("CCC 2.0","Express");
// g.addEdge("DataManager","FileManager");
// g.addEdge("FileManager","GrpcConnector");
// g.addEdge("GrpcConnector", "FileManager");
// g.addEdge("GrpcConnector", "DataManager");

//console.log(g.topoSort());

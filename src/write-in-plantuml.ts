// import fs from 'fs';

// interface Library {
//     DependencyName: string;
//     Version: string;
//     parent: string | null;
// }

// const lockJson = require('../package-lock.json'); // edit path if needed

// export let plantumlString: string = "";
// const libraries: any[] = [];

// Object.keys(lockJson.dependencies).forEach((dependencyName) => {
//     const dependencyData = lockJson.dependencies[dependencyName];

//     libraries.push({
//         DependencyName: dependencyName.toString(),
//         Version: dependencyData.version.toString(),
//         parent: null,
//     });

//     if (dependencyData.requires) {
//         Object.keys(dependencyData.requires).forEach((subdependencyName) => {
//             const subdependencyVersion = dependencyData.requires[subdependencyName];

//             libraries.push({
//                 DependencyName: subdependencyName.toString(),
//                 Version: subdependencyVersion.toString(),
//                 parent: dependencyName.toString(),
//             });
//         });
//     }
// });

// plantumlString += '\n@startuml\n';
// plantumlString += 'digraph foo {\n';

// libraries.forEach((library) => {
//     // if (library.parent) {
//     //     plantumlString += `"${library.DependencyName} ${library.Version}"\n`;
//     // } else {
//     //plantumlString += `"${library.DependencyName} ${library.Version}"`;
//     const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
//     subdependencies.forEach((sub) => {
//         plantumlString += `"${sub.DependencyName} ${sub.Version} -> "${library.DependencyName} ${library.Version}""\n`;
//     });
//     // }
// });

// plantumlString += '}\n@enduml\n';



import fs from 'fs';

interface Library {
    DependencyName: string;
    Version: string;
    parent: string | null;
}

const lockJson = require('../package-lock.json'); // edit path if needed

export let plantumlString: string = "";
const libraries: any[] = [];

Object.keys(lockJson.dependencies).forEach((dependencyName) => {
    const dependencyData = lockJson.dependencies[dependencyName];

    libraries.push({
        DependencyName: dependencyName.toString(),
        Version: dependencyData.version.toString(),
        parent: null,
    });

    if (dependencyData.requires) {
        Object.keys(dependencyData.requires).forEach((subdependencyName) => {
            const subdependencyVersion = dependencyData.requires[subdependencyName];

            libraries.push({
                DependencyName: subdependencyName.toString(),
                Version: subdependencyVersion.toString(),
                parent: dependencyName.toString(),
            });
        });
    }
});

plantumlString += '\n@startuml\n';
plantumlString += 'digraph foo {\n';

const visited: Set<string> = new Set<string>();

libraries.forEach((library) => {
    if (!visited.has(library.DependencyName)) {
        visit(library, visited);
    }
});

plantumlString += '}\n@enduml\n';

console.log(plantumlString);

function visit(library: Library, visited: Set<string>, ancestors: Set<string> = new Set<string>()) {
    visited.add(library.DependencyName);
    ancestors.add(library.DependencyName);

    if (library.parent) {
        const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
        subdependencies.forEach((sub) => {
            if (ancestors.has(sub.DependencyName)) {
                throw new Error(`Cycle detected: ${library.DependencyName} -> ${sub.DependencyName}`);
            }
            if (!visited.has(sub.DependencyName)) {
                visit(sub, visited, ancestors);
            }
            plantumlString += `"${library.DependencyName} ${library.Version}" -> "${sub.DependencyName} ${sub.Version}"\n`;
        });
    } else {
        plantumlString += `"${library.DependencyName} ${library.Version}"\n`;
    }

    ancestors.delete(library.DependencyName);
}

  
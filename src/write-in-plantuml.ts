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



interface Library {
    DependencyName: string;
    Version: string;
    parent: string | null;
  }
  
  const lockJson = require('../package-lock.json'); // edit path if needed
  
  function areVersionsCompatible(version1: string, version2: string): boolean {
    const version1Parts = version1.split('.');
    const version2Parts = version2.split('.');
    for (let i = 0; i < 3; i++) {
      const part1 = parseInt(version1Parts[i], 10);
      const part2 = parseInt(version2Parts[i], 10);
      if (part1 !== part2) {
        return false;
      }
    }
    return true;
  }
  
  const visited: {[dependency: string]: boolean} = {};
  const sorted: Library[] = [];
  
  function visit(library: Library, libraries: Library[]): void {
    if (visited[library.DependencyName]) {
      return;
    }
    visited[library.DependencyName] = true;
  
    const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
  
    subdependencies.forEach((sub) => {
      visit(sub, libraries);
    });
  
    sorted.push(library);
  }
  
  const libraries: Library[] = [];
  
  Object.keys(lockJson.dependencies).forEach((dependencyName) => {
    const dependencyData = lockJson.dependencies[dependencyName];
  
    const library: Library = {
      DependencyName: dependencyName.toString(),
      Version: dependencyData.version.toString(),
      parent: null,
    };
  
    if (!libraries.some((l) => l.DependencyName === library.DependencyName)) {
      libraries.push(library);
    }
  
    if (dependencyData.requires) {
      Object.keys(dependencyData.requires).forEach((subdependencyName) => {
        const subdependencyVersion = dependencyData.requires[subdependencyName];
  
        const subdependency: Library = {
          DependencyName: subdependencyName.toString(),
          Version: subdependencyVersion.toString(),
          parent: dependencyName.toString(),
        };
  
        if (!libraries.some((l) => l.DependencyName === subdependency.DependencyName)) {
          libraries.push(subdependency);
        }
      });
    }
  });
  
  libraries.forEach((library) => {
    visit(library, libraries);
  });
  
  export let plantumlString = '\n@startuml\n';
  plantumlString += 'digraph foo {\n';
  
  sorted.forEach((library) => {
    if (library.parent) {
      const parentLibrary = libraries.find((l) => l.DependencyName === library.parent);
      if (parentLibrary) {
        plantumlString += `"${parentLibrary.DependencyName} ${parentLibrary.Version}" -> "${library.DependencyName} ${library.Version}"\n`;
      }
    }
  });
  
  plantumlString += '}\n@enduml\n';
  
  console.log(plantumlString);
  
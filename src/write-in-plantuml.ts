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
    const version1Parts = version1.split(".");
    const version2Parts = version2.split(".");
    for (let i = 0; i < Math.max(version1Parts.length, version2Parts.length); i++) {
      const v1 = parseInt(version1Parts[i] || "0");
      const v2 = parseInt(version2Parts[i] || "0");
      if (v1 !== v2) {
        return v1 > v2;
      }
    }
    return true;
  }
  
  let plantumlString: string = "";
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
  
        if (areVersionsCompatible(dependencyData.version, subdependencyVersion)) {
          libraries.push({
            DependencyName: subdependencyName.toString(),
            Version: subdependencyVersion.toString(),
            parent: dependencyName.toString(),
          });
        } else {
          const parent = libraries.find((lib) => lib.DependencyName === subdependencyName);
          libraries.push({
            DependencyName: subdependencyName.toString(),
            Version: subdependencyVersion.toString(),
            parent: parent?.DependencyName || null,
          });
        }
      });
    }
  });
  
  plantumlString += '\n@startuml\n';
  plantumlString += 'digraph foo {\n';
  
  libraries.forEach((library) => {
    const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
    subdependencies.forEach((sub) => {
      plantumlString += `"${sub.DependencyName} ${sub.Version}" -> "${library.DependencyName} ${library.Version}"\n`;
    });
  });
  
  plantumlString += '}\n@enduml\n';
  
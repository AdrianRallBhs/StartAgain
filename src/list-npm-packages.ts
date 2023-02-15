import { info } from '@actions/core';
const fs = require('fs');
// import * as jsonFile from '../package-lock.json'

// const lockJson = require('../package-lock.json'); // edit path if needed

// export const libraries: any[] = [];

// // Loop through dependencies keys (as it is an object)
// Object.keys(lockJson.dependencies).forEach((dependencyName) => {
//     const dependencyData = lockJson.dependencies[dependencyName];

//     libraries.push({
//         DependencyName: dependencyName.toString(),
//         Version: dependencyData.version.toString(),
//         parent: null,
//     });

//     // Loop through requires subdependencies      
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




export async function generateDependenciesPlantUML(lockJsonPath: string, outputFilePath: string): Promise<void> {
    const lockJson = require(lockJsonPath);

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

    let plantumlString = '@startuml\n';

    libraries.forEach((library) => {
        if (library.parent) {
            plantumlString += `${library.parent} --> ${library.DependencyName} : ${library.Version}\n`;
        } else {
            plantumlString += `package "${library.DependencyName} ${library.Version}" {\n`;
            const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
            subdependencies.forEach((sub) => {
                plantumlString += `\t${sub.DependencyName} : ${sub.Version}\n`;
            });
            plantumlString += '}\n';
        }
    });

    plantumlString += '@enduml\n';

    fs.writeFileSync(outputFilePath, plantumlString);
};


//info(libraries.toString());
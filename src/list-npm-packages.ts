import { info } from '@actions/core';
const fs = require('fs');
// import * as jsonFile from '../package-lock.json'

const lockJson = require('../package-lock.json'); // edit path if needed

export const libraries: any[] = [];

// Loop through dependencies keys (as it is an object)
Object.keys(lockJson.dependencies).forEach((dependencyName) => {
    const dependencyData = lockJson.dependencies[dependencyName];

    libraries.push({
        DependencyName: dependencyName.toString(),
        Version: dependencyData.version.toString(),
        parent: null,
    });

    // Loop through requires subdependencies      
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


export async function writeNPMToPlantUML(libra: any[]): Promise<void> {


    let plantumlString = '@startuml\n';

    // Loop through libraries and create PlantUML entries for each dependency with subdependencies
    libra.forEach((library) => {
        if (library.parent) {
            // If the library has a parent, it is a subdependency
            plantumlString += `${library.parent} --> ${library.DependencyName} : ${library.Version}\n`;
        } else {
            // If the library does not have a parent, it is a top-level dependency
            plantumlString += `package "${library.DependencyName} ${library.Version}" {\n`;
            const subdependencies = libra.filter((sub) => sub.parent === library.DependencyName);
            subdependencies.forEach((sub) => {
                plantumlString += `\t${sub.DependencyName} : ${sub.Version}\n`;
            });
            plantumlString += '}\n';
        }
    });

    plantumlString += '@enduml\n';

    fs.writeFileSync('dependencies.plantuml', plantumlString);
}


//info(libraries.toString());
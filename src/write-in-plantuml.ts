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
const latestVersions: {[key: string]: string} = {}; // dictionary to store latest versions

// function to check if a version is greater than another, accounting for caret sign
function isVersionGreaterThan(version: string, otherVersion: string): boolean {
    if (version.startsWith('^') && otherVersion.startsWith('^')) {
        const versionNumber = Number(version.substring(1));
        const otherVersionNumber = Number(otherVersion.substring(1));
        return versionNumber > otherVersionNumber;
    } else if (version.startsWith('^')) {
        const versionNumber = Number(version.substring(1));
        const otherVersionNumber = Number(otherVersion.split('.')[0]);
        return versionNumber > otherVersionNumber;
    } else if (otherVersion.startsWith('^')) {
        const versionNumber = Number(version.split('.')[0]);
        const otherVersionNumber = Number(otherVersion.substring(1));
        return versionNumber > otherVersionNumber;
    } else {
        return version > otherVersion;
    }
}
import { info } from '@actions/core';
// import * as jsonFile from '../package-lock.json'

const lockJson = require('../package-lock.json'); // edit path if needed

export const libraries: any[] = [];

// Loop through dependencies keys (as it is an object)
Object.keys(lockJson.dependencies).forEach((dependencyName) => {
    const dependencyData = lockJson.dependencies[dependencyName];

    libraries.push({
        DependencyName: dependencyName,
        Version: dependencyData.version,
        parent: null,
    });

    // Loop through requires subdependencies      
    if (dependencyData.requires) {
        Object.keys(dependencyData.requires).forEach((subdependencyName) => {
            const subdependencyVersion = dependencyData.requires[subdependencyName];

            libraries.push({
                libName: subdependencyName,
                libVersion: subdependencyVersion,
                parent: dependencyName,
            });
        });
    }
});

//info(libraries.toString());
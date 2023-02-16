import { info } from '@actions/core';
const fs = require('fs');

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


//info(libraries.toString());
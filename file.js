const lockJson = require('./package-lock.json'); // edit path if needed

const libraries = [];

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

console.log(libraries[0]);

let output = `Output: ${libraries[0].DependencyName.toString()}`;
console.log(output);

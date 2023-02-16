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

  plantumlString += '@startuml\n';
  plantumlString += 'digraph foo {\n';

  libraries.forEach((library) => {
    if (library.parent) {
      plantumlString += `"${library.parent} ${library.Version}" -> "${library.DependencyName} ${library.Version}"\n`;
    } else {
    //   plantumlString += `"package ${library.DependencyName} ${library.Version}" {\n`;
    //   const subdependencies = libraries.filter((sub) => sub.parent === library.DependencyName);
    //   subdependencies.forEach((sub) => {
    //     plantumlString += `\t${sub.DependencyName} : ${sub.Version}\n`;
    //   });
    }
  });

  plantumlString += '}\n@enduml\n';

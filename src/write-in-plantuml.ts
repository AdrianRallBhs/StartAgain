import { GitHub } from '@actions/github/lib/utils';
import fs from 'fs';

type Project = {
  name: string;
  dependencies: string[];
};

const projects: Project[] = [
  { name: "Project A", dependencies: ["Project B", "Project C"] },
  { name: "Project B", dependencies: ["Project C"] },
  { name: "Project C", dependencies: [] },
  { name: "Project D", dependencies: ["Project A", "Project B", "Project E"] },
  { name: "Project E", dependencies: [] },
];

export const generatePlantUML = (projects: Project[]) => {
  let diagram = "@startuml\n";
    diagram += `"digraph ${GitHub.name} { \n"`
  // Add dependency edges
  projects.forEach(project => {
    project.dependencies.forEach(dependency => {
      diagram += `"${project.name}" -> "${dependency}"\n`;
    });
  });
  diagram += "}\n";
  diagram += "@enduml\n";
  return diagram;
};

// Write the PlantUML code to a file
fs.writeFileSync("projects.puml", generatePlantUML(projects));

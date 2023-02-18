import {  Graph, buildModuleDependencyGraph } from './topoSortDfs';
import * as core from '@actions/core'
import { statSync } from 'fs'
import { DotnetCommandManager, OutdatedPackage } from './dotnet-command-manager'
import { getAllProjects, getAllSources, findEvenSubmodules, } from './dotnet-project-locator'
import { removeIgnoredDependencies, getDestinatedDependency } from './utils'
import {  libraries } from './list-npm-packages';
import { plantumlString } from './write-in-plantuml'
import fs from 'fs';
import * as fsPromise from 'fs/promises';


async function execute(): Promise<void> {
    try {
        const recursive = core.getBooleanInput("recursive")
        const commentUpdated = core.getBooleanInput("comment-updated")
        const rootFolder = core.getInput("root-folder")
        const versionLimit = core.getInput("version-limit")
        const packageToUpdate = core.getInput("packageToUpdate")
        const ignoreList = core.getMultilineInput("ignore").filter(s => s.trim() !== "")
        const projectIgnoreList = core.getMultilineInput("ignore-project").filter(s => s.trim() !== "")
        const contents = core.getInput("contents", { required: true });

      

        let outdatedPackages: OutdatedPackage[] = [];
        core.startGroup("Find modules")
        const projects: string[] = await getAllProjects(rootFolder, recursive, projectIgnoreList)
        const submods: string[] = await findEvenSubmodules();
        core.endGroup()

        core.startGroup("Show Modules")
        submods.forEach(element => {
            core.info(element)
        });
        core.endGroup()

        core.startGroup("NPM packages")
        for (let i = 0; i < libraries.length; i++) {
            core.info(`Dependencies: ${libraries[i].DependencyName.toString()} ${libraries[i].Version.toString()}`)
        }
        core.endGroup()

        core.startGroup("PlantUML")
        core.info(`Generated plantuml from npm packages: ${plantumlString}`)
        fs.writeFileSync("../dependencies.txt", plantumlString);
        await fsPromise.writeFile('../dependencies.puml', plantumlString)
        await fsPromise.writeFile('../dependencies.txt', plantumlString)
        //core.info(`Dependencies: ${libraries[0].DependencyName.toString()}`)
        core.endGroup()



        const graph: Graph = buildModuleDependencyGraph(projects, outdatedPackages);
        const g = new Graph();



        for (const project of submods) {
            if (statSync(project).isFile()) {
                const dotnet = await DotnetCommandManager.create(project)

                core.startGroup(`dotnet restore ${project}`)
                await dotnet.restore()
                core.endGroup()


                core.startGroup(`dotnet list ${project}`)
                outdatedPackages = await dotnet.listOutdated(versionLimit)
                core.endGroup()


                core.startGroup('Whats inside outdatedPackages?')
                const destinatedDep = outdatedPackages.filter(p => p.name === packageToUpdate)
                core.info(`destinated Package: ` + destinatedDep[0].name + destinatedDep[0].current)
                const DepWithVersion = destinatedDep[0].name + " " + destinatedDep[0].current
                g.addVertex(destinatedDep[0].current)
                g.addVertex(project)
                g.addEdge(project, destinatedDep[0].current)
                core.endGroup()
            }
        }

       

        core.startGroup("For-loop")
        for (const vertex of graph.getVertices()) {
            const adjacent = graph.getAdjacent()[vertex];
            g.addVertex(vertex);
            for (const adj of adjacent) {
              g.addEdge(vertex, adj);
            }
          }

          const sortedModules = g.topologicalSort();
          core.info(`"${sortedModules}\n ${typeof(sortedModules)}"`)
        core.endGroup()


    } catch (e) {
        if (e instanceof Error) {
            core.setFailed(e.message)
        } else if (typeof e === 'string') {
            core.setFailed(e)
        } else {
            core.setFailed("Some unknown error occured, please see logs")
        }
    }
}
execute()
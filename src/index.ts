import {  Graph } from './topoSortDfs';
import * as core from '@actions/core'
import { statSync } from 'fs'
import { DotnetCommandManager, OutdatedPackage } from './dotnet-command-manager'
import { getAllProjects, getAllSources, findEvenSubmodules, } from './dotnet-project-locator'
import { removeIgnoredDependencies } from './utils'
import { updateReadme } from './updateReadme'
import {  libraries } from './list-npm-packages';
import { bumpVersion } from './update-semver';
import { writeInRepo } from './write-in-repo';
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



        core.startGroup("NPM packages")
        for (let i = 0; i < libraries.length; i++) {
            core.info(`Dependencies: ${libraries[i].DependencyName.toString()} ${libraries[i].Version.toString()}`)
        }
        core.endGroup()

        core.startGroup("PlantUML")
        core.info(`Generated plantuml from npm packages: ${plantumlString}`)
        //fs.writeFileSync("../dependencies.txt", plantumlString);
        await fsPromise.writeFile('../dependencies.plantuml', plantumlString)
        await fsPromise.writeFile('../dependencies.txt', plantumlString)
        //core.info(`Dependencies: ${libraries[0].DependencyName.toString()}`)
        core.endGroup()

      

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
        
        //const Dependencygraph: Graph = buildModuleDependencyGraph(projects, outdatedPackages);
        const graph = new Graph();



        core.startGroup("SemVer")
        core.info(`Update SemVer: `)
        bumpVersion()
        core.endGroup()

        core.startGroup("Sources")
        const sources: string[] = await getAllSources(rootFolder, recursive, projectIgnoreList)
        core.endGroup()







        for (const project of submods) {
            if (statSync(project).isFile()) {
                const dotnet = await DotnetCommandManager.create(project)

                core.startGroup(`dotnet restore ${project}`)
                await dotnet.restore()
                core.endGroup()

                // core.startGroup("Source -- nuget list source")
                // const listOfSources = await dotnet.listSources()
                // core.endGroup()

                // core.startGroup("Sources")
                // dotnet.filterSource(listOfSources)
                // core.endGroup()


                // core.startGroup('Source -- nuget list source --format')
                // const filteredSources = await dotnet.listSource()
                // core.endGroup()

                core.startGroup(`dotnet list ${project}`)
                const outdatedPackages = await dotnet.listOutdated(versionLimit)
                core.endGroup()

                // core.startGroup(`dotnet list ${project} package`)
                // const packages = await dotnet.listPackagesWithOutput()
                // core.endGroup()

                core.startGroup('Whats inside outdatedPackages?')

                const wantedPackage = outdatedPackages.filter(p => p.name === packageToUpdate)
                const NameOfDependency = wantedPackage[0].name + wantedPackage[0].current
                //const destinatedPackage = await getDestinatedDependency(packages, packageToUpdate)
                // core.info(`Destinated Dep length: ` +wantedPackage.length)
                // core.info(`outdatedPackages length: ` + outdatedPackages.length)
                core.info(`destinated Package: ` + wantedPackage[0].name + wantedPackage[0].current)
                const DepWithVersion = wantedPackage[0].name + " " + wantedPackage[0].current
                //graph.addVertex(wantedPackage[0].name)
                graph.addVertex(`${project} ${wantedPackage[0].current}`)
                //graph.addVertex(DepWithVersion)
                graph.addVertex(project)
               

                graph.addEdge(project, wantedPackage[0].current)
                //graph.addEdge(project, NameOfDependency)
                //core.info(`single dependency ${wantedPackage[0].name}`)
                // packages.forEach(element =>  {
                //     graph.addVertex(element)
                //     core.info(graph.getAdjazent)
                // })
                // packages.forEach(element => {
                //     graph.addEdge(project, element)
                // });
                core.endGroup()

                // core.startGroup(`removing nugets present in ignore list ${project}`)
                // //const filteredPackages = await removeIgnoredDependencies(outdatedPackages, ignoreList)
                // const filteredPackages = await removeIgnoredDependencies(outdatedPackages, ignoreList)
                // core.info(`list of dependencies that will be updated: ${filteredPackages}`)
                // core.endGroup()

                // core.startGroup(`dotnet install new version ${project}`)
                // await dotnet.addUpdatedPackage(filteredPackages)
                // core.endGroup()

                // core.startGroup(`dotnet add ${project} package`)
                // const filteredPackages = await removeIgnoredDependencies(outdatedPackages, ignoreList)
                // await dotnet.addPackage(filteredPackages)
                // core.endGroup()

            //     core.startGroup(`add to README`)
            //     inhalt = await dotnet.listPackages()     
            //     for (const pack of outdatedPackages)
            //         await updateReadme(`\n \n ${project} \n - Name: ${pack.name} \n - Current: ${pack.current} \n - Latest: ${pack.latest}`)
            //         await updateReadme(`\n \n Name: ${pack.name} : Current: ${pack.current} --> ${pack.latest} \n - ${project}`)
            //     core.endGroup()
            // }
        }

        core.startGroup('Graph Edges')
        // graph.vertices.forEach(element => {
        //     core.info(element)
        // });
        core.info(`Topological Sort: ${graph.topologicalSort()}`)  
        core.endGroup()

    }

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



//         for (const project of submods) {
//             if (statSync(project).isFile()) {
//                 const dotnet = await DotnetCommandManager.create(project)

//                 core.startGroup(`dotnet restore ${project}`)
//                 await dotnet.restore()
//                 core.endGroup()


//                 core.startGroup(`dotnet list ${project}`)
//                 outdatedPackages = await dotnet.listOutdated(versionLimit)
//                 core.endGroup()


//                 core.startGroup('Whats inside outdatedPackages?')
//                 const wantedPackage = outdatedPackages.filter(p => p.name === packageToUpdate)
//                 core.info(`destinated Package: ` + wantedPackage[0].name + wantedPackage[0].current)
                
//                 const DepWithVersion = wantedPackage[0].name + " " + wantedPackage[0].current
//                 outdatedPackages.forEach(element => {
//                     core.info(DepWithVersion)
//                 });
//                 g.addVertex(wantedPackage[0].current)
//                 g.addVertex(project)
//                 g.addEdge(project, wantedPackage[0].current)
//                 core.endGroup()
//             }
//         }

//         //   const sortedModules = g.topologicalSort();
//         //   core.info(`"${sortedModules}\n ${typeof(sortedModules)}"`)
//         // core.endGroup()



//   // Sort modules topologically
//   const sortedModules = graph.topologicalSort();
//   //core.info(`Topologically sorted modules: ${sortedModules.join(", ")}`);
//   core.startGroup("Topological Sort")
//   core.info(g.topologicalSort())
//   core.endGroup()

//     } catch (e) {
//         if (e instanceof Error) {
//             core.setFailed(e.message)
//         } else if (typeof e === 'string') {
//             core.setFailed(e)
//         } else {
//             core.setFailed("Some unknown error occured, please see logs")
//         }
//     }
// }
// execute()
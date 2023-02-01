import { Graph } from './topoSortDfs';
import * as core from '@actions/core'
import { statSync } from 'fs'
import { DotnetCommandManager } from './dotnet-command-manager'
import { getAllProjects, getAllSources } from './dotnet-project-locator'
import { removeIgnoredDependencies, getDestinatedDependency } from './utils'
import { updateReadme } from './updateReadme'


async function execute(): Promise<void> {
    try {
        const recursive = core.getBooleanInput("recursive")
        const commentUpdated = core.getBooleanInput("comment-updated")
        const rootFolder = core.getInput("root-folder")
        const versionLimit = core.getInput("version-limit")
        const packageToUpdate = core.getInput(" packageToUpdate")
        const ignoreList = core.getMultilineInput("ignore").filter(s => s.trim() !== "")
        const projectIgnoreList = core.getMultilineInput("ignore-project").filter(s => s.trim() !== "")
        const contents = core.getInput("contents", { required: true });

        core.startGroup("Find modules")
        const projects: string[] = await getAllProjects(rootFolder, recursive, projectIgnoreList)
        core.endGroup()


        // core.startGroup("Sources")
        // const sources: string[] = await getAllSources(rootFolder, recursive, projectIgnoreList)
        // core.endGroup()

        core.startGroup("Graph Vertices")
        const graph = new Graph()
        projects.forEach(element => {
            graph.addVertex(element)
        });

        graph.vertices.forEach(element => {
            core.info(element)
        });
        //core.info('Graph: ' +  graph.getAdjazent())
        core.endGroup()


        for (const project of projects) {
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

                // core.startGroup(`dotnet list ${project}`)
                // const outdatedPackages = await dotnet.listOutdated(versionLimit)
                // core.endGroup()

                core.startGroup(`dotnet list ${project} package`)
                const packages = await dotnet.listPackagesWithOutput()
                core.endGroup()

                core.startGroup('Whats inside outdatedPackages?')
                const destinatedPackage = await getDestinatedDependency(packages, packageToUpdate)
                core.info(`single dependency ${destinatedPackage[0].name}`)
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

                // core.startGroup(`add to README`)
                // // inhalt = await dotnet.listPackages()     
                // for (const pack of outdatedPackages)
                //     // await updateReadme(`\n \n ${project} \n - Name: ${pack.name} \n - Current: ${pack.current} \n - Latest: ${pack.latest}`)
                //     await updateReadme(`\n \n Name: ${pack.name} : Current: ${pack.current} --> ${pack.latest} \n - ${project}`)
                // core.endGroup()
            }
        }

        core.startGroup('Graph Edges')
        core.info(graph.topoSort())
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
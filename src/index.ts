import * as core from '@actions/core'
import { statSync } from 'fs'
import { DotnetCommandManager } from './dotnet-command-manager'
import { getAllProjects } from './dotnet-project-locator'
import { PrBodyHelper } from './pr-body'
import { removeIgnoredDependencies } from './utils'
import { updateReadme } from './updateReadme'

let inhalt: any

async function execute(): Promise<void> {
    try {
        const recursive = core.getBooleanInput("recursive")
        const commentUpdated = core.getBooleanInput("comment-updated")
        const rootFolder = core.getInput("root-folder")
        const versionLimit = core.getInput("version-limit")
        const ignoreList = core.getMultilineInput("ignore").filter(s => s.trim() !== "")
        const projectIgnoreList = core.getMultilineInput("ignore-project").filter(s => s.trim() !== "")
        const contents = core.getInput("contents", { required: true });



        core.startGroup("Find modules")
        const projects: string[] = await getAllProjects(rootFolder, recursive, projectIgnoreList)
        core.endGroup()

        let body = ""
        for (const project of projects) {
            if (statSync(project).isFile()) {
                const dotnet = await DotnetCommandManager.create(project)

                core.startGroup(`dotnet restore ${project}`)
                await dotnet.restore()
                core.endGroup()

                core.startGroup(`dotnet list ${project}`)
                const outdatedPackages = await dotnet.listOutdated(versionLimit)
                core.endGroup()

                // core.startGroup(`removing nugets present in ignore list ${project}`)
                // //const filteredPackages = await removeIgnoredDependencies(outdatedPackages, ignoreList)
                // const filteredPackages = await removeIgnoredDependencies(outdatedPackages, ignoreList)
                // core.info(`list of dependencies that will be updated: ${filteredPackages}`)
                // core.endGroup()

                // core.startGroup(`dotnet install new version ${project}`)
                // await dotnet.addUpdatedPackage(filteredPackages)
                // core.endGroup()

                // core.startGroup(`dotnet list ${project} package`)
                // await dotnet.listPackages()
                // core.endGroup()

                core.startGroup(`add to README`)
                // inhalt = await dotnet.listPackages()
                
                    for (const pack of outdatedPackages)
                    await updateReadme(`\n \n ${project} \n -Name: ${pack.name} \n -Current: ${pack.current} \n -Latest: ${pack.latest}`)
                core.endGroup()
                }

                

                core.startGroup(`append to PR body  ${project}`)
                const prBodyHelper = new PrBodyHelper(project, commentUpdated)
                // body += `${await prBodyHelper.buildPRBody(filteredPackages)}\n`
                core.endGroup()




            }
        }
        core.setOutput("body", body)
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
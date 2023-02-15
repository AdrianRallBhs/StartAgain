import { info } from "@actions/core"
import { readdirSync, readFileSync, readlinkSync, statSync } from "fs"
import { readlink } from "fs/promises"
import { json } from "node:stream/consumers"
import { extname, join } from "path"
const fs = require('fs')
const path = require('path')
import * as core from '@actions/core'
import * as exec from '@actions/exec'



export const getAllProjects = async (
    rootFolder: string,
    recursive: boolean,
    ignoreProjects: string[] = [],
    result: string[] = []
): Promise<string[]> => {
    const files: string[] = readdirSync(rootFolder)
    const regex = /^.+.csproj$/

    for (const fileName of files) {
        const file = join(rootFolder, fileName)
        const fileStat = statSync(file)

        if (fileStat.isDirectory()) {
            try {
                result = await getAllProjects(file, recursive, ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else if (regex.test(fileName)) {
            info(`project found : ${file}`)
            result.push(file)
        }
    }

    // Check if there are any submodules
    const submodulePath = join(rootFolder, ".git", "modules")
    try {
        const submoduleNames = readdirSync(submodulePath)
        for (const submodule of submoduleNames) {
            const submodulePath = join(rootFolder, ".git", "modules", submodule)
            const gitLinkFile = join(submodulePath, "HEAD")
            const gitLink = readFileSync(gitLinkFile, "utf8")
            const gitPath = gitLink.substring(5, gitLink.length - 1)
            const submoduleFolder = join(rootFolder, gitPath)
            result = await getAllProjects(submoduleFolder, recursive, ignoreProjects, result)
        }
    } catch {
        core.info("Error in dotnet-project-locator-find submodules")
    }

    return filterProjectList(result, ignoreProjects)
}

const filterProjectList = (
    projects: string[],
    ignoreProjects: string[]
): string[] => {
    return projects.filter((project) => ignoreProjects.indexOf(project) === -1)
}






export const getAllSources = async (
    rootFolder: string,
    recursive: boolean,
    ignoreProjects: string[] = [],
    result: string[] = []
): Promise<string[]> => {
    const files: string[] = readdirSync(rootFolder)
    const regex = /^.+.csproj.nuget.dgspec.json$/
    for (const fileName of files) {
        const file = join(rootFolder, fileName)
        // var keys = Object.keys(file)
        // let jsonObject = Object.assign(keys.map(key => Object.values(key)).map(value => ({ [value[0]]: value[1] })));  
        // let json = JSON.stringify(jsonObject);  
        let json
        const jsonsInDir = fs.readdirSync('../').filter((fil: string) => extname(fil) === 'csproj.nuget.dgspec.json')
        jsonsInDir.forEach((file: any) => {
            const fileData = fs.readFileSync(path.join('../**/.csproj.nuget.dgspec.json', file))
            json = JSON.parse(fileData.toString()).toString()
        })


        if (statSync(file).isDirectory() && recursive) {
            try {
                result = await getAllSources(file, recursive, ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else {
            if (regex.test(file)) {

                info(`project found : ${file} \n JSON: ${json} `)
                result.push(file)
            }
        }
    }
    return getSources(result)
}


const getSources = (
    sources: string[],
): string[] => {
    var jsonObj = getAllSources
    var keys = Object.keys(jsonObj)
    sources = keys
    var nameOfSources = Object.keys(sources)
    return nameOfSources
}



export const getAllPackageJSON = async (
    rootFolder: string,
    recursive: boolean,
    ignoreProjects: string[] = [],
    result: string[] = []
): Promise<string[]> => {
    const files: string[] = readdirSync(rootFolder)
    const regex = /^package.json$/

    for (const fileName of files) {
        const file = join(rootFolder, fileName)

        if (statSync(file).isDirectory() && recursive) {
            try {
                result = await getAllPackageJSON(file, recursive, ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else {
            if (regex.test(file)) {
                info(`file found : ${file}`)
                result.push(file)
            }
        }
    }
    return getNpmPackages(result)
}

const getNpmPackages = (
    sources: string[],
): string[] => {
    var jsonObj = getAllPackageJSON
    var keys = Object.keys(jsonObj)
    sources = keys
    var nameOfSources = Object.keys(sources)
    return nameOfSources
}




export async function findEvenSubmodules() {
    try {
        // Checkout the repository including submodules
        await exec.exec('git', ['submodule', 'update', '--init', '--recursive']);

        // Use the `find` command to locate all `csproj` files
        let csprojFiles = '';
        const options = {
            listeners: {
                stdout: (data: Buffer) => {
                    csprojFiles += data.toString();
                }
            }
        };
        await exec.exec('find', ['.', '-name', '*.csproj'], options);

        // Output the list of `csproj` files found
        core.info(`List of csproj files found: ${csprojFiles}`);
    } catch (e) {
        core.setFailed(e);
    }
}






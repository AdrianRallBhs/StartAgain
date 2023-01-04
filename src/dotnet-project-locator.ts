import { info } from "@actions/core"
import { readdirSync, readFileSync, statSync } from "fs"
import { json } from "node:stream/consumers"
import { join } from "path"
const data = require("../BlazorDotNet_Dependency/obj/BlazorDotNet_Dependency.csproj.nuget.dgspec.json")


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
        const js = JSON.parse(data)
        if (statSync(file).isDirectory() && recursive) {
            try {
                result = await getAllProjects(file, recursive, ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else {
            if (regex.test(file)) {
                info(`project found : ${file} \n ${js}`)
                result.push(file)
            }
        }
    }
    return filterProjectList(result, ignoreProjects)
}

const filterProjectList = (
    projects: string[],
    ignoreProjects: string[]
): string[] => {
    return projects.filter(
        (project) => {
            return ignoreProjects.indexOf(project) === -1
        }
    )
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
        const samples = (file as String)
        // var keys = Object.keys(file)
        // let jsonObject = Object.assign(keys.map(key => Object.values(key)).map(value => ({ [value[0]]: value[1] })));  
        // let json = JSON.stringify(jsonObject);  
        

        
        
        if (statSync(file).isDirectory() && recursive) {
            try {
                result = await getAllSources(file, recursive, ignoreProjects, result)
            } catch (error) {
                continue
            }
        } else {
            if (regex.test(file)) {
                info(`project found : ${file}`)
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


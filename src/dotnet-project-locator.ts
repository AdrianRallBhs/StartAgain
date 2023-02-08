import { info } from "@actions/core"
import { readdirSync, readFileSync, readlinkSync, statSync } from "fs"
import { readlink } from "fs/promises"
import { json } from "node:stream/consumers"
import { extname, join } from "path"
const fs = require('fs')
const path = require('path')


export const getAllProjects = async (
    rootFolder: string,
    recursive: boolean,
    ignoreProjects: string[] = [],
    result: string[] = []
): Promise<string[]> => {
    const files: string[] = readdirSync(rootFolder)
    const submod: string = readlinkSync(rootFolder)
    const regex = /^.+.csproj$/

    for(const fileName of submod) {
        const file = join(rootFolder, fileName)
   
        if (statSync(file).isDirectory() && recursive ) {
            try {
                result = await getAllProjects(file, recursive, ignoreProjects, result)
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

    for (const fileName of files) {
        const file = join(rootFolder, fileName)
   
        if (statSync(file).isDirectory() && recursive ) {
            try {
                result = await getAllProjects(file, recursive, ignoreProjects, result)
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


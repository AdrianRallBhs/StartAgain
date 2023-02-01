import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import { info } from 'console'

const packageToUpdate = core.getInput(" packageToUpdate")


export class DotnetCommandManager {
    private dotnetPath: string
    private projectfile: string

    constructor(projectfile: string, dotnetPath: string) {
        this.projectfile = projectfile
        this.dotnetPath = dotnetPath
    }

    static async create(projectfile: string): Promise<DotnetCommandManager> {
        const dotnetPath = await io.which('dotnet', true)
        return new DotnetCommandManager(projectfile, dotnetPath)
    }

    async restore(): Promise<void> {
        const result = await this.exec(['restore', this.projectfile])
        if (result.exitCode !== 0) {
            core.error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet restore returned non-zero exitcode: ${result.exitCode}`)
        }
    }

    async listSources(): Promise<DotnetOutput> {
        const result = await this.exec(['nuget', 'list', 'source', '--format', 'Short'])
        //const sources = this.listSources(result.stdout)
        if (result.exitCode !== 0) {
            core.error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
        }
        return result
    }


    // async filterSource(): Promise<string[]> {
    //     // let source: any
    //     const newArray: string[] = []
    //     for(let source in this.listSource()) {
    //         if(source.startsWith("E https://nuget.github.bhs-world.com")) {
    //             newArray.push(source.toString())
    //         }
    //         //newArray = await source.name.startsWith("E https://nuget.github.bhs-world.com")
    //         }

    //     // }
    //     //const result = (await this.listSource()).filter()
    //     //const sources = this.listSources(result.stdout)
    //     // if (result.exitCode !== 0) {
    //     //     error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
    //     //     throw new Error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
    //     // }
    //     return newArray
    // }

    async listPackages(): Promise<void> {
        const result = await this.exec(['list', this.projectfile, 'package'])
        if (result.exitCode !== 0) {
            core.error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`)
        }
    }

    async listPackagesWithOutput(): Promise<DotnetOutput> {
        const result = await this.exec(['list', this.projectfile, 'package'])
        if (result.exitCode !== 0) {
            core.error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`)
        }
       
        
        return result
    }

    async addPackage(outdatedPackages: OutdatedPackage[]): Promise<void> {
        for (const outdatedPackage of outdatedPackages) {
            const result = await this.exec(['add', this.projectfile, 'package', outdatedPackage.name])
            if (result.exitCode !== 0) {
                core.error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
                throw new Error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
            }
        }
    }

    async listOutdated(versionLimit: string): Promise<OutdatedPackage[]> {
        let sources: string[] = []
        let versionFlag = ""
        switch (versionLimit) {
            case "minor":
                versionFlag = "--highest-minor"
                break
            case "patch":
                versionFlag = "--highest-patch"
                break
        }
        sources = await this.filterSource(await this.listSources())
        
        const result = await this.exec(['list', this.projectfile, 'package', versionFlag, '--outdated', '--source', sources[0]])
        if (result.exitCode !== 0) {
            core.error(`dotnet list package (outdated) returned non-zero exitcode: ${result.exitCode}`)
            throw new Error(`dotnet list package (outdated) returned non-zero exitcode: ${result.exitCode}`)
        }
        const outdated = this.parseListOutput(result.stdout)
        if (versionFlag !== "") {
            const latestsVersions = await this.listOutdated("latest")
            for (const i in latestsVersions) {
                const wanted = (await outdated).filter(x => x.name === latestsVersions[i].name)[0]
                latestsVersions[i].wanted = wanted ? wanted.wanted : latestsVersions[i].current
            }
            return latestsVersions
        }
        return outdated
    }

    async addUpdatedPackage(outdatedPackages: OutdatedPackage[]): Promise<void> {
        for (const outdatedPackage of outdatedPackages) {
            const result = await this.exec(['add', this.projectfile, 'package', outdatedPackage.name, '-v', outdatedPackage.wanted])
            if (result.exitCode !== 0) {
                core.error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
                throw new Error(`dotnet add returned non-zero exitcode: ${result.exitCode}`)
            }
        }
    }

    async exec(args: string[]): Promise<DotnetOutput> {
        args = args.filter(x => x !== "")
        let env: any = {}
        for (const key of Object.keys(process.env)) {
            env[key] = process.env[key]
        }
        const stdout: string[] = []
        const stderr: string[] = []

        const options = {
            cwd: '.',
            env,
            ignoreReturnCode: true,
            listeners: {
                stdout: (data: Buffer) => stdout.push(data.toString()),
                stderr: (data: Buffer) => stderr.push(data.toString())
            }
        }
        const resultcode = await exec.exec(`"${this.dotnetPath}"`, args, options)
        const result = new DotnetOutput(resultcode)
        result.stdout = stdout.join('')
        result.stderr = stderr.join('')
        return result
    }

    async parseListOutput(output: string): Promise<OutdatedPackage[]> {
        const lines = output.split('\n')
        const packages: OutdatedPackage[] = []
        const regex = /^\s+>\s(.*?)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s*$/
        for (const line of lines) {
            const match = regex.exec(line)
            if (match) {
                packages.push({
                    name: match[1],
                    current: match[2],
                    wanted: match[4],
                    latest: match[4]
                })
            }
        }
        return packages
    }


    async parseListPackage(output: string): Promise<Package[]> {
        const lines = output.split('\n')
        const packages: Package[] = []
        const regex = /^\s+>\s(.*?)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+)\s*$/
        for (const line of lines) {
            const match = regex.exec(line)
            if (match) {
                packages.push({
                    name: match[1],
                    version: match[2],
                })
            }
        }
        return packages
    }

    // private async listSource(sources: string): Promise<Sources[]> {
    //     const lines = sources.split('\n')
    //     const sourceList: Sources[] = []
    //     // const regex = /^D $/
    //     // for (const line in lines) {
    //     //     const match = regex.exec(line)
    //     //     if (match) {
    //     //         sourceList.push({ name: match[1] })
    //     //     }
    //     // }
    //     return sourceList
    // }

    // private async filterSources(sources: string): Promise<Sources[]> {
    //     const lines = sources.split('\n')
    //     const sourceList: Sources[] = []
    //     return sourceList.filter((sources) => sources.name.startsWith("E https://nuget.github.bhs-world.com"))
    // }

    async filterSource(result: DotnetOutput) {
        // let source: any
        const newArray: string[] = []
        let blatrim: string
        let source: any
        let bla = result
        blatrim = bla.stdout
        
        //for (let blabla in blatrim) {
            if (blatrim.includes("E https://api.nuget")) {
                blatrim = blatrim.slice(2)
                blatrim = blatrim.trim()
                newArray.push(blatrim)
            //}
               info(`Blatrim: ${blatrim} \n newArray: ${newArray}`)
            //newArray = await source.name.startsWith("E https://nuget.github.bhs-world.com")
            } else {
                info(`nichts in filterSource (.net command manager):  ${blatrim}`)
            }
       // info(`List of other sources: ${newArray}`)
        // }
        //const result = (await this.listSource()).filter()
        //const sources = this.listSources(result.stdout)
        // if (result.exitCode !== 0) {
        //     error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
        //     throw new Error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
        // }
        return newArray
    }



    async filterPackages(result: DotnetOutput) {
        // let source: any
        const newArray: string[] = []
        let blatrim: string
        let source: any
        let bla = result
        blatrim = bla.stdout
        
        //for (let blabla in blatrim) {
            if (blatrim.includes(packageToUpdate)) {
                blatrim = blatrim.trim()
                newArray.push(blatrim)
            //}
               info(`Blatrim: ${blatrim} \n newArray: ${newArray}`)
            //newArray = await source.name.startsWith("E https://nuget.github.bhs-world.com")
            } else {
                info(`nichts in filterSource (.net command manager):  ${blatrim}`)
            }
       // info(`List of other sources: ${newArray}`)
        // }
        //const result = (await this.listSource()).filter()
        //const sources = this.listSources(result.stdout)
        // if (result.exitCode !== 0) {
        //     error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
        //     throw new Error(`dotnet nuget list source --format Short returned non-zero exitcode: ${result.exitCode}`)
        // }
        return newArray
    }
    
}







export class OutdatedPackage {
    name: string
    current: string
    wanted: string
    latest: string

    constructor(name: string, current: string, wanted: string, latest: string) {
        this.name = name
        this.current = current
        this.wanted = wanted
        this.latest = latest
    }
}

export class Package {
    name: string
    version: string
    
    constructor(name: string, version: string) {
        this.name = name
        this.version = version
    }
}

export class DotnetOutput {
    stdout = ''
    stderr = ''
    exitCode = 0

    constructor(exitCode: number) {
        this.exitCode = exitCode
    }

}

export class Sources {
    name: string

    constructor(name: string) {
        this.name = name
    }
}


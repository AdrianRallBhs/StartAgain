import { OutdatedPackage, Package } from "./dotnet-command-manager"


interface Map {
    data: Record<string, string>;
}
const map: Map = {
    data: {
        "*": "\\*",
        "#": "\\#",
        "(": "\\(",
        ")": "\\)",
        "[": "\\[",
        "]": "\\]",
        "_": "\\_",
        "\\": "\\\\",
        "+": "\\+",
        "-": "\\-",
        "`": "\\`",
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;"
    }
}



export const escapeString = async (
    string: string
): Promise<string> => {
    return string.replace(/[\*\(\)\[\]\+\-\\_`#<>]/g, (m: string) => map.data[m])
}

export const removeIgnoredDependencies = async (
    dependencies: OutdatedPackage[],
    ignore: string[]
): Promise<OutdatedPackage[]> => {
    return dependencies.filter((dependency) => { return ignore.indexOf(dependency.name) === -1
        }
    )
}


//Get single dependency
export const getDestinatedDependency = async (
    dependencies: Package[],
    destinated: string
    ): Promise<Package[]> => {
        return dependencies.filter((dependency) => { return dependency.name === destinated })
    }
    

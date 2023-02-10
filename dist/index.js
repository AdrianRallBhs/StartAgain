"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const topoSortDfs_1 = require("./topoSortDfs");
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const dotnet_command_manager_1 = require("./dotnet-command-manager");
const dotnet_project_locator_1 = require("./dotnet-project-locator");
const list_npm_packages_1 = require("./list-npm-packages");
async function execute() {
    try {
        const recursive = core.getBooleanInput("recursive");
        const commentUpdated = core.getBooleanInput("comment-updated");
        const rootFolder = core.getInput("root-folder");
        const versionLimit = core.getInput("version-limit");
        const packageToUpdate = core.getInput("packageToUpdate");
        const ignoreList = core.getMultilineInput("ignore").filter(s => s.trim() !== "");
        const projectIgnoreList = core.getMultilineInput("ignore-project").filter(s => s.trim() !== "");
        const contents = core.getInput("contents", { required: true });
        const graph = new topoSortDfs_1.Graph();
        core.startGroup("Find modules");
        const projects = await (0, dotnet_project_locator_1.getAllProjects)(rootFolder, recursive, projectIgnoreList);
        core.endGroup();
        core.startGroup("NPM packages");
        // libraries.forEach(element => {
        //     core.info()
        // })
        core.info(`Dependencies: ${list_npm_packages_1.libraries[0]}`);
        core.endGroup();
        // core.startGroup("Sources")
        // const sources: string[] = await getAllSources(rootFolder, recursive, projectIgnoreList)
        // core.endGroup()
        for (const project of projects) {
            if ((0, fs_1.statSync)(project).isFile()) {
                const dotnet = await dotnet_command_manager_1.DotnetCommandManager.create(project);
                core.startGroup(`dotnet restore ${project}`);
                await dotnet.restore();
                core.endGroup();
                // core.startGroup("Source -- nuget list source")
                // const listOfSources = await dotnet.listSources()
                // core.endGroup()
                // core.startGroup("Sources")
                // dotnet.filterSource(listOfSources)
                // core.endGroup()
                // core.startGroup('Source -- nuget list source --format')
                // const filteredSources = await dotnet.listSource()
                // core.endGroup()
                core.startGroup(`dotnet list ${project}`);
                const outdatedPackages = await dotnet.listOutdated(versionLimit);
                core.endGroup();
                // core.startGroup(`dotnet list ${project} package`)
                // const packages = await dotnet.listPackagesWithOutput()
                // core.endGroup()
                core.startGroup('Whats inside outdatedPackages?');
                const destinatedDep = outdatedPackages.filter(p => p.name === packageToUpdate);
                const NameOfDependency = destinatedDep[0].name + destinatedDep[0].current;
                //const destinatedPackage = await getDestinatedDependency(packages, packageToUpdate)
                // core.info(`Destinated Dep length: ` +destinatedDep.length)
                // core.info(`outdatedPackages length: ` + outdatedPackages.length)
                core.info(`destinated Package: ` + destinatedDep[0].name + destinatedDep[0].current);
                const DepWithVersion = destinatedDep[0].name + " " + destinatedDep[0].current;
                //graph.addVertex(destinatedDep[0].name)
                graph.addVertex(destinatedDep[0].current);
                //graph.addVertex(DepWithVersion)
                graph.addVertex(project);
                graph.vertices.forEach(element => {
                    core.info(element);
                });
                graph.addEdge(project, destinatedDep[0].current);
                //graph.addEdge(project, NameOfDependency)
                //core.info(`single dependency ${destinatedDep[0].name}`)
                // packages.forEach(element =>  {
                //     graph.addVertex(element)
                //     core.info(graph.getAdjazent)
                // })
                // packages.forEach(element => {
                //     graph.addEdge(project, element)
                // });
                core.endGroup();
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
        core.startGroup('Graph Edges');
        graph.vertices.forEach(element => {
            core.info(element);
        });
        core.info("Topological Sort: " + graph.topoSort());
        core.endGroup();
    }
    catch (e) {
        if (e instanceof Error) {
            core.setFailed(e.message);
        }
        else if (typeof e === 'string') {
            core.setFailed(e);
        }
        else {
            core.setFailed("Some unknown error occured, please see logs");
        }
    }
}
execute();

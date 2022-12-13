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
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const dotnet_command_manager_1 = require("./dotnet-command-manager");
const dotnet_project_locator_1 = require("./dotnet-project-locator");
const pr_body_1 = require("./pr-body");
const updateReadme_1 = require("./updateReadme");
let inhalt;
async function execute() {
    try {
        const recursive = core.getBooleanInput("recursive");
        const commentUpdated = core.getBooleanInput("comment-updated");
        const rootFolder = core.getInput("root-folder");
        const versionLimit = core.getInput("version-limit");
        const ignoreList = core.getMultilineInput("ignore").filter(s => s.trim() !== "");
        const projectIgnoreList = core.getMultilineInput("ignore-project").filter(s => s.trim() !== "");
        const contents = core.getInput("contents", { required: true });
        core.startGroup("Find modules");
        const projects = await (0, dotnet_project_locator_1.getAllProjects)(rootFolder, recursive, projectIgnoreList);
        core.endGroup();
        let body = "";
        for (const project of projects) {
            if ((0, fs_1.statSync)(project).isFile()) {
                const dotnet = await dotnet_command_manager_1.DotnetCommandManager.create(project);
                core.startGroup(`dotnet restore ${project}`);
                await dotnet.restore();
                core.endGroup();
                core.startGroup(`dotnet list ${project}`);
                const outdatedPackages = await dotnet.listOutdated(versionLimit);
                core.endGroup();
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
                core.startGroup(`add to README`);
                // inhalt = await dotnet.listPackages()
                for (const pack of outdatedPackages)
                    // await updateReadme(`\n \n ${project} \n - Name: ${pack.name} \n - Current: ${pack.current} \n - Latest: ${pack.latest}`)
                    await (0, updateReadme_1.updateReadme)(`\n \n Name: ${pack.name} : Current: ${pack.current} --> ${pack.latest} \n - {project}`);
                core.endGroup();
                core.startGroup(`append to PR body  ${project}`);
                const prBodyHelper = new pr_body_1.PrBodyHelper(project, commentUpdated);
                // body += `${await prBodyHelper.buildPRBody(filteredPackages)}\n`
                core.endGroup();
            }
        }
        core.setOutput("body", body);
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

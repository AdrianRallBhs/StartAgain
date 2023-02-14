import { execSync } from "child_process";
import * as process from "process";

// config
const defaultSemvarBump: string = process.env.DEFAULT_BUMP || "minor";
const defaultBranch: any = process.env.DEFAULT_BRANCH || process.env.GITHUB_BASE_REF;
const withV: boolean = process.env.WITH_V === "true";
const releaseBranches: string = process.env.RELEASE_BRANCHES || "master,main";
const customTag: string = process.env.CUSTOM_TAG || "";
const source: string = process.env.SOURCE || ".";
const dryRun: boolean = process.env.DRY_RUN === "true";
const initialVersion: string = process.env.INITIAL_VERSION || "0.0.0";
const tagContext: string = process.env.TAG_CONTEXT || "repo";
const prerelease: boolean = process.env.PRERELEASE === "true";
const suffix: string = process.env.PRERELEASE_SUFFIX || "beta";
const verbose: boolean = process.env.VERBOSE === "true";
const majorStringToken: string = process.env.MAJOR_STRING_TOKEN || "#major";
const minorStringToken: string = process.env.MINOR_STRING_TOKEN || "#minor";
const patchStringToken: string = process.env.PATCH_STRING_TOKEN || "#patch";
const noneStringToken: string = process.env.NONE_STRING_TOKEN || "#none";
const branchHistory: string = process.env.BRANCH_HISTORY || "compare";

console.log("*** CONFIGURATION ***");
console.log(`\tDEFAULT_BUMP: ${defaultSemvarBump}`);
console.log(`\tDEFAULT_BRANCH: ${defaultBranch}`);
console.log(`\tWITH_V: ${withV}`);
console.log(`\tRELEASE_BRANCHES: ${releaseBranches}`);
console.log(`\tCUSTOM_TAG: ${customTag}`);
console.log(`\tSOURCE: ${source}`);
console.log(`\tDRY_RUN: ${dryRun}`);
console.log(`\tINITIAL_VERSION: ${initialVersion}`);
console.log(`\tTAG_CONTEXT: ${tagContext}`);
console.log(`\tPRERELEASE: ${prerelease}`);
console.log(`\tPRERELEASE_SUFFIX: ${suffix}`);
console.log(`\tVERBOSE: ${verbose}`);
console.log(`\tMAJOR_STRING_TOKEN: ${majorStringToken}`);
console.log(`\tMINOR_STRING_TOKEN: ${minorStringToken}`);
console.log(`\tPATCH_STRING_TOKEN: ${patchStringToken}`);
console.log(`\tNONE_STRING_TOKEN: ${noneStringToken}`);
console.log(`\tBRANCH_HISTORY: ${branchHistory}`);

// verbose, show everything
if (verbose) {
    process.env.SHELLOPTS = "xtrace";
}

function setOutput(key: string, value: string): void {
    process.stdout.write(`${key}=${value}\n`);
}

const currentBranch: string = execSync("git rev-parse --abbrev-ref HEAD")
    .toString()
    .trim();

let preRelease: boolean = prerelease;
for (const b of releaseBranches.split(",")) {
    // check if ${current_branch} is in ${release_branches} | exact branch match
    if (currentBranch === b) {
        preRelease = false;
    }
    // verify non specific branch names like .* release/* if wildcard filter then =~
    if (b !== b.replace(/[\[\]|.? +*]/g, "") && currentBranch.match(new RegExp(b))) {
        preRelease = false;
    }
}
console.log(`pre_release = ${preRelease}`);

// fetch tags
execSync("git fetch --tags");

const tagFmt: string = "^v?[0-9]+\\.[0-9]+\\"

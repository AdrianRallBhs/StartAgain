
import * as core from '@actions/core'
import { mkdirP } from "@actions/io";
import { appendFile, exists, writeFile, stat } from "fs";
import { dirname, join as joinPath, resolve as resolvePath } from "path";
import { promisify } from "util";
import { DotnetCommandManager } from './dotnet-command-manager'

const appendFileAsync = promisify(appendFile);
const existsAsync = promisify(exists);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);

//updateReadme().catch((error) => setFailed(error.message));

export async function updateReadme(contents: any): Promise<void> {
  // export async function updateReadme() {
  try {
    const path = core.getInput("path", { required: true });
    //const contents = getInput("contents", { required: true });
    const mode = (core.getInput("write-mode") || "append").toLocaleLowerCase();

    // Ensure the correct mode is specified
    if (mode !== "append" && mode !== "overwrite" && mode !== "preserve") {
      core.setFailed("Mode must be one of: overwrite, append, or preserve");
      return;
    }

    // Preserve the file
    if (mode === "preserve" && (await existsAsync(path))) {
      const statResult = await statAsync(path);
      core.setOutput("size", `${statResult.size}`);
      return;
    }

    const targetDir = dirname(path);

    await mkdirP(targetDir);

    if (mode === "overwrite") {
      await writeFileAsync(path, contents);
    } else {
      await appendFileAsync(path, contents);
    }

    const statResult = await statAsync(path);
    core.setOutput("size", `${statResult.size}`);

  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e.message)
    }
  }
}
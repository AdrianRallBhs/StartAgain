### Hello Adrianoasync listPackages() {
        const result = await this.exec(['list', this.projectfile, 'package']);
        if (result.exitCode !== 0) {
            (0, core_1.error)(`dotnet list package returned non-zero exitcode: ${result.exitCode}`);
            throw new Error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`);
        }
    }async listOutdated(versionLimit) {
        let versionFlag = "";
        switch (versionLimit) {
            case "minor":
                versionFlag = "--highest-minor";
                break;
            case "patch":
                versionFlag = "--highest-patch";
                break;
        }
        const result = await this.exec(['list', this.projectfile, 'package', versionFlag, '--outdated']);
        if (result.exitCode !== 0) {
            (0, core_1.error)(`dotnet list package (outdated) returned non-zero exitcode: ${result.exitCode}`);
            throw new Error(`dotnet list package (outdated) returned non-zero exitcode: ${result.exitCode}`);
        }
        const outdated = this.parseListOutput(result.stdout);
        if (versionFlag !== "") {
            const latestsVersions = await this.listOutdated("latest");
            for (const i in latestsVersions) {
                const wanted = (await outdated).filter(x => x.name === latestsVersions[i].name)[0];
                latestsVersions[i].wanted = wanted ? wanted.wanted : latestsVersions[i].current;
            }
            return latestsVersions;
        }
        return outdated;
    }Name: Newtonsoft.Json 
 
                                    Current: 11.0.2
                                    Latest: 13.0.2 
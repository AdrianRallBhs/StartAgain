### Hello Adrianoasync listPackages() {
        const result = await this.exec(['list', this.projectfile, 'package']);
        if (result.exitCode !== 0) {
            (0, core_1.error)(`dotnet list package returned non-zero exitcode: ${result.exitCode}`);
            throw new Error(`dotnet list package returned non-zero exitcode: ${result.exitCode}`);
        }
    }
const { input, editor } = require("@inquirer/prompts");
const fs = require("fs/promises");
const path = require("path");
const { exec } = require("./exec");

module.exports.Bundler = class Bundler {
  workingDirPath = path.join(__dirname, "/temp");

  async bundle() {
    try {
      await this.promptUserForPackageDetails();
      await this.initWorkingDir();
      await this.createDTSFile();
    } catch (e) {
      console.error(e);
    } finally {
      await this.cleanup();
    }
  }

  async promptUserForPackageDetails() {
    await this.promptUserForPackageName();
    await this.promptUserForDependencies();
    await this.promptUserForExternalInlines();
    await this.promptUserForTSConfig();
    await this.promptUserForOutputPath();
  }

  async initWorkingDir() {
    await fs.mkdir(this.workingDirPath);
    await exec("npm init -y", { cwd: this.workingDirPath });
    await exec("npm i " + this.dependencies, { cwd: this.workingDirPath });

    await fs.writeFile(
      path.join(this.workingDirPath, "/index.ts"),
      `export * from '${this.packageName}';`,
      "utf-8"
    );

    await fs.writeFile(
      path.join(this.workingDirPath, "/tsconfig.json"),
      this.tsConfig,
      "utf-8"
    );
  }

  async createDTSFile() {
    const pathToDTSBundleGenerator = path.join(
      __dirname,
      "/node_modules/.bin/dts-bundle-generator"
    );

    const pathToInput = path.join(this.workingDirPath, "/index.ts");

    const options = [
      "--no-check",
      "--export-referenced-types=false",
      "--out-file " + this.outputPath,
      "--external-inlines " + this.packageName + " " + this.externalInlines,
      "--",
    ];

    const command = [pathToDTSBundleGenerator, ...options, pathToInput].join(
      " "
    );

    await exec(command);
  }

  async cleanup() {
    await fs.rm(this.workingDirPath, { recursive: true, force: true });
  }

  async promptUserForPackageName() {
    this.packageName = await input({
      message:
        "What is the name of the package you would like to create a .d.ts file for?",
    });
  }

  async promptUserForDependencies() {
    this.dependencies = await input({
      message:
        "What dependencies should be installed? Enter as a space-separated list. Include the package to be bundled in the list.",
    });
  }

  async promptUserForExternalInlines() {
    this.externalInlines = await input({
      message:
        "What dependencies' type definitions should be inlined into the .d.ts file? Enter as space-separated list.",
    });
  }

  async promptUserForTSConfig() {
    this.tsConfig = await editor({
      message:
        "Enter am appropriate tsconfig file into the editor, save the file, and close the editor.",
    });
  }

  async promptUserForOutputPath() {
    this.outputPath = await input({
      message: "Enter a file path to which to write the output.",
    });
  }

  async initNodeProject() {}
};

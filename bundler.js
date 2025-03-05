const { input, confirm, editor } = require("@inquirer/prompts");
const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const { exec } = require("./exec");

class Bundler {
  tempDirPath = path.join(__dirname, "/temp");

  async bundle() {
    try {
      await this.promptUser();
      await this.initWorkingDirectory();
      await this.bundleTypeDefs();
    } catch (e) {
      console.error(e);
    } finally {
      await this.cleanup();
    }
  }

  async promptUser() {
    this.greetUser();
    await this.promptForDependencies();
    await this.promptForEntryPoint();
    await this.promptForExternalInlines();
    await this.promptForTSConfig();
    await this.promptForOutputPath();
  }

  async initWorkingDirectory() {
    await this.createTempDirectory();
    await this.initNodeProject();
  }

  async bundleTypeDefs() {
    const pathToBin = path.join(
      __dirname,
      "/node_modules/.bin/dts-bundle-generator"
    );

    const pathToEntryPoint = path.join(
      this.tempDirPath,
      "/node_modules",
      this.entryPoint
    );

    await exec(
      pathToBin +
        " --no-check --out-file " +
        this.outputPath +
        " --external-inlines " +
        this.externalInlines +
        " -- " +
        pathToEntryPoint
    );
  }

  async cleanup() {
    await fs.rm(this.tempDirPath, {
      recursive: true,
      force: true,
    });
  }

  greetUser() {
    console.log(
      chalk.blue.bold(
        "Welcome! This CLI application will help you bundle your type definitions into a single file."
      )
    );
  }

  async promptForDependencies() {
    this.dependencies = await input({
      message: chalk.green(
        "What packages should be installed? Enter them as a space separated list."
      ),
    });
  }

  async promptForEntryPoint() {
    let entryPoint = await input({
      message: chalk.magenta(
        "From within the node modules folder, what is the path to the .d.ts file you want to bundle?"
      ),
    });

    entryPoint = entryPoint.trim();

    if (
      !(
        entryPoint.startsWith("/") ||
        entryPoint.startsWith("./") ||
        entryPoint.startsWith("../")
      )
    ) {
      entryPoint = "/" + entryPoint;
    }

    this.entryPoint = entryPoint;
  }

  async promptForExternalInlines() {
    this.externalInlines = await input({
      message: chalk.green(
        "Which external packages should have their type declarations inlined into the bundled .d.ts file? Enter them as a space separated list."
      ),
    });
  }

  async promptForTSConfig() {
    console.log(chalk.yellow("/!\\ A tsconfig.json file is required."));

    const needsTSConfig = await confirm({
      message: "Do you need to add a tsconfig file for the module?",
    });

    if (needsTSConfig) {
      this.tsConfigFile = await editor({
        message: chalk.blue(
          "Paste the contents of the tsconfig file into the editor, save the file, and the close the editor."
        ),
      });
    } else {
      this.tsConfigFile = null;
    }
  }

  async promptForOutputPath() {
    const outputPath = await input({
      message: chalk.green(
        "Please enter a path to which the output should be written."
      ),
    });

    this.outputPath = outputPath.trim();
  }

  async createTempDirectory() {
    await fs.mkdir(this.tempDirPath);
  }

  async initNodeProject() {
    await exec("npm init -y", { cwd: this.tempDirPath });
    await exec("npm i " + this.dependencies, { cwd: this.tempDirPath });
    if (this.tsConfigFile) {
      const pathToTSConfig = path.join(
        this.tempDirPath,
        "/node_modules",
        this.entryPoint.slice(0, this.entryPoint.lastIndexOf("/")),
        "/tsconfig.json"
      );
      await fs.writeFile(pathToTSConfig, this.tsConfigFile, "utf-8");
    }
  }
}

module.exports.Bundler = Bundler;

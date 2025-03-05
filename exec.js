const childProcess = require("child_process");
const { promisify } = require("util");

const exec = promisify(childProcess.exec);

module.exports.exec = exec;

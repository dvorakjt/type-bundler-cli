const { Bundler } = require("./bundler");

main();

function main() {
  const bundler = new Bundler();
  bundler.bundle();
}

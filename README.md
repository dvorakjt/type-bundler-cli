# Type Bundler CLI

This is a simple CLI application built on top of https://github.com/timocov/dts-bundle-generator that facilitates
bundling of all type definitions including those imported from external libraries into a single .d.ts file, for
example, to use in conjunction with the Monaco code editor.

# Usage

1. Clone the project locally.
2. CD into the project directory.
3. Install dependencies: `npm i`
4. Run the application: `node index.js`
5. Fill out the prompts.
6. Profit!

# Notes

You will need to know a little bit about the type definitions you are bundling, for instance, from which external libraries are types imported, what peer dependencies must be installed, do the type definitions you are bundling ship with a tsconfig.json, etc.

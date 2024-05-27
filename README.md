# PianoToGuitar

## Prerequisites

- [Node.js](https://nodejs.org/) (Ensure you have the latest LTS version installed)

## Installation

1. **Clone the repository:**

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```sh
   make "mpn install"
   ```

## Running the Testing Server

To start the testing server, use the following command:

```sh
make "npm run start"
```

This will launch the server and you can access the application in your browser at the specified localhost address.

## Building the Project

To build the project for production, use the following command:

```sh
make "npm run build"
```

The build artifacts will be stored in the `dist/` directory. This command bundles the project files and optimizes them for production.

## Configuration Files

### .terserrc

The `.terserrc` file contains configurations for [Terser](https://github.com/terser/terser), a JavaScript compressor and minifier tool used to reduce the size of the JavaScript files.

### .parcelrc

The `.parcelrc` file configures [Parcel](https://parceljs.org/), a web application bundler. This file includes the setup for various plugins used in the project, such as the JavaScript obfuscator plugin.

### javascript-obfuscator.config.json

The `javascript-obfuscator.config.json` file contains settings for the [JavaScript Obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator). These settings help obfuscate the JavaScript code to make it more difficult to understand and reverse-engineer. For more information on the available settings, refer to the [JavaScript Obfuscator README](https://github.com/javascript-obfuscator/javascript-obfuscator?tab=readme-ov-file#preset-options).

### package.json

The `package.json` file is essential for Node.js projects. It includes metadata about the project and lists the dependencies. In this project, there is a `staticFiles` section that defines the static audio files to be bundled by the Parcel plugin `parcel-reporter-static-files-copy`. For more details, check the [parcel-reporter-static-files-copy documentation](https://www.npmjs.com/package/parcel-reporter-static-files-copy).

## Parcel Plugins Used

- [@rbf/parcel-optimizer-javascript-obfuscator](https://www.npmjs.com/package/@rbf/parcel-optimizer-javascript-obfuscator): This plugin is used for obfuscating JavaScript code during the build process.
- [parcel-reporter-static-files-copy](https://www.npmjs.com/package/parcel-reporter-static-files-copy): This plugin copies static files into the build directory, ensuring that necessary assets like audio files are included in the final build.

## License

This project is proprietary and confidential; all rights are reserved, and no use, modification, distribution, or access is permitted without explicit written permission from the owner.

---
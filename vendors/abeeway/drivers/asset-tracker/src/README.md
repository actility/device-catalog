# To update and re-publish this package, follow these steps:
1. Clone this repo: https://github.com/actility/device-catalog
2. Go to ./vendors/abeeway/drivers/asset-tracker
3. Copy-paste the package.json into the src folder
4. Change the "main" property from "./main.js" to "./index.js"
5. Create a README.md file inside the src folder and copy-paste the contents from here.
6. Run npm link inside the src folder
7. Test that all the functions are correctly exported by creating a local tmp project, running npm link asset-tracker in it and running to see if all exported functions are available
8. Publish as an unscoped package onto npmjs (refer to the official npmjs documentation: https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
9. Discard all changes
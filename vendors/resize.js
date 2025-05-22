const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const sharp = require('sharp');

async function resizeImages() {
    const vendors = fs.readdirSync(path.join(__dirname, '../vendors')).filter(folder => !folder.includes(".js"));
    console.log("Number of vendors: " + vendors.length);
    for(let vendor of vendors) {
        const vendorPath = path.join(__dirname, '../vendors', vendor);
        const vendorYamlPath = path.join(vendorPath, "vendor.yaml");
        if(fs.existsSync(vendorYamlPath)) {

            const vendorYaml = fs.readFileSync(vendorYamlPath, 'utf8');
            const vendorData = yaml.load(vendorYaml);
            if(vendorData?.logo) {
                const logoPath = path.join(__dirname, '../vendors', vendor, vendorData.logo);
                const outputPath = path.join(__dirname, '../vendors', vendor, 'resized_' + vendorData.logo);
                await resizeLogo(logoPath, outputPath);
            }
        }

        if(fs.readdirSync(vendorPath).includes("models")){
            const models = fs.readdirSync(path.join(vendorPath, "models"));
            for(let model of models) {
                const modelPath = path.join(vendorPath, "models", model);
                const modelImages = fs.readdirSync(modelPath).filter(file => file.includes(".png") || file.includes(".jpeg") || file.includes(".jpg"));
                for(let modelImage of modelImages) {
                    const logoPath = path.join(modelPath, modelImage);
                    const outputPath = path.join(modelPath, "resized_" + modelImage);
                    try {
                        await resizeLogo(logoPath, outputPath);
                    }
                    catch(err) {
                        console.log("Fail resize: " + logoPath);
                    }
                }
            }
        }
    }
    console.log("Number of failed renames: " + failedRenames);
    const filePath = path.join(__dirname, "./missingResize.txt");
    fs.writeFileSync(filePath, missingImages);
}

async function resizeLogo(inputPath, outputPath) {
    try {
        const metadata = await sharp(inputPath).metadata();
        const { width, height } = metadata;

        if(Math.abs(width - 300) > 100 || Math.abs(height - 300) > 100) {
            
        }

        await sharp(inputPath)
            .resize({
                width: width >= height && width > 400 ? 200 : null,
                height: height > width && height > 400 ? 200 : null,
            })
            .toFile(outputPath);

        changeName(outputPath, inputPath);
    } catch (err) {
        console.error("Fail resize: " + inputPath);
        addImagePath(inputPath);
    }
}

let missingImages = "";

function addImagePath(pathImage) {
    missingImages += "\n" + pathImage;
}

let failedRenames = 0;

function changeName(outputFile, originalName) {
    try {
        fs.unlinkSync(originalName);
        fs.renameSync(outputFile, originalName);
    }
    catch {
        failedRenames++;
        console.log("Fail rename: " + outputFile);
    }
}

resizeImages();
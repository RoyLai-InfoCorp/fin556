const fs = require("fs");

function saveJson(filePath, updates) {
    let data = {};

    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, "utf8");
            data = JSON.parse(fileContent);
        } catch (error) {
            console.error("Error reading JSON file:", error);
            data = {};
        }
    }

    data = { ...data, ...updates };

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Updated ${filePath} successfully`);
    } catch (error) {
        console.error("Error writing JSON file:", error);
        throw error;
    }

    return data;
}

function getAddress(filePath, key) {
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} does not exist`);
        return null;
    }

    try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(fileContent);

        if (key in data) {
            return data[key];
        } else {
            console.error(`Key "${key}" not found in ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return null;
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports = { saveJson, getAddress, delay };
module.exports = { saveJson, getAddress, delay };

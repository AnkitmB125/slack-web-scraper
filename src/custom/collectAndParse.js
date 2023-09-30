const { collectDataPoints } = require('../collectData/collectData');
const readline = require('readline');
const { parseFile } = require('../parseData/parseData');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const folderPath = 'slack-data';
const SLACK_DATA_FOLDER_PATH = 'slack-data/';

async function deleteFilesInFolder(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        // Loop through the files and delete each one
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);

            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file ${file}:`, unlinkErr);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        });
    });
}

async function collectAndParseData() {
    try {
        await console.log("Deleting data");
        await deleteFilesInFolder(folderPath)
        await console.log("Deleted data");
        await console.log("Collecting data");
        await collectDataPoints();
        await console.log("Parsing data");
        await parseFile();

    } catch (error) {
        console.error("Error:", error.message);
    }
}

app.get("/bocha", async (req, res) => {
    try {
        await collectAndParseData();

        fs.readdir(SLACK_DATA_FOLDER_PATH, (err, files) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            const jsonFiles = files.filter(filePath => filePath.match(/\.json$/))
            const filePaths = jsonFiles.map(filePath => SLACK_DATA_FOLDER_PATH + filePath)
            const jsonData = fs.readFileSync(filePaths[0]);
            const parsedData = JSON.parse(jsonData);
            res.json(parsedData).status(200);
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

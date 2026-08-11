require('dotenv').config();
const { ingestKnowledge } = require('../services/knowledgeService');
const fs = require('fs');

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node ingest_knowledge.js <Title> <path_to_txt_file_or_raw_text> [sourceUrl]");
        console.log('Example: node ingest_knowledge.js "AHA 2024 Guidelines" "./aha_guidelines.txt" "https://aha.org"');
        process.exit(1);
    }

    const title = args[0];
    const textOrPath = args[1];
    const sourceUrl = args[2] || '';

    let textToIngest = textOrPath;

    // Check if it's a file path
    if (fs.existsSync(textOrPath)) {
        console.log(`Reading from file: ${textOrPath}`);
        textToIngest = fs.readFileSync(textOrPath, 'utf8');
    }

    console.log("Starting Vector Embedding Ingestion...");
    await ingestKnowledge(title, textToIngest, sourceUrl);
    console.log("Done!");
}

run();

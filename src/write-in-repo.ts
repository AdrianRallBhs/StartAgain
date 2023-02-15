const core = require('@actions/core');
const fetch = require('node-fetch');

export async function writeInRepo(inputText: string) {
    try {
        // Generate the markdown content
        const markdownContent = `${inputText}`;

        // Construct the API URL
        const baseUrl = `https://api.github.com/repos`;
        const owner = 'AdrianRallBhs';
        const repo = 'rubmarine';
        const filePath = 'README.md';
        const url = `${baseUrl}/${owner}/${repo}/contents/${filePath}`;

        // Create the request body
        const body = {
            message: 'Added output to markdown file',
            content: Buffer.from(markdownContent).toString('base64'),
        };

        // Set the request headers
        const token = process.env.TOKEN;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
        };

        // Send the request to create or update the file
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: headers,
        });

        // Check the response status code
        if (response.status === 200 || response.status === 201) {
            console.log('File created or updated successfully.');
        } else {
            const data = await response.json();
            console.error('Failed to create or update file:', data.message);
        }
    } catch (e) {
        core.setFailed(e);
    }
}
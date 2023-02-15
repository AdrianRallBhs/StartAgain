const core = require('@actions/core');
const github = require('@actions/github');

export async function writeInRepo() {
  try {
    // Generate the markdown content
    const markdownContent = `# Output
    - Item 1
    - Item 2`;

    // Get authenticated instance of the GitHub API
    const token = process.env.TOKEN;
    const octokit = github.getOctokit(token);

    // Create or update the markdown file in the target repository
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: 'AdrianRallBhs',
      repo: 'submarine',
      path: 'README.md',
      message: 'Added output to markdown file',
      content: Buffer.from(markdownContent).toString('base64')
    });

    console.log(result);
  } catch (e) {
    core.setFailed(e);
  }
}
// libs for github 
const core = require('@actions/core');
const github = require('@actions/github');

// get the octokit handle 
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);

async function run() {

    // create the translated comment
    await octokit.rest.actions.reviewPendingDeploymentsForRun({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId,
        environment_ids: [github.context.environmentId],
        state: 'approved',
        Comment: 'Auto-Approved by GitHub Action'
    });
}

// run the action code
run();
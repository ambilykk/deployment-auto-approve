// libs for github 
const core = require('@actions/core');
const github = require('@actions/github');

// get the octokit handle 
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);

async function run() {

    await octokit.rest.actions.getPendingDeploymentsForRun({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId
    }).then((response) => {
        console.log(`Response data`);
        console.log(response.data);

        let env_id =[];
        response.data.forEach(env => {
            env_id.push(env.environment.id);   
            console.log(env.environment);         
        });
        // Approve the pending deployment reviews
        octokit.rest.actions.reviewPendingDeploymentsForRun({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            run_id: github.context.runId,
            environment_ids: env_id,
            state: 'approved',
            Comment: 'Auto-Approved by GitHub Action'
        });

    }).catch((error) => {
        console.log(error);
    });


}

// run the action code
run();
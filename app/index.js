// libs for github 
const core = require('@actions/core');
const github = require('@actions/github');

// get the octokit handle 
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);

async function run() {

    // get all pending deployment reviews for the current workflow run
    await octokit.rest.actions.getPendingDeploymentsForRun({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId
    }).then((response) => {
        
        let env_id = [];
        let env_name ='';
        response.data.forEach(env => {
            env_id.push(env.environment.id);      
            env_name = env_name+ env.environment.name+',';      
        });

        // Approve, in case of there is any pending review requests
        if (typeof env_id !== 'undefined' && env_id.length > 0) {
            // Approve the pending deployment reviews
            octokit.rest.actions.reviewPendingDeploymentsForRun({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                run_id: github.context.runId,
                environment_ids: env_id,
                state: 'approved',
                comment: 'Auto-Approved by GitHub Action for environments '+env_name
            });
        }

    }).catch((error) => {
        console.log(error);
    });
}

// run the action code
run();
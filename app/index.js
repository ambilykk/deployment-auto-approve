// libs for github 
const core = require('@actions/core');
const github = require('@actions/github');

// get the octokit handle 
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);

async function run() {

    try {
        // get all pending deployment reviews for the current workflow run
        let response = await octokit.rest.actions.getPendingDeploymentsForRun({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            run_id: github.context.runId
        });

        let env_id = [];
        let env_name = '';
        let reviewers = [];
        let isReviewer = false;
        response.data.forEach(env => {
            env_id.push(env.environment.id);
            env_name = env_name + env.environment.name + ',';

            // check if the current user is a reviewer for the environment
            env.reviewers.forEach(reviewerObj => {
                // If the reviewer is a User
                if (reviewerObj.type == 'User' && !isReviewer) {
                    console.log('Reviewer is a User - ' + reviewerObj.reviewer.login);
                    if (reviewerObj.reviewer.login == github.context.actor) {
                        isReviewer = true;
                        reviewers.push(reviewerObj.reviewer.login);
                    }
                }
                // If the reviewer is a Team
                if (reviewerObj.type == 'Team' && !isReviewer) {
                    reviewers.push(reviewerObj.reviewer.name);

                    await octokit.rest.teams.getMembershipForUserInOrg({
                        org: github.context.repo.owner,
                        team_slug: reviewerObj.reviewer.slug,
                        username: github.context.actor
                    }).then((response) => {
                        console.log(` team membership checked for ${github.context.actor} in team ${reviewerObj.reviewer.slug}`);
                        console.log(` response: ${response.status}`);
                        if (response.status == 200) {
                            isReviewer = true;
                        }
                    }).catch((error) => {
                        console.log(` team membership check failed for ${github.context.actor} in team ${reviewerObj.reviewer.name}`);
                    });;

                }
            });
        });

        // if the current user is not a reviewer, display the list of reviewers and exit
        if (!isReviewer) {
            // Writing to build log            
            core.notice('Auto Approval Not Possible; current user is not a reviewer for the environment(s) - ' + env_name);
            core.info('Reviewers: ' + reviewers.join(','));
        } else {
            // Approve, in case of there is any pending review requests
            if (typeof env_id !== 'undefined' && env_id.length > 0) {
                // Approve the pending deployment reviews
                await octokit.rest.actions.reviewPendingDeploymentsForRun({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    run_id: github.context.runId,
                    environment_ids: env_id,
                    state: 'approved',
                    comment: 'Auto-Approved by GitHub Action for environment(s) - ' + env_name
                });
                // Adding to deployment Summary
                core.summary.addHeading(' :white_check_mark: Auto Approval Status');
                core.summary.addQuote('Auto-Approved by GitHub Action. Reviewer: ' + github.context.actor);
                core.summary.write();
            }
        }

    } catch (error) {
        console.log(error);
    };
}

// run the action code
run();
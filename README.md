# Deployment Auto Approve
Automatic approval of pending deployments that are waiting on approval by a required reviewer. 

*Note: Required reviewers with read access to the repository contents and deployments can use this action to bypass the approval*


# How to Use the Action

## PAT Token
Create a PAT token to get access to the Deployment and Environment details. Pass this token as an input to the action - GITHUB_TOKEN


## action in workflow

Include the deployment-auto-approve action in your workflow. 

Following is the sample code for integrating this action with your workflow. 
Sample workflow defines three jobs - First, Second and Third. Third job runs on environment 'demo', configured with [Environment Protection Rule (Required reviewers)](https://docs.github.com/en/enterprise-cloud@latest/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules).

Auto Approval is controlled using the workflow input - **approve_deploy**

```
jobs:
  First:
    name: First
    runs-on: ubuntu-latest      
    steps:
     - name: Hello World
       run: | 
          echo "Hello from first job"
  Second:
    name: Second
    runs-on: ubuntu-latest  
    steps:
     - name: Second job       
       run: | 
          echo "Hello from first job"
     - name: checkout
       uses: actions/checkout@v3
        
     - name: Auto approve
       if: ${{ inputs.approve_deploy == 'approve' }}
       uses: techrill88/deployment-auto-approve@main
       with:
         GITHUB_TOKEN: ${{secrets.GH_TOKEN}}   
          
  Third:
    runs-on: ubuntu-latest  
    environment: demo
    steps:             
      - name: Final job   
        run: |
         echo "Third job"        
```

## Parameters

| Name                           | Required  | Description                                                                      |
|--------------------------------|------------|----------------------------------------------------------------------|
| GITHUB_TOKEN                 | Yes | PAT Token for access    |



# License

The scripts and documentation in this project are released under the [MIT License](https://github.com/actions/download-artifact/blob/main/LICENSE)

@Library('jenkins-library') _

def selectedEnvironment = input(
    id: 'environmentChoice',
    message: 'Select tag:',
    parameters: [
        choice(
            name: 'ENVIRONMENT',
            choices: ['test', 'stage', 'prod'],
            description: 'Select the build environment'
        )
    ]
)

def dockerTagEnvironment = (selectedEnvironment == 'test') ? 'dev' : selectedEnvironment

if (env.BRANCH_NAME == "master" || env.BRANCH_NAME == "develop") {
    buildEnvironment = ['VUE_CLI_KEEP_TEST_ATTRS': true]
} else {
    buildEnvironment = [:]
}

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'polkaswap/ton-explorer',
    buildDockerImage: 'build-tools/node:22-alpine',
    dockerRegistryCred: 'bot-polkaswap-rw',
    preBuildCmds: [],
    buildCmds: ["cd dapp && yarn && yarn build --mode ${selectedEnvironment}"],
    testCmds: [],
    dockerImageTags: ['updated-ton-contracts': "${dockerTagEnvironment}"]
)
pipeline.runPipeline()

@Library('jenkins-library') _

if (env.BRANCH_NAME == "master" || env.BRANCH_NAME == "develop") {
    buildEnvironment = ['VUE_CLI_KEEP_TEST_ATTRS': true]
} else {
    buildEnvironment = [:]
}

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'polkaswap/ton-explorer',
    buildDockerImage: 'build-tools/node:20-alpine',
    dockerRegistryCred: 'bot-polkaswap-rw',
    preBuildCmds: ['cd dapp && yarn'],
    buildCmds: ['yarn build'],
    dockerImageTags: ['updated-ton-contracts': 'dev']
)
pipeline.runPipeline()

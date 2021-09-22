# Role Based Access Control, Serverless, proof of concept

Role Based Access Control proof of concept / experiment, based on [Casbin](https://casbin.org/), AWS [Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/)

## Goals

Many applications end up reinventing wheels by building tightly coupled permissions that rot and become difficult to change. The aims of this poc are:

- Evaluate whether a serverless microservice api can be used to serve multiple backend API and FE UI systems.
- Re-use of the [Casbin](https://casbin.org/) engine.
- Later: Adding a react page to manage the permissions.

## Getting Started

You will need an AWS account with access key credentials. In practice I simply export them on the command line of the current session. Other options are documented on the [serverless website](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

- ` export AWS_ACCESS_KEY_ID=<your-key-here>`
- ` export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>`

### Software

- [Node.js](https://nodejs.org/en/), `14.17.6` (LTS)
- [Servlerless framework](https://www.serverless.com/), `2.59.0`

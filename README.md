# Role Based Access Control, Serverless, proof of concept <!-- omit in toc -->

Role Based Access Control proof of concept / experiment, based on [Casbin](https://casbin.org/), AWS [Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/)

## Table of Contents  <!-- omit in toc -->

- [Goals](#goals)
- [Getting Started](#getting-started)
  - [Software Used](#software-used)
  - [Deployment](#deployment)
    - [Install Dependencies](#install-dependencies)
    - [Export AWS Credentials (Optional)](#export-aws-credentials-optional)
    - [Deploy](#deploy)
  - [Invocation](#invocation)
    - [Endpoints](#endpoints)
- [References](#references)
- [Up Next / TODO](#up-next--todo)

## Goals

Many applications end up reinventing wheels by building tightly coupled permissions that rot and become difficult to change. The aims of this poc are:

- Evaluate whether a serverless microservice api can be used to serve multiple backend API and FE UI systems.
- Re-use of the [Casbin](https://casbin.org/) engine.
- Later: Adding a react page to manage the permissions.

## Getting Started

You will need an AWS account with access keys. In practice I [export them on the command line](#export-aws-credentials-optional)[^1] of the current session. Other options are documented on the [serverless website](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

[^1]: I use disposable 4 hour AWS accounts, from ACloudGuru.

### Software Used

- [Node.js](https://nodejs.org/en/), `14.17.6` (LTS)
- [Servlerless framework](https://www.serverless.com/), `2.59.0`

### Deployment

#### Install Dependencies

```bash
npm install
```

#### Export AWS Credentials (Optional)

If not already configured. _Note:_ [The leading space is intentional](https://stackoverflow.com/questions/6475524/do-i-prevent-commands-from-showing-up-in-bash-history)

```bash
 export AWS_ACCESS_KEY_ID=<your-key-here> && export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

#### Deploy

```bash
serverless deploy
```

### Invocation

After successful deployment, the output will contain an endpoint. Take note of this and replace `<your-endpoint-here>` in subsequent commands.

```bash
...
endpoints:
  ANY - https://xxxxxx.execute-api.us-east-1.amazonaws.com
...
```

#### Endpoints

The implementation is `rbac_with_resource_roles`

The model is defined in a [static file](casbin-config/rbac_with_resource_roles_model.conf).

The policies are loaded via the `/seed` endpoint. See [rbac_with_resource_roles_model.conf](casbin-config/rbac_with_resource_roles_model.conf) for the policies used in the code.

| Route                     | HTTP Method | Description                                          |
| ------------------------- | ----------- | ---------------------------------------------------- |
| `/seed`                   | GET         | Seeds sample policies into dynamoDB                  |
| `/enforce/:sub/:obj/:act` | GET         | Tests a subject, object, action against the policies |

Example call:

```bash
curl <your-endpoint-here>/enforce/alice/data1/read
```

Which will respond with:

```json
{"sub":"alice","obj":"data1","act":"read","result":true}
```

## References

- [Serverless Framework Node Express API on AWS template](https://github.com/serverless/examples/tree/master/aws-node-express-dynamodb-api)
- [casbin-dynamodb-adapter](https://github.com/fospitia/casbin-dynamodb-adapter)
- [node-casbin](https://github.com/casbin/node-casbin)
- [casbin example models & policies](https://github.com/casbin/casbin/tree/master/examples)

## Up Next / TODO

- [x] Move [casbin model](casbin-config/rbac_with_resource_roles_model.conf) into DynamoDB (Models shouldn't be in a public repo!)
- [x] Convert the api to use Casbin with dynamodb. See [here](https://www.nearform.com/blog/access-control-node-js-fastify-and-casbin/) for ideas.
- [ ] Define a clean api
  - [ ] Wrap the readonly parts of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)
  - [ ] Maybe add Swagger / openAPI
- [x] Remove the template API
- [ ] Define a more realistic scenario of groups and users.
  - [ ] Load test
- [ ] React (Next.js?) management front page
  - [ ] Use the mutating sections of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)
  - [ ] Consider Next.js for the complete implementation?
- [ ] Specify DynamoDB `ProvisionedThroughput` as defined in the [Python Driver](https://github.com/abqadeer/python-dycasbin/blob/master/python_dycasbin/adapter.py) 
- [ ] Configure local dynamodb in docker.

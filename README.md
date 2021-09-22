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
    - [Casbin Endpoint](#casbin-endpoint)
  - [Template API (to be deleted)](#template-api-to-be-deleted)
    - [Creating a New User](#creating-a-new-user)
    - [Retrieve the User by `userId`](#retrieve-the-user-by-userid)
    - [Error for Unknown User](#error-for-unknown-user)
- [References](#references)
- [Up Next / TODO](#up-next--todo)

## Goals

Many applications end up reinventing wheels by building tightly coupled permissions that rot and become difficult to change. The aims of this poc are:

- Evaluate whether a serverless microservice api can be used to serve multiple backend API and FE UI systems.
- Re-use of the [Casbin](https://casbin.org/) engine.
- Later: Adding a react page to manage the permissions.

## Getting Started

You will need an AWS account with access keys. In practice I [export them on the command line](#export-aws-credentials-optional) of the current session. Other options are documented on the [serverless website](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

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

#### Casbin Endpoint

The current implementation uses static files from the casbin [examples repository](https://github.com/casbin/casbin/tree/master/examples). The model is `rbac_with_resource_roles`. These can be found in the [casbin-config](casbin-config) directory.

There is currently 1 GET endpoint, `/casbin/:sub/:obj/:act` that returns json. Example call:

```bash
curl <your-endpoint-here>/casbin/alice/data1/read
```

Which will respond with:

```json
{"sub":"alice","obj":"data1","act":"read","result":true}
```

### Template API (to be deleted)

#### Creating a New User

```bash
curl --request POST '<your-endpoint-here>/users' --header 'Content-Type: application/json' --data-raw '{"name": "John", "userId": "someUserId"}'
```

Success will result in the following response:

```json
{"userId":"someUserId","name":"John"}
```

#### Retrieve the User by `userId`

 ```bash
 curl <your-endpoint-here>/users/someUserId
 ```

Which should result in the following response:

```json
{"userId":"someUserId","name":"John"}
```

#### Error for Unknown User

 ```bash
 curl <your-endpoint-here>/users/someUnknownUserId
 ```

 Which will result in the following response:

 ```json
 {"error":"Could not find user with provided \"userId\""}
 ```

## References

- [Serverless Framework Node Express API on AWS template](https://github.com/serverless/examples/tree/master/aws-node-express-dynamodb-api)
- [casbin-dynamodb-adapter](https://github.com/fospitia/casbin-dynamodb-adapter)
- [node-casbin](https://github.com/casbin/node-casbin)
- [casbin example models & policies](https://github.com/casbin/casbin/tree/master/examples)

## Up Next / TODO

- Move [casbin model](casbin-config/rbac_with_resource_roles_model.conf) into DynamoDB (Models shouldn't be in a public repo!)
- Convert the api to use Casbin with dynamodb. See [here](https://www.nearform.com/blog/access-control-node-js-fastify-and-casbin/) for ideas.
- Define a clean api
  - Wrap the readonly parts of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)
  - Maybe add Swagger / openAPI
- Remove the template API
- Define a more realistic scenario of groups and users.
  - Load test
- React management front page
  - Use the mutating sections of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)

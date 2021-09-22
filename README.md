# Role Based Access Control, Serverless, proof of concept <!-- omit in toc -->

Role Based Access Control proof of concept / experiment, based on [Casbin](https://casbin.org/), AWS [Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/)

## Table of Contents  <!-- omit in toc -->

- [Goals](#goals)
- [Getting Started](#getting-started)
  - [Software](#software)
  - [Deployment](#deployment)
    - [Install Dependencies](#install-dependencies)
    - [Export AWS Credentials (Optional)](#export-aws-credentials-optional)
    - [Deploy](#deploy)
  - [Invocation](#invocation)
    - [Creating a New User](#creating-a-new-user)
    - [Retrieve the User by `userId`](#retrieve-the-user-by-userid)
    - [Error for Unknown User](#error-for-unknown-user)

## Goals

Many applications end up reinventing wheels by building tightly coupled permissions that rot and become difficult to change. The aims of this poc are:

- Evaluate whether a serverless microservice api can be used to serve multiple backend API and FE UI systems.
- Re-use of the [Casbin](https://casbin.org/) engine.
- Later: Adding a react page to manage the permissions.

## Getting Started

You will need an AWS account with access keys. In practice I [export them on the command line](#export-aws-credentials-optional) of the current session. Other options are documented on the [serverless website](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

### Software

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
 export AWS_ACCESS_KEY_ID=<your-key-here> && \ 
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
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

#### Creating a New User

```bash
curl --request POST '<your-endpoint-here>/users' --header 'Content-Type: application/json' --data-raw {"name": "John", "userId": "someUserId"}'
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

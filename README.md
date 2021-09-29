# Role Based Access Control, Serverless, proof of concept <!-- omit in toc -->

Role Based Access Control proof of concept / experiment, based on [Casbin](https://casbin.org/), AWS [Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/)

## Table of Contents  <!-- omit in toc -->

- [Goals](#goals)
- [Scenario](#scenario)
  - [Groups](#groups)
- [Getting Started](#getting-started)
  - [Software Used](#software-used)
  - [Deployment](#deployment)
    - [Install Dependencies](#install-dependencies)
    - [Export AWS Credentials (Optional)](#export-aws-credentials-optional)
    - [Deploy](#deploy)
  - [Invocation](#invocation)
    - [Endpoints](#endpoints)
    - [Group or user level enforcement](#group-or-user-level-enforcement)
- [Discussion](#discussion)
  - [Why node and express?](#why-node-and-express)
  - [Why DynamoDB?](#why-dynamodb)
- [References](#references)
- [Up Next / TODO](#up-next--todo)

## Goals

Many applications end up reinventing wheels by building tightly coupled permissions that rot and become difficult to change. The aims of this poc are:

- Evaluate whether a serverless microservice api can be used to serve multiple client systems (backend API and FE UI).
- Re-use of the [Casbin](https://casbin.org/) engine.
- Later: Adding a react page to manage the permissions.

## Scenario

The set of [users & groups policies](casbin-config/rbac_resource_roles_policy.json) is intended to provide a reasonably sane model with realistic volume of data.

### Groups

Each of the 4 groups "owns" 2 `obj`ects that can be `act`ed on. Each `obj`ect can be `act`ioned following the CRUD model. (`create`, `read`, `update`, `delete`).

100 users were randomly generated and assigned to a group.  
To validate that users can be assigned to multiple groups, the user, `donella.bilbrey@legalandfinance.com` belongs to both the `legal` and `finance` groups.

- sales, 26 users.
  - monthly_sales_report
  - annual_sales_report
- development, 28 users.
  - release_to_staging
  - release_to_production
- finance, 30 users.
  - monthly_accounts
  - annual_accounts
- legal, 16 users.
  - sales_contract
  - employment_contract

## Getting Started

You will need an AWS account with [access keys configured](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/). I have access to short term AWS accounts so can safely [export them on the command line](#export-aws-credentials-optional).

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
 export AWS_ACCESS_KEY_ID=<your-key-here> && export AWS_SECRET_ACCESS_KEY=<your-secret-key-here> && export AWS_DEFAULT_REGION=eu-west-2
```

#### Deploy

```bash
serverless deploy
```

### Invocation

After successful deployment, the serverless output will contain an endpoint. Take note of this and replace `<your-endpoint-here>` in subsequent commands.

```bash
...
endpoints:
  ANY - https://xxxxxx.execute-api.us-east-1.amazonaws.com
...
```

#### Endpoints

The implementation is `rbac_with_resource_roles` with the model defined in a [static file](casbin-config/rbac_with_resource_roles_model.conf). The role `g2` is currently unused.

Policies are loaded via the `/seed` endpoint. See [rbac_with_resource_roles_policy.csv](casbin-config/rbac_with_resource_roles_policy.csv) for the definition of the policies used in the code.

| Route                     | HTTP Method | Description                                          |
| ------------------------- | ----------- | ---------------------------------------------------- |
| `/clear`                   | GET         | Development convenience method to remove all policies from the DB.                  |
| `/seed`                   | GET         | Seeds the [sample](casbin-config/rbac_resource_roles_policy.json) policies into dynamoDB                  |
| `/enforce/:sub/:obj/:act` | GET         | Tests a subject, object, action against the seeded policies |

Example call:

```bash
curl <your-endpoint-here>/enforce/angus.muldoon@development.com/release_to_staging/create
```

Which will respond with:

```json
{"sub":"angus.muldoon@development.com","obj":"release_to_staging","act":"create","result":true}
```

#### Group or user level enforcement

The `/enforce/:sub/:obj/:act` endpoint can be queried with a `:sub` of a user or group. EG:

- `curl <your-endpoint-here>/enforce/angus.muldoon@development.com/release_to_staging/create`
- `curl <your-endpoint-here>/enforce/development/release_to_staging/create`

## Discussion

### Why node and express?

Casbin is implemented in a number of languages. Go appears to be the best supported and "native" language. node.js was selected as it is widely supported with plugins, easily understood and [cold startup times](https://mikhail.io/serverless/coldstarts/aws/) in lambda are fast.

The aim is to be a Casbin "wrapper", therefore little custom code is needed.

### Why DynamoDB?

DynamoDB is serverless and fully managed. The maintenance overhead is low.

Typically permissions are a read heavy workload. If performance becomes an issue then [DAX](https://aws.amazon.com/dynamodb/dax/) should be evaluated.

Alternatively Casbin has support for a wide range of [backend storage adaptors](https://casbin.org/docs/en/adapters) so the implementation can easily be changed depending on throughput requirements.

## References

- [Serverless Framework Node Express API on AWS template](https://github.com/serverless/examples/tree/master/aws-node-express-dynamodb-api)
- [casbin-dynamodb-adapter](https://github.com/fospitia/casbin-dynamodb-adapter)
- [node-casbin](https://github.com/casbin/node-casbin)
- [casbin example models & policies](https://github.com/casbin/casbin/tree/master/examples)

## Up Next / TODO

- [ ] Define a more realistic scenario of
  - [x] [groups and users](https://www.mockaroo.com/552a1eb0).
  - [x] Realistic operations for the groups
  - [ ] Load test
- [ ] Define a clean api
  - [ ] Wrap the readonly parts of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)
  - [ ] Maybe add Swagger / openAPI
- [ ] React (Next.js?) management front page
  - [ ] Use the mutating sections of the [casbin rbac api](https://casbin.org/docs/en/rbac-api)
  - [ ] Consider Next.js for the complete implementation?
- [ ] Configure local dynamodb in docker for faster (local) development.
- [x] Move [casbin model](casbin-config/rbac_with_resource_roles_model.conf) into DynamoDB (Models shouldn't be in a public repo!)
- [x] Convert the api to use Casbin with dynamodb. See [here](https://www.nearform.com/blog/access-control-node-js-fastify-and-casbin/) for ideas.
- [x] Remove the template API

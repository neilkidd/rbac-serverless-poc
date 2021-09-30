const AWS2 = require('aws-sdk');
const casbin = require('casbin');
const CasbinDynamoDBAdapter = require('casbin-dynamodb-adapter');

const dynamoDbClient = new AWS2.DynamoDB.DocumentClient();

const CASBIN_TABLE = process.env.CASBIN_TABLE;
const casbinTableOpts = {
  tableName: CASBIN_TABLE,
  hashKey: 'id'
};

const defaultPolicies = require('casbin-config/rbac_resource_roles_policy.json');

const enforcer = casbin.newEnforcer(
  'casbin-config/rbac_with_resource_roles_model.conf',
  new CasbinDynamoDBAdapter(dynamoDbClient, casbinTableOpts));

async function enforce(sub, obj, act) {
  const e = await enforcer;
  await e.loadPolicy();

  return await e.enforce(sub, obj, act);
}

async function getRolesForUser(sub) {
  const e = await enforcer;
  await e.loadPolicy();

  return await e.getRolesForUser(sub);
}

async function getImplicitRolesForUser(sub) {
  const e = await enforcer;
  await e.loadPolicy();

  return await e.getImplicitRolesForUser(sub);
}

async function getImplicitPermissionsForUser(sub) {
  const e = await enforcer;
  await e.loadPolicy();

  return await e.getImplicitPermissionsForUser(sub);
}

async function getPermissionsForUser(sub) {
  const e = await enforcer;
  await e.loadPolicy();

  return await e.getPermissionsForUser(sub);
}

async function seed() {
  await clearTableData();
  const policyCount = await loadPolicies();

  return policyCount;
}

async function clearTableData() {
  /**
   * A sufficient, but terrible!, way to Truncate a dynamoDB table
   * The test data set only has a couple of hundred items.
   */
  const rows = await dynamoDbClient.scan({
    TableName: casbinTableOpts.tableName,
    ProjectionExpression: "id"
  }).promise();

  console.log(`clearTableData() : Deleting ${rows.Items.length} records`);

  rows.Items.forEach(async function (element, i) {
    await dynamoDbClient.delete({
      TableName: casbinTableOpts.tableName,
      Key: element,
    }).promise();
  });
}

async function loadPolicies() {
  let policyCount = 0;
  const e = await enforcer;
  await e.loadPolicy();

  defaultPolicies.forEach(async function (policy, index) {
    policyCount++;
    if (policy.policy_type === "p") {
      await e.addPolicy(policy.sub, policy.obj, policy.act);
    } else if (policy.policy_type === "g") {
      await e.addGroupingPolicy(policy.user, policy.group);
    }
  });
  await e.savePolicy();

  return policyCount;
}

module.exports.enforce = enforce;
module.exports.getRolesForUser = getRolesForUser;
module.exports.getImplicitRolesForUser = getImplicitRolesForUser;
module.exports.getImplicitPermissionsForUser = getImplicitPermissionsForUser;
module.exports.getPermissionsForUser = getPermissionsForUser;
module.exports.seed = seed;

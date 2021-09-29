const express = require('express');
const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const Casbin = require('casbin');
const CasbinDynamoDBAdapter = require('casbin-dynamodb-adapter');

const CASBIN_TABLE = process.env.CASBIN_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const casbinTableOpts = {
  tableName: CASBIN_TABLE,
  hashKey: 'id'
};
const cdbAdaptor = new CasbinDynamoDBAdapter(dynamoDbClient, casbinTableOpts);
const allPolicies = require('casbin-config/rbac_resource_roles_policy.json');

const app = express();
app.use(express.json());

app.get("/seed", async function (req, res) {

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    allPolicies.forEach(async function (policy, index) {
      if (policy.policy_type === "p") {
        await enforcer.addPolicy(policy.sub, policy.obj, policy.act);
      } else if (policy.policy_type === "g") {
        await enforcer.addGroupingPolicy(policy.user, policy.group);
      }
    });

    res.json({ "seeded": true });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not seed policies" });
  }
});

app.get("/clear", async function (req, res) {

  /**
   * A sufficient, but terrible!, way to Truncate a dynamoDB table
   * The test data set only has a couple of hundred items.
   */
  try {

    const rows = await dynamoDbClient.scan({
      TableName: casbinTableOpts.tableName,
      ProjectionExpression: "id"
    }).promise();

    const logLine = `Deleting ${rows.Items.length} records`;
    console.log(logLine);

    rows.Items.forEach(async function (element, i) {
      await dynamoDbClient.delete({
        TableName: casbinTableOpts.tableName,
        Key: element,
      }).promise();
    });

    res.json({ "cleared": logLine });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not clear database." });
  }
});


app.get("/enforce/:sub/:obj/:act", async function (req, res) {

  const sub = req.params.sub;
  const obj = req.params.obj;
  const act = req.params.act;

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    // Check permissions.
    const result = await enforcer.enforce(sub, obj, act);
    console.log(result);

    res.json({ sub, obj, act, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve permission" });
  }
});

app.get("/rolesfor/:sub", async function (req, res) {

  const sub = req.params.sub;

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    // Check permissions.
    const result = await enforcer.getRolesForUser(sub);
    console.log(result);

    res.json({ sub, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve roles for user" });
  }
});

app.get("/implicitrolesfor/:sub", async function (req, res) {

  const sub = req.params.sub;

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    // Check permissions.
    const result = await enforcer.getImplicitRolesForUser(sub);
    console.log(result);

    res.json({ sub, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve implicit roles for user" });
  }
});

app.get("/implicitpermissionsfor/:sub", async function (req, res) {

  const sub = req.params.sub;

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    // Check permissions.
    const result = await enforcer.getImplicitPermissionsForUser(sub);
    console.log(result);

    res.json({ sub, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve implicit permissions for user" });
  }
});

app.get("/permissionsfor/:sub", async function (req, res) {

  const sub = req.params.sub;

  try {
    const enforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await enforcer.loadPolicy();

    // Check permissions.
    const result = await enforcer.getPermissionsForUser(sub);
    console.log(result);

    res.json({ sub, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve permissions for user" });
  }
});


app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);

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

const app = express();
app.use(express.json());

app.get("/seed", async function (req, res) {

  try {
    const dbenforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await dbenforcer.loadPolicy();

    await dbenforcer.addPolicy('alice', 'data1', 'read');
    await dbenforcer.addPolicy('bob', 'data2', 'write');
    await dbenforcer.addPolicy('data_group_admin', 'data_group', 'write');

    await dbenforcer.addNamedGroupingPolicy('g', 'alice', 'data_group_admin');
    await dbenforcer.addNamedGroupingPolicy('g2', 'data1', 'data_group');
    await dbenforcer.addNamedGroupingPolicy('g2', 'data2', 'data_group');

    res.json({ "seeded": true });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not seed policies" });
  }
});

app.get("/enforce/:sub/:obj/:act", async function (req, res) {

  const sub = req.params.sub;
  const obj = req.params.obj;
  const act = req.params.act;

  try {
    const dbenforcer = await Casbin.newEnforcer('casbin-config/rbac_with_resource_roles_model.conf', cdbAdaptor);

    // Load policies from the database.
    await dbenforcer.loadPolicy();

    // Check permissions.
    const result = await dbenforcer.enforce(sub, obj, act);
    console.log(result);

    res.json({ sub, obj, act, result });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve permission" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);

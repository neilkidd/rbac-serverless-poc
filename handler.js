require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");

const rbac = require("./rbac");

const app = express();
app.use(express.json());

app.get("/enforce/:sub/:obj/:act", async function (req, res) {
  const sub = req.params.sub;
  const obj = req.params.obj;
  const act = req.params.act;

  try {
    const result = await rbac.enforce(sub, obj, act);

    res.json({ sub, obj, act, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve permission" });
  }
});

app.get("/rolesfor/:sub", async function (req, res) {
  const sub = req.params.sub;

  try {
    const result = await rbac.getRolesForUser(sub);

    res.json({ sub, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve roles for user" });
  }
});

app.get("/implicitrolesfor/:sub", async function (req, res) {
  const sub = req.params.sub;

  try {
    const result = await rbac.getImplicitRolesForUser(sub);

    res.json({ sub, result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Could not retrieve implicit roles for user" });
  }
});

app.get("/implicitpermissionsfor/:sub", async function (req, res) {
  const sub = req.params.sub;

  try {
    const result = await rbac.getImplicitPermissionsForUser(sub);

    res.json({ sub, result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Could not retrieve implicit permissions for user" });
  }
});

app.get("/permissionsfor/:sub", async function (req, res) {
  const sub = req.params.sub;

  try {
    const result = await rbac.getPermissionsForUser(sub);

    res.json({ sub, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve permissions for user" });
  }
});

app.get("/seed", async function (req, res) {
  try {
    const result = await rbac.seed();

    res.json({ seededPolicies: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not seed policies" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);

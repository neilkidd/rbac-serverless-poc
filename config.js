module.exports = {
  aws: {
    region: process.env.RBAC_AWS_REGION,
    endpoint: process.env.RBAC_AWS_ENDPOINT,
    accessKeyId: process.env.RBAC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RBAC_AWS_SECRET_ACCESS_KEY,
  },
  casbin: {
    tableName: process.env.CASBIN_TABLE,
  },
};

const MongoClient = require("mongodb").MongoClient;
const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL || "mongodb://localhost:27017/",
  database: process.env.MONGO_SERVER_DB || "musicify",
};

let _connection = undefined;
let _db = undefined;

module.exports = {
  dbConnection: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(mongoConfig.serverUrl);
      _db = await _connection.db(mongoConfig.database);
    }
    return _db;
  },
  closeConnection: () => {
    _connection.close();
  },
  config: mongoConfig,
};

const dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection.dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

module.exports = {
  users: getCollectionFn("users"),
  songs: getCollectionFn("songs"),
  playlists: getCollectionFn("playlists"),
  albums: getCollectionFn("albums"),
  songReviews: getCollectionFn("songReviews"),
  albumReviews: getCollectionFn("albumReviews"),
};

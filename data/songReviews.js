/*
songReviews Schema
_id: ObjectId
title: String
userID: ObjectId
songID: ObjectId
name: String
rating: Number
comment: String
lastModifiedAt: timestamp (long)
*/

const mongoCollections = require("../config/mongoCollections");
const songReviews = mongoCollections.songReviews;
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
const { UserError } = require("../helpers/userHelper");

async function createSongReview(title, userID, songID, name, rating, comment) {
  if (!title) throw new UserError("You must provide a title");
  if (!userID) throw new UserError("You must provide a user id");
  if (!songID) throw new UserError("You must provide a song id");
  if (!name) throw new UserError("You must provide a name");
  if (!comment) throw new UserError("You must provide a comment");

  if (typeof title !== "string") throw new UserError("Title must be a string");
  if (typeof userID !== "string")
    throw new UserError("User ID must be a string");
  if (typeof songID !== "string")
    throw new UserError("Song ID must be a string");
  if (typeof name !== "string") throw new UserError("Name must be a string");
  if (rating && typeof rating !== "number")
    throw new UserError("Rating must be a number");
  if (typeof comment !== "string")
    throw new UserError("Comment must be a string");

  if (rating && (rating < 1 || rating > 5))
    throw new UserError("Rating must be between 1 and 5 (inclusive)");

  if (!ObjectId.isValid(userID)) throw new UserError("User ID is not valid");
  if (!ObjectId.isValid(songID)) throw new UserError("Song ID is not valid");

  const songReviewsCollection = await songReviews();

  let newSongReview = {
    title: title,
    userID: new ObjectId(userID),
    songID: new ObjectId(songID),
    name: name,
    rating: rating,
    comment: comment,
    lastModifiedAt: Date.now(),
  };

  const insertInfo = await songReviewsCollection.insertOne(newSongReview);
  if (insertInfo.insertedCount === 0)
    throw new Error("Could not add song review");

  const newId = insertInfo.insertedId;

  // Also add song review id to user's songReviews
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: new ObjectId(userID),
  });
  if (user === null) throw new UserError("No user with that id");
  const userSongReviews = user.songReviews || [];
  userSongReviews.push(newId);
  const updateInfo = await usersCollection.updateOne(
    { _id: new ObjectId(userID) },
    { $set: { songReviews: userSongReviews } }
  );
  if (updateInfo.modifiedCount === 0)
    throw new Error("Could not add song review to user");

  const songReview = await this.getSongReviewById(newId);
  return songReview;
}

async function getAllSongReviews() {
  const songReviewsCollection = await songReviews();

  const songReviewList = await songReviewsCollection.find({}).toArray();

  return songReviewList;
}

async function getSongReviewById(id) {
  if (!id) throw new UserError("You must provide an id to search for");

  const songReviewsCollection = await songReviews();
  const songReview = await songReviewsCollection.findOne({
    _id: new ObjectId(id),
  });
  if (songReview === null) throw new Error("No song review with that id");

  return songReview;
}

async function getSongReviewByUserId(userId) {
  if (!userId) throw new UserError("You must provide a user id to search for");

  const songReviewsCollection = await songReviews();
  const songReview = await songReviewsCollection
    .find({
      userID: new ObjectId(userId),
    })
    .toArray();
  if (songReview === null) throw new Error("User has no song reviews");

  return songReview;
}

async function getSongReviewByTitle(title) {
  if (!title) throw new UserError("You must provide a title to search for");

  const songReviewsCollection = await songReviews();
  const songReview = await songReviewsCollection
    .find({
      title: title,
    })
    .toArray();
  if (songReview === null) throw new Error("No song reviews with that title");

  return songReview;
}

async function updateSongReview(id, updatedSongReview) {
  if (!id) throw new UserError("You must provide an id to search for");
  if (!updatedSongReview)
    throw new UserError("You must provide an updated song review");

  const songReviewsCollection = await songReviews();

  const updatedSongReviewData = {};

  if (updatedSongReview.title) {
    updatedSongReviewData.title = updatedSongReview.title;
  }

  if (updatedSongReview.userID) {
    updatedSongReviewData.userID = updatedSongReview.userID;
  }

  if (updatedSongReview.songID) {
    updatedSongReviewData.songID = updatedSongReview.songID;
  }

  if (updatedSongReview.name) {
    updatedSongReviewData.name = updatedSongReview.name;
  }

  if (updatedSongReview.rating) {
    updatedSongReviewData.rating = updatedSongReview.rating;
  }

  if (updatedSongReview.comment) {
    updatedSongReviewData.comment = updatedSongReview.comment;
  }

  let updateCommand = {
    $set: updatedSongReviewData,
  };
  const query = {
    _id: new ObjectId(id),
  };
  await songReviewsCollection.updateOne(query, updateCommand);

  return await getSongReviewById(id);
}

async function deleteSongReview(id) {
  if (!id) throw new UserError("You must provide an id to search for");

  const songReviewsCollection = await songReviews();
  const deletionInfo = await songReviewsCollection.removeOne({
    _id: new ObjectId(id),
  });
  if (deletionInfo.deletedCount === 0) {
    throw new Error(`Could not delete song review with id of ${id}`);
  }
}

async function getSongReviewBySongId(songId) {
  if (!songId) throw new UserError("You must provide a song id to search for");

  const songReviewsCollection = await songReviews();
  const songReview = await songReviewsCollection
    .find({
      songID: new ObjectId(songId),
    })
    .toArray();
  if (songReview === null) throw new Error("Song has no song reviews");

  return songReview;
}

async function getMostRecentReviewsByUserId(creatorID) {
  // get the 10 most recent reviews with lastModifiedAt with creatorID
  if (!creatorID)
    throw new UserError("You must provide a creator id to search for");
  const songReviewsCollection = await songReviews();
  const songReview = await songReviewsCollection
    .find({
      userID: new ObjectId(creatorID),
    })
    .sort({ lastModifiedAt: -1 })
    .limit(10)
    .toArray();
  

  return songReview;
}

module.exports = {
  createSongReview,
  getAllSongReviews,
  getSongReviewById,
  getSongReviewByUserId,
  getSongReviewByTitle,
  updateSongReview,
  deleteSongReview,
  getSongReviewBySongId,
  getMostRecentReviewsByUserId,
};

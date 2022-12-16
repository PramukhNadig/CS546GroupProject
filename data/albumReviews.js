/*
albumReviews schema
_id: ObjectId
albumID: ObjectId
title: String
userID: ObjectId
name: String
rating: Number
comment: String

*/

const mongoCollections = require("../config/mongoCollections");
const albumReviews = mongoCollections.albumReviews;
const albums = require("./albums");
const { ObjectId } = require("mongodb");

const { UserError } = require("../helpers/userHelper");

async function createAlbumReview(
  albumID,
  title,
  userID,
  name,
  rating,
  comment
) {
  if (!albumID) throw new UserError("You must provide an album id");
  if (!title) throw new UserError("You must provide a title");
  if (!userID) throw new UserError("You must provide a user id");
  if (!name) throw new UserError("You must provide a name");
  if (!rating) throw new UserError("You must provide a rating");
  if (!comment) throw new UserError("You must provide a comment");

  if (typeof title !== "string") throw new UserError("Title must be a string");
  if (typeof userID !== "string")
    throw new UserError("User ID must be a string");
  if (typeof name !== "string") throw new UserError("Name must be a string");
  if (typeof rating !== "number")
    throw new UserError("Rating must be a number");
  if (typeof comment !== "string")
    throw new UserError("Comment must be a string");

  if (rating < 0 || rating > 5)
    throw new UserError("Rating must be between 1 and 5 (inclusive)");

  const albumReviewsCollection = await albumReviews();

  let newAlbumReview = {
    albumID: ObjectId(albumID),
    title: title,
    userID: ObjectId(userID),
    name: name,
    rating: rating,
    comment: comment,
  };

  const insertInfo = await albumReviewsCollection.insertOne(newAlbumReview);
  if (insertInfo.insertedCount === 0)
    throw new Error("Could not add album review");

  const newId = insertInfo.insertedId;

  const albumReview = await this.getAlbumReviewById(newId);
  return albumReview;
}

async function getAllAlbumReviews() {
  const albumReviewsCollection = await albumReviews();

  const albumReviewList = await albumReviewsCollection.find({}).toArray();

  return albumReviewList;
}

async function getAlbumReviewById(id) {
  if (!id) throw new UserError("You must provide an id to search for");

  const albumReviewsCollection = await albumReviews();
  const albumReview = await albumReviewsCollection.findOne({
    _id: ObjectId(id),
  });
  if (albumReview === null) throw new UserError("No album review with that id");

  return albumReview;
}

async function getAlbumReviewsByAlbumId(albumID) {
  if (!albumID)
    throw new UserError("You must provide an album id to search for");

  const albumReviewsCollection = await albumReviews();
  const albumReviewList = await albumReviewsCollection
    .find({
      albumID: ObjectId(albumID),
    })
    .toArray();

  return albumReviewList;
}

async function getAlbumReviewsByUserId(userID) {
  if (!userID) throw new UserError("You must provide a user id to search for");

  const albumReviewsCollection = await albumReviews();
  const albumReviewList = await albumReviewsCollection
    .find({
      userID: ObjectId(userID),
    })
    .toArray();

  return albumReviewList;
}

async function updateAlbumReview(id, updatedAlbumReview) {
  if (!id) throw new UserError("You must provide an id to search for");
  if (!updatedAlbumReview)
    throw new UserError("You must provide an updated album review");

  const albumReviewsCollection = await albumReviews();

  const updatedAlbumReviewData = {};

  if (updatedAlbumReview.albumID) {
    updatedAlbumReviewData.albumID = ObjectId(updatedAlbumReview.albumID);
  }

  if (updatedAlbumReview.title) {
    updatedAlbumReviewData.title = updatedAlbumReview.title;
  }

  if (updatedAlbumReview.userID) {
    updatedAlbumReviewData.userID = ObjectId(updatedAlbumReview.userID);
  }

  if (updatedAlbumReview.name) {
    updatedAlbumReviewData.name = updatedAlbumReview.name;
  }

  if (updatedAlbumReview.rating) {
    updatedAlbumReviewData.rating = updatedAlbumReview.rating;
  }

  if (updatedAlbumReview.comment) {
    updatedAlbumReviewData.comment = updatedAlbumReview.comment;
  }

  let updateCommand = {
    $set: updatedAlbumReviewData,
  };
  const query = {
    _id: ObjectId(id),
  };
  await albumReviewsCollection.updateOne(query, updateCommand);
}

async function deleteAlbumReview(id) {
  if (!id) throw new UserError("You must provide an id to search for");

  const albumReviewsCollection = await albumReviews();
  const deletionInfo = await albumReviewsCollection.removeOne({
    _id: ObjectId(id),
  });
  if (deletionInfo.deletedCount === 0) {
    throw new Error(`Could not delete album review with id of ${id}`);
  }
}

module.exports = {
  createAlbumReview,
  getAllAlbumReviews,
  getAlbumReviewById,
  getAlbumReviewsByAlbumId,
  getAlbumReviewsByUserId,
  updateAlbumReview,
  deleteAlbumReview,
};

/*
songReviews Schema
_id: ObjectId
title: String
userID: ObjectId
songID: ObjectId
name: String
rating: Number
comment: String
*/

const mongoCollections = require("../config/mongoCollections");
const songReviews = mongoCollections.songReviews;
const songs = require("./songs");
const {
    ObjectId
} = require('mongodb');

async function createSongReview(title, userID, songID, name, rating, comment) {
    if (!title) throw "You must provide a title";
    if (!userID) throw "You must provide a user id";
    if (!songID) throw "You must provide a song id";
    if (!name) throw "You must provide a name";
    if (!comment) throw "You must provide a comment";

    if (typeof title !== "string") throw "Title must be a string";
    if (typeof userID !== "string") throw "User ID must be a string";
    if (typeof songID !== "string") throw "Song ID must be a string";
    if (typeof name !== "string") throw "Name must be a string";
    if (typeof rating !== "number") throw "Rating must be a number";
    if (typeof comment !== "string") throw "Comment must be a string";

    if (rating && (rating < 1 || rating > 5)) throw "Rating must be between 1 and 5 (inclusive)";

    if (!ObjectId.isValid(userID)) throw "User ID is not valid";
    if (!ObjectId.isValid(songID)) throw "Song ID is not valid";

    const song = await songs.getSongById(songID);
    if (!song) throw "Song does not exist";

    const songReviewsCollection = await songReviews();

    let newSongReview = {
        title: title,
        userID: ObjectId(userID),
        songID: ObjectId(songID),
        name: name,
        rating: rating,
        comment: comment
    };

    const insertInfo = await songReviewsCollection.insertOne(newSongReview);
    if (insertInfo.insertedCount === 0) throw "Could not add song review";

    const newId = insertInfo.insertedId;

    const songReview = await this.getSongReviewById(newId);
    return songReview;
};

async function getAllSongReviews() {
    const songReviewsCollection = await songReviews();

    const songReviewList = await songReviewsCollection.find({}).toArray();

    return songReviewList;
}

async function getSongReviewById(id) {
    if (!id) throw "You must provide an id to search for";

    const songReviewsCollection = await songReviews();
    const songReview = await songReviewsCollection.findOne({
        _id: ObjectId(id)
    });
    if (songReview === null) throw "No song review with that id";

    return songReview;
}

async function getSongReviewByUserId(userId) {
    if (!userId) throw "You must provide a user id to search for";

    const songReviewsCollection = await songReviews();
    const songReview = await songReviewsCollection.find({
        userID: ObjectId(userId)
    }).toArray();
    if (songReview === null) throw "User has no song reviews";

    return songReview;
}

async function getSongReviewByTitle(title) {
    if (!title) throw "You must provide a title to search for";

    const songReviewsCollection = await songReviews();
    const songReview = await songReviewsCollection.find({
        title: title
    }).toArray();
    if (songReview === null) throw "No song reviews with that title";

    return songReview;
}

async function updateSongReview(id, updatedSongReview) {
    if (!id) throw "You must provide an id to search for";
    if (!updatedSongReview) throw "You must provide an updated song review";

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
        $set: updatedSongReviewData
    };
    const query = {
        _id: ObjectId(id)
    };
    await songReviewsCollection.updateOne(query, updateCommand);

    return await songs.getSongReviewById(id);
}

async function deleteSongReview(id) {
    if (!id) throw "You must provide an id to search for";

    const songReviewsCollection = await songReviews();
    const deletionInfo = await songReviewsCollection.removeOne({
        _id: ObjectId(id)
    });
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete song review with id of ${id}`;
    }
}

async function getSongReviewBySongId(songId) {
    if (!songId) throw "You must provide a song id to search for";

    const songReviewsCollection = await songReviews();
    const songReview = await songReviewsCollection.find({
        songID: ObjectId(songId)
    }).toArray();
    if (songReview === null) throw "Song has no song reviews";

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
    getSongReviewBySongId
};
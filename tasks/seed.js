const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const songs = data.songs;
const albums = data.albums;
const reviews = data.songReviews;

const {
    ObjectId
} = require('mongodb');

async function main() {
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();

    const dontGoNearTheWater = await songs.createSong(
        "Surf's Up",
        "Don't Go Near The Water",
        "The Beach Boys",
        "2:37",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const longPromisedRoad = await songs.createSong(
        "Surf's Up",
        "Long Promised Road",
        "The Beach Boys",
        "3:28",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const takeALoadOffYourFeet = await songs.createSong(
        "Surf's Up",
        "Take A Load Off Your Feet",
        "The Beach Boys",
        "2:28",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const disneyGirls = await songs.createSong(
        "Surf's Up",
        "Disney Girls (1957)",
        "The Beach Boys",
        "4:07",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const studentDemonstrationTime = await songs.createSong(
        "Surf's Up",
        "Student Demonstration Time",
        "The Beach Boys",
        "3:45",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const feelFlows = await songs.createSong(
        "Surf's Up",
        "Feel Flows",
        "The Beach Boys",
        "4:44",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const lookinAtTomorrow = await songs.createSong(
        "Surf's Up",
        "Lookin' At Tomorrow (A Welfare Song)",
        "The Beach Boys",
        "1:54",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const aDayInTheLifeOfATree = await songs.createSong(
        "Surf's Up",
        "A Day In The Life Of A Tree",
        "The Beach Boys",
        "3:04",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const tilIDie = await songs.createSong(
        "Surf's Up",
        "'Til I Die",
        "The Beach Boys",
        "2:29",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const surfs_Up = await songs.createSong(
        "Surf's Up",
        "Surf's Up",
        "The Beach Boys",
        "4:11",
        1971,
        ["Psychedelic", "Pop"],
        "placeholder lyrics");

    const bookOf_Rules = await songs.createSong(
        "Book of Rules",
        "Book of Rules",
        "The Heptones",
        "3:30",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const blackOnBlack = await songs.createSong(
        "Book of Rules",
        "Black on Black",
        "The Heptones",
        "2:40",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const peaceAndHarmony = await songs.createSong(
        "Book of Rules",
        "Peace And Harmony",
        "The Heptones",
        "3:15",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const doGoodToEveryone = await songs.createSong(
        "Book of Rules",
        "Do Good To Everyone",
        "The Heptones",
        "2:50",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const world = await songs.createSong(
        "Book of Rules",
        "World",
        "The Heptones",
        "4:07",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const sufferingSo = await songs.createSong(
        "Book of Rules",
        "Suffering So",
        "The Heptones",
        "3:30",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const autalene = await songs.createSong(
        "Book of Rules",
        "Autalene",
        "The Heptones",
        "3:12",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const bagaBoo = await songs.createSong(
        "Book of Rules",
        "Baga Boo",
        "The Heptones",
        "2:40",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const wahGoHome = await songs.createSong(
        "Book of Rules",
        "Wah Go Home",
        "The Heptones",
        "4:10",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const overAndOver = await songs.createSong(
        "Book of Rules",
        "Over And Over",
        "The Heptones",
        "3:12",
        1973,
        ["Roots Reggae"],
        "placeholder lyrics");

    const computer_World = await songs.createSong(
        "Computer World",
        "Computer World",
        "Kraftwerk",
        "5:05",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const pocketCalculator = await songs.createSong(
        "Computer World",
        "Pocket Calculator",
        "Kraftwerk",
        "4:55",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const numbers = await songs.createSong(
        "Computer World",
        "Numbers",
        "Kraftwerk",
        "3:19",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const computerWorld2 = await songs.createSong(
        "Computer World",
        "Computer World 2",
        "Kraftwerk",
        "3:23",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const homeComputer = await songs.createSong(
        "Computer World",
        "Home Computer",
        "Kraftwerk",
        "6:19",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const itsMoreFunToCompute = await songs.createSong(
        "Computer World",
        "It's More Fun To Compute",
        "Kraftwerk",
        "6:19",
        1981,
        ["Electronic", "Synth-Pop"],
        "placeholder lyrics");

    const surfsUp = await albums.createAlbum(
        "Surf's Up",
        "The Beach Boys",
        "33:49",
        1971,
        "Psychedelic",
        [dontGoNearTheWater._id, longPromisedRoad._id, takeALoadOffYourFeet._id,
            disneyGirls._id, studentDemonstrationTime._id, feelFlows._id,
            lookinAtTomorrow._id, aDayInTheLifeOfATree._id, tilIDie._id, surfs_Up._id
        ]);

    const bookOfRules = await albums.createAlbum(
        "Book of Rules",
        "The Heptones",
        "32:10",
        1973,
        "Roots Reggae",
        [bookOf_Rules._id, blackOnBlack._id, peaceAndHarmony._id,
            doGoodToEveryone._id, world._id, sufferingSo._id, autalene._id,
            bagaBoo._id, wahGoHome._id, overAndOver._id
        ]);

    const computerWorld = await albums.createAlbum(
        "Computer World",
        "Kraftwerk",
        "34:25",
        1981,
        "Electronic",
        [computer_World._id, pocketCalculator._id, numbers._id,
            computerWorld2._id, homeComputer._id, itsMoreFunToCompute._id
        ]);

    const longPromisedRoadReview = await reviews.createSongReview("good song", "637c38dcae22b9ee60f111c4", longPromisedRoad._id + "", "user1", 4.0, "good song!!!");
    console.log('Done seeding database');

    await dbConnection.closeConnection();
}

main();
"its pretty good"
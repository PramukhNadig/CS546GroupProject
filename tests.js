// TODO add something here

console.log("Tested successfully")

const songs = require("./data/songs");

async function test() {
    await songs.createSong("Test Album", "Test title", "test artist", "3:00", 1909, ["Samba"], "sfjoadhfad");
}

test();
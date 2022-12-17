const dbConnection = require("../config/mongoConnection");
const data = require("../data/");
const songs = data.songs;
const albums = data.albums;
const reviews = data.songReviews;
const users = data.users;
const playlists = data.playlists;

const { ObjectId } = require("mongodb");

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
    `Don't go near the water
        Don't you think it's sad
        What's happened to the water
        Our water's going bad`
  );

  const longPromisedRoad = await songs.createSong(
    "Surf's Up",
    "Long Promised Road",
    "The Beach Boys",
    "3:28",
    1971,
    ["Psychedelic", "Pop"],
    `So hard to answer future's riddle
        When ahead is seeming so far behind
        So hard to laugh a child-like giggle
        When the tears start to torture my mind
        So hard to shed the life of before
        To let my soul automatically soar`
  );

  const takeALoadOffYourFeet = await songs.createSong(
    "Surf's Up",
    "Take A Load Off Your Feet",
    "The Beach Boys",
    "2:28",
    1971,
    ["Psychedelic", "Pop"],
    `I do them when I'm down in the tub
        With avocado cream they'll take a rub
        They wrinkle like a-raisins if I stay too long
        I wouldn't want to do it wrong`
  );

  const disneyGirls = await songs.createSong(
    "Surf's Up",
    "Disney Girls (1957)",
    "The Beach Boys",
    "4:07",
    1971,
    ["Psychedelic", "Pop"],
    `Clearing skies and drying eyes
        Now I see your smile
        Darkness goes and softness shows
        A changing style`
  );

  const studentDemonstrationTime = await songs.createSong(
    "Surf's Up",
    "Student Demonstration Time",
    "The Beach Boys",
    "3:45",
    1971,
    ["Psychedelic", "Pop"],
    `Starting out with Berkeley Free Speech
        And later on at People's Park
        The winds of change fanned into flames
        Student demonstrations spark`
  );

  const feelFlows = await songs.createSong(
    "Surf's Up",
    "Feel Flows",
    "The Beach Boys",
    "4:44",
    1971,
    ["Psychedelic", "Pop"],
    "placeholder lyrics"
  );

  const lookinAtTomorrow = await songs.createSong(
    "Surf's Up",
    "Lookin' At Tomorrow (A Welfare Song)",
    "The Beach Boys",
    "1:54",
    1971,
    ["Psychedelic", "Pop"],
    `Unfolding, enveloping missiles of soul
        Recall senses sadly
        Mirage like soft blue, like lanterns below
        To light the way gladly
        Whether whistling heaven's clouds disappear
        Whether wind withers memory
        Whether whiteness whisks soft shadows away`
  );

  const aDayInTheLifeOfATree = await songs.createSong(
    "Surf's Up",
    "A Day In The Life Of A Tree",
    "The Beach Boys",
    "3:04",
    1971,
    ["Psychedelic", "Pop"],
    "placeholder lyrics"
  );

  const tilIDie = await songs.createSong(
    "Surf's Up",
    "'Til I Die",
    "The Beach Boys",
    "2:29",
    1971,
    ["Psychedelic", "Pop"],
    `Feel the wind burn through my skin
        The pain, the air is killing me
        For years my limbs stretched to the sky
        A nest for birds to sit and sing`
  );

  const surfs_Up = await songs.createSong(
    "Surf's Up",
    "Surf's Up",
    "The Beach Boys",
    "4:11",
    1971,
    ["Psychedelic", "Pop"],
    `A diamond necklace played the pawn
        Hand in hand some drummed along, oh
        To a handsome man and baton
        A blind class aristocracy`
  );

  const bookOf_Rules = await songs.createSong(
    "Book of Rules",
    "Book of Rules",
    "The Heptones",
    "3:30",
    1973,
    ["Roots Reggae"],
    `Isn't it strange how princesses and kings
        In clown-ragged capers in sawdust rings
        While common people like you and me`
  );

  const blackOnBlack = await songs.createSong(
    "Book of Rules",
    "Black on Black",
    "The Heptones",
    "2:40",
    1973,
    ["Roots Reggae"],
    `Yes, my skin is black
        So when you see me come, you can turn your back
        You ain't gonna be
        No you'll never be a man like me`
  );

  const peaceAndHarmony = await songs.createSong(
    "Book of Rules",
    "Peace And Harmony",
    "The Heptones",
    "3:15",
    1973,
    ["Roots Reggae"],
    `Wat a liiv an bambaie
        When the two sevens clash
        Wat a liiv an bambaie
        When the two sevens clash`
  );

  const doGoodToEveryone = await songs.createSong(
    "Book of Rules",
    "Do Good To Everyone",
    "The Heptones",
    "2:50",
    1973,
    ["Roots Reggae"],
    `Look up a cotton tree out by Ferry police station
        How beautiful it used to be
        And it has been destroyed by lightning
        Earthquake and thunder, I say`
  );

  const world = await songs.createSong(
    "Book of Rules",
    "World",
    "The Heptones",
    "4:07",
    1973,
    ["Roots Reggae"],
    `Sweet freedom won't you come my way
        Come along come come along
        Sweet freedom won't you come my way
        So long I've been waiting for you my God`
  );

  const sufferingSo = await songs.createSong(
    "Book of Rules",
    "Suffering So",
    "The Heptones",
    "3:30",
    1973,
    ["Roots Reggae"],
    `I've searched every street and avenue and lane
        To find your address
        And I'll never ever give up until my sould get some rest
        Some people are too free`
  );

  const autalene = await songs.createSong(
    "Book of Rules",
    "Autalene",
    "The Heptones",
    "3:12",
    1973,
    ["Roots Reggae"],
    `We'll be builders for eternity
        Each is given a bag of tools
        A shapeless mass and the book of rules`
  );

  const bagaBoo = await songs.createSong(
    "Book of Rules",
    "Baga Boo",
    "The Heptones",
    "2:40",
    1973,
    ["Roots Reggae"],
    `Each must make his life as flowing in
        Tumbling block on a stepping stone
        While common people like you and me
        We'll be builders for eternity`
  );

  const wahGoHome = await songs.createSong(
    "Book of Rules",
    "Wah Go Home",
    "The Heptones",
    "4:10",
    1973,
    ["Roots Reggae"],
    `Look when the rain has fallen from the sky
        You know the sun will be only with us for a while
        While common people like you and me
        We'll be builders for eternity`
  );

  const overAndOver = await songs.createSong(
    "Book of Rules",
    "Over And Over",
    "The Heptones",
    "3:12",
    1973,
    ["Roots Reggae"],
    `Oh clap your hands all ye people
        Shout unto God with the voice of triumph
        For the Lord Most High is terrible
        And He's a great king over all the earth`
  );

  const computer_World = await songs.createSong(
    "Computer World",
    "Computer World",
    "Kraftwerk",
    "5:05",
    1981,
    ["Electronic", "Synth-Pop"],
    `Interpol and Deutsche Bank
        FBI and Scotland Yard
        Interpol and Deutsche Bank
        FBI and Scotland Yard`
  );

  const pocketCalculator = await songs.createSong(
    "Computer World",
    "Pocket Calculator",
    "Kraftwerk",
    "4:55",
    1981,
    ["Electronic", "Synth-Pop"],
    `I am adding
        And subtracting
        I'm controlling
        And composing`
  );

  const numbers = await songs.createSong(
    "Computer World",
    "Numbers",
    "Kraftwerk",
    "3:19",
    1981,
    ["Electronic", "Synth-Pop"],
    `Eins, zwei, drei, vier
        Fünf, sechs, sieben, acht
        Eins, zwei, drei, vier
        Fünf, sechs, sieben, acht`
  );

  const computerWorld2 = await songs.createSong(
    "Computer World",
    "Computer World 2",
    "Kraftwerk",
    "3:23",
    1981,
    ["Electronic", "Synth-Pop"],
    `Eins zwei drei vier fünf sechs sieben acht
        Eins zwei drei vier fünf sechs sieben acht
        Eins zwei drei vier fünf sechs sieben acht
        Eins zwei drei vier fünf sechs sieben acht`
  );

  const homeComputer = await songs.createSong(
    "Computer World",
    "Home Computer",
    "Kraftwerk",
    "6:19",
    1981,
    ["Electronic", "Synth-Pop"],
    `It's more fun to compute
        It's more fun to compute
        It's more fun to compute
        It's more fun to compute`
  );

  const itsMoreFunToCompute = await songs.createSong(
    "Computer World",
    "It's More Fun To Compute",
    "Kraftwerk",
    "6:19",
    1981,
    ["Electronic", "Synth-Pop"],
    `It's more fun to compute
        It's more fun to compute`
  );

  const surfsUp = await albums.createAlbum(
    "Surf's Up",
    "The Beach Boys",
    "33:49",
    1971,
    "Psychedelic",
    [
      dontGoNearTheWater._id,
      longPromisedRoad._id,
      takeALoadOffYourFeet._id,
      disneyGirls._id,
      studentDemonstrationTime._id,
      feelFlows._id,
      lookinAtTomorrow._id,
      aDayInTheLifeOfATree._id,
      tilIDie._id,
      surfs_Up._id,
    ]
  );

  const bookOfRules = await albums.createAlbum(
    "Book of Rules",
    "The Heptones",
    "32:10",
    1973,
    "Roots Reggae",
    [
      bookOf_Rules._id,
      blackOnBlack._id,
      peaceAndHarmony._id,
      doGoodToEveryone._id,
      world._id,
      sufferingSo._id,
      autalene._id,
      bagaBoo._id,
      wahGoHome._id,
      overAndOver._id,
    ]
  );

  const computerWorld = await albums.createAlbum(
    "Computer World",
    "Kraftwerk",
    "34:25",
    1981,
    "Electronic",
    [
      computer_World._id,
      pocketCalculator._id,
      numbers._id,
      computerWorld2._id,
      homeComputer._id,
      itsMoreFunToCompute._id,
    ]
  );

  const theMan = await users.createUser("theMan", "iAmTheMan123!");

  const theMansPlaylist = await playlists.createPlaylist(
    "The Man's Playlist",
    [
      computer_World._id,
      peaceAndHarmony._id,
      aDayInTheLifeOfATree._id,
      tilIDie._id,
    ],
    theMan._id
  );
  await playlists.createPlaylist("Favorites", []);

  console.log("Done seeding database");

  await dbConnection.closeConnection();
}

main();
("its pretty good");

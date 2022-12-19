# CS 546 Group Project

## Installation (dev)

1. Clone the repository
2. Install NodeJS
3. Install MongoDB
4. Install the dependencies with `npm install`
5. Seed the DB with `npm run seed`
6. Run the server with `npm start`

## Credentials

You can create a user, or use the user (after seeding): `theman` with the password `iAmTheMan123!`

The admin user can be accessed with `admin` and the password `iAmTheAdmin123!` (after seeding).


## Environment variables

Environment variables used for web server, with their defaults:

```
PORT=3000
AUTH_SECRET=SomeSecret
MONGO_SERVER_URL="mongodb://localhost:27017/"
MONGO_SERVER_DB="musicify"
```

## MongoDB Important Note

The latest version of MongoDB for macOS and Linux may not bind properly to localhost. 
If you are running into this issue, try using `127.0.0.1` instead of localhost. 

Something like this:
```
MONGO_SERVER_URL="mongodb://127.0.0.1:27017/" npm run seed
```
and
```
MONGO_SERVER_URL="mongodb://127.0.0.1:27017/" npm run start
```
const express = require("express");

const port = process.env.PORT || 3000;

const app = express();

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

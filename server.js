"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var dns = require("dns");
var nanoid = require("nanoid").customAlphabet("1234567890abcdef", 8);
var dotenv = require("dotenv");
var cors = require("cors");

dotenv.config();
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

var shortenedUrlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});
var ShortenedUrl = mongoose.model("ShortenedUrls", shortenedUrlSchema);

app.post("/api/shorturl/new", function(req, res) {
  let url = new URL(req.body.url);
  console.log(url);
  dns.lookup(url.host, function(err, address) {
    if (!err && address) {
      console.log("valid url");
      let hash = nanoid();
      var shortenedUrl = new ShortenedUrl({
        originalUrl: url.href,
        shortUrl: hash
      });
      shortenedUrl.save(function(err, data) {
        console.log(err, data);
        if (!err) {
          res.json({
            original_url: data.originalUrl,
            short_url: data.shortUrl
          });
        }
      });
    } else {
      res.status(400);
      res.json({ error: "invalid URL" });
    }
  });
});

app.get("/api/shorturl/:shortened_url", function(req, res) {
  ShortenedUrl.findOne({ shortUrl: req.params.shortened_url }, function(
    err,
    data
  ) {
    console.log(err, data);
    if (!err && data) {
      res.redirect(data.originalUrl);
    } else {
      res.status(500);
      res.send("SERVER_ERROR");
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});

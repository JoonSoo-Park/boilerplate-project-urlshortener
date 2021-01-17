require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const stringHash = require("string-hash");
var validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const Url = mongoose.model("Url", urlSchema);

app.get('/', function(req, res) {
  Url.find({}, function(err, data) {
    console.log(data);
  });
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function(req, res) {
  const newUrl = req.body.url;
  // https:?// ignore case
  // const REPLACE_REGEX = /^https?:\/\//i
  // const urlToCheck = newUrl.replace(REPLACE_REGEX, '');

  if (validUrl.isUri(newUrl)) {
    Url.findOne({original_url: newUrl}, function(err, data) {
      if (err) {
        res.json(err);
      } else {
        if (!data) {
          const newObject = new Url({
            original_url: newUrl,
            short_url: stringHash(newUrl)
          });
          newObject.save(function(err, data) {
            res.json({
             original_url: data["original_url"],
             short_url: data["short_url"]
            });
          }); 
        } else {
          res.json({
            original_url: data["original_url"],
            short_url: data["short_url"]
          });
        }
      }
    });
  } else {
    res.json({error: "Invalid Url"});
  }
});

app.get('/api/shorturl/:shortUrl', function(req, res) {
  const shortUrl = req.params.shortUrl;

  Url.findOne({short_url: shortUrl}, function(err, data) {
    if (err) {
      res.json({error: "No short URL found for the given input"});
    } else {
      res.redirect(data["original_url"]);
    }
  });
});










app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const express = require('express');
const mysql = require('mysql');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL setup
const mysqlConn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'testdb'
});
mysqlConn.connect();

// MongoDB setup
const mongoClient = new MongoClient('mongodb://localhost:27017');
let mongoDB;
mongoClient.connect().then(client => {
  mongoDB = client.db('testdb');
});

app.get('/sql-injection', (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  mysqlConn.query(query, (err, results) => {
    if (err) return res.send('Error');
    res.send(results);
  });
});

app.post('/nosql-injection', async (req, res) => {
  const username = req.body.username;
  const result = await mongoDB.collection('users').findOne({ username: username });
  res.send(result);
});

app.get('/command-injection', (req, res) => {
  const { exec } = require('child_process');
  const site = req.query.site;
  exec(`ping -c 1 ${site}`, (err, stdout, stderr) => {
    res.send(stdout || stderr);
  });
});

app.get('/xpath-injection', (req, res) => {
  const xpath = require('xpath');
  const dom = require('xmldom').DOMParser;
  const xml = "<users><user><name>admin</name><pass>1234</pass></user></users>";
  const doc = new dom().parseFromString(xml);
  const username = req.query.username;
  const password = req.query.password;
  const query = `//user[name/text()='${username}' and pass/text()='${password}']`;
  const nodes = xpath.select(qu

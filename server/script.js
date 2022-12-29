const express = require('express');
const app = express();
const request = require('request');
const pg = require('pg');
const { name } = require('nodeman/lib/mustache');

// Replace with your database connection string
const connectionString = 'postgresql://test:Ayush@11#22@localhost:5432/testdb';

// Connect to the database
const client = new pg.Client(connectionString);
client.connect();

app.get('/api/v2/tickers', (req, res) => {
  // Make a request to the API
  request('https://api.wazirx.com/api/v2/tickers', (error, response, body) => {
    if (error) {
      // Handle any errors that occur
      console.error(error);
      res.send(error);
    } else {
      // Parse the response body as JSON
      const data = JSON.parse(body);

      // Extract the data for the top 10 results
      const top10 = Object.values(data).slice(0, 10);
      top10.forEach((item) => {
        // Store the name, last, buy, sell, volume, and base_unit in variables
        const name = item.name;
        const last = item.last;
        const buy = item.buy;
        const sell = item.sell;
        const volume = item.volume;
        const baseUnit = item.base_unit;

        // Insert the data into the database
        client.query(
          'INSERT INTO tickers (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)',
          [name, last, buy, sell, volume, baseUnit],
          (error, result) => {
            if (error) {
              // Handle any errors that occur
              console.error(error);
            }
          }
        );
      });

      // Send a response to the client
      res.send('Data has been stored in the database');
    }
  });
});

app.get('/tickers', (req, res) => {
  // Query the database
  client.query('SELECT * FROM testdb', (error, result) => {
    if (error) {
      // Handle any errors that occur
      console.error(error);
    } else {
      // Send the data to the frontend
      res.send(result.rows);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
const express = require('express');
const scrapeProfile = require('./fetcher'); // your scraper file
const app = express();
const port = process.env.port || 3000;

app.get('/takess', async (req, res) => {
  const profileUrl = req.query.url;
  
  if (!profileUrl || !profileUrl.startsWith('http')) {
    return res.status(400).send('Invalid or missing LinkedIn URL');
  }

  try {
    const result = await scrapeProfile(profileUrl);
    res.status(200).send(`Screenshot saved: ${result}`);
  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).send('Scraping failed');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

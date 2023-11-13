const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const { faker } = require("@faker-js/faker");

const app = express();
app.use(express.json());

const PORT = 8000;

const genres = [
  "Fantasy",
  "Science",
  "Mystery",
  "Historical",
  "Romance",
  "Horror",
  "Biography",
  "Adventure",
];

const getRandomGenre = () => {
  const randomIndex = Math.floor(Math.random() * genres.length);
  return genres[randomIndex];
};

// Instantiate Elasticsearch client
const client = new Client({ node: "http://localhost:9200" });

/* เดี๋ยวเราจะเพิ่ม code ตรงนี้กัน */
app.get("/init", async (req, res) => {
  // จำนวนที่จะ gen
  for (let i = 0; i < 900000; i++) {
    let book = {
      title: faker.commerce.productName(),
      author: faker.person.fullName(),
      genre: getRandomGenre(),
    };
    console.log("position ", i, "title", book.title);
    await client.index({
      index: "old_books",
      body: book,
    });
  }
  res.send({ success: true, message: "Books indexed!" });
});

app.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).send({ error: "Query parameter q is required." });
  }

  try {
    const result = await client.search({
      index: "old_books",
      body: {
        query: {
          match: {
            title: q,
          },
        },
      },
    });

    res.send(result.body.hits.hits);
  } catch (error) {
    console.error("Elasticsearch error:", error);
    res.status(500).send({ error: "Failed to search." });
  }
});

app.listen(PORT, () => {
  console.log(`Express server started on http://localhost:${PORT}`);
});

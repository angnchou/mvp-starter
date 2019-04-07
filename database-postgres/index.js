const urlApi = require('../server/urlApi.js');
const { pg, Client } = require('pg');

//used for local dev
// const client = new Client({
//   host: process.env.DATABASE_URL || 'localhost',
//   user: 'achou',
//   database: 'stash',
// });

// const connectionString =
//   process.env.DATABASE_URL || 'postgres://localhost:5432/stash';

// const client = new pg.Client(connectionString);

//updated connectionString for Heroku
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

const selectAll = callback => {
  client.query('SELECT * FROM bookmarks', (err, results, fields) => {
    // console.log(results, 'RESULTS DB');
    if (err) {
      callback(err, null);
    } else {
      const data = results['rows'].map(bookmark => {
        bookmark.img = urlApi.getScreenshotUrl(bookmark.url);
        return bookmark;
      });
      callback(null, data);
    }
  });
};

const add = (title, tags, category, url, notes, cb) => {
  client.query(
    `INSERT INTO bookmarks (title, tags, category, url, notes) VALUES ('${title}', '${tags}', '${category}', '${url}', '${notes}')`,
    (err, result) => {
      if (err) {
        console.log(err, 'ERR');
        cb(err, null);
      } else {
        cb(null, result.insertId);
      }
    },
  );
};

const setImage = (id, img, cb) => {
  console.log('id: ' + id);
  console.log('img: ' + img.length);
  client.query('UPDATE bookmarks SET img=? WHERE id=?', [img, id], cb);
};

const update = (id, data, cb) => {
  client.query(
    `UPDATE bookmarks SET title="${data.title}", tags="${
      data.tags
    }", category="${data.category}", url="${data.url}", notes="${
      data.notes
    }" WHERE id=${id}`,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result);
      }
    },
  );
};

const deleteBookmark = (id, cb) => {
  client.query(`DELETE FROM bookmarks WHERE id=${id}`, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

module.exports = {
  selectAll,
  add,
  setImage,
  deleteBookmark,
  update,
};
const { Client } = require('pg');
const express = require('express'); // Express 추가
const app = express();
const port = process.env.PORT || 3000; // Render에서 제공하는 포트 사용

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 서버 시작 시 DB 연결 (한 번만)
client.connect()
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('DB Connection Error', err));

app.get('/', async (req, res) => {
  try {
    const dbRes = await client.query('SELECT name FROM test LIMIT 1');
    if (dbRes.rows.length > 0) {
      res.send(`HELLO ${dbRes.rows[0].name}`);
    } else {
      res.send('데이터가 없습니다.');
    }
  } catch (err) {
    res.status(500).send('에러 발생: ' + err.message);
  }
});

// 서버를 계속 띄워놓음
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

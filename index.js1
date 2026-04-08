const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// [중요!] 사용자가 보낸 JSON 데이터를 읽기 위한 설정
app.use(express.json()); 

// public 폴더 안의 HTML 파일들을 보여주기 위한 설정
app.use(express.static('public'));

// Neon DB 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. [API] 분실물 목록 가져오기 (사용자용)
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lost_items ORDER BY found_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 연결 오류');
  }
});

// 2. [API] 분실물 등록하기 (관리자용)
app.post('/api/items', async (req, res) => {
  const { name, date, f_loc, s_loc, pw } = req.body;

  // 관리자 암호 체크 (원하는 암호로 바꾸셔도 됩니다)
  if (pw !== '1234') {
    return res.status(403).send('암호가 틀렸습니다.');
  }

  try {
    await pool.query(
      'INSERT INTO lost_items (item_name, found_date, found_location, storage_location) VALUES ($1, $2, $3, $4)',
      [name, date, f_loc, s_loc]
    );
    res.status(201).send('저장 완료');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 저장 오류');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다!`);
});

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
// const cors = require("cors");
// app.use(cors({
//   origin:"http://localhost:3000"
// }))

// Конфигурация базы данных PostgreSQL
const pool = new Pool({
  user: 'postgres', // Пользователь базы данных
  host: 'localhost', // Хост базы данных (обычно localhost)
  database: 'pet', // Название базы данных, которую мы создали
  password: '123', // Пароль пользователя postgres
  schema: 'public',
  port: 5432, // Порт PostgreSQL (по умолчанию 5432)
});

// Простой запрос к базе данных для проверки
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Ошибка выполнения запроса:', err);
  } else {
    console.log('Результат запроса:', result.rows[0]);
  }
});

// Здесь должен быть остальной код вашего проекта Express
app.get('/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, login, name FROM public."Users"');
    console.log('Результат запроса:', result.rows[0]);
    res.status(200).json(result.rows);
  } finally {
    client.release(express.json);
  }
});


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
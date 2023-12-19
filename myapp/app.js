const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors(),bodyParser.json());
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
app.get('/api/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, login, name FROM public."Users"');
    console.log('Результат запроса:', result.rows[0]);
    res.status(200).json(result.rows);
  } finally {
    client.release(express.json);
  }
});

// Обработчик POST запроса по маршруту '/api/register'
app.post('/api/register', (req, res) => {
  // Извлекаем данные из тела запроса
  const { login, name, password_hash, email } = req.body;
  // Выполняем запрос к базе данных для добавления нового пользователя
  pool.query('INSERT INTO public."Users" (login, name, password_hash, email) VALUES ($1, $2, $3, $4)', [login, name, password_hash, email], (error, result) => {
    // Если произошла ошибка, отправляем статус 500 и сообщение об ошибке
    if (error) {
      res.status(500).send('Error registering user');
    } else { // В противном случае отправляем статус 200 и сообщение об успешной регистрации
      res.status(200).send('User registered successfully');
      console.log('Результат запроса:', result.rows[0]);
    }
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
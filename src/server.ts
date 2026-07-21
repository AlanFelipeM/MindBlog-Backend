import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);

const PORT = process.env.PORT || 3333;

app.get('/', (req, res) => {
  res.json({ message: 'API do MindBlog está rodando' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

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
  res.json({ message: 'MindBlog API is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

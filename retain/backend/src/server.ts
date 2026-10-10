import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });

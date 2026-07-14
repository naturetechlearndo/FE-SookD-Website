import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import productRoutes from '../backend/routes/productRoutes';
import activityRoutes from '../backend/routes/activityRoutes';
import reviewRoutes from '../backend/routes/reviewRoutes';
import orderRoutes from '../backend/routes/orderRoutes';
import promotionRoutes from '../backend/routes/promotionRoutes';
import authRoutes from '../backend/routes/authRoutes';
import lineRoutes from '../backend/routes/lineRoutes';
import { chatController, contactAdmin, getSuggestionController } from '../chatbot/controllers/chatController';
import { optionalVerifyToken } from '../backend/middlewares/authMiddleware';

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/line', lineRoutes);

app.post('/chat', optionalVerifyToken, chatController);
app.get('/chat/suggestions', getSuggestionController);
app.post('/contact-admin', optionalVerifyToken, contactAdmin);

export default app;

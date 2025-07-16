import express from 'express';
import { storyRoute } from './api/v1/routes/storyRoute.js';
export const app = express();

app.use('/', storyRoute);

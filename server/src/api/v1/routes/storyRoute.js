import express from 'express';
import { storyController } from '../controllers/storyController.js';
export const storyRoute = express.Router();

// API endpoint
storyRoute.get('/getTimeStories', storyController);

import { app } from './src/app.js';
import dotenv from 'dotenv'
dotenv.config();
const PORT = process.env.PORT || 3000;


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Time.com Story Scraper API',
        endpoints: {
            stories: '/getTimeStories',
            health: '/health'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Global API endpoint: http://localhost:${PORT}`);
    console.log(`API endpoint for Stories: http://localhost:${PORT}/getTimeStories`);
});

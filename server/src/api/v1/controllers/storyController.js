import { TimeStoryScraper } from "../services/extract.js";

export const storyController = async (req,res) => {
    try {
        const serviceObj = new TimeStoryScraper();
        const stories = await serviceObj.getLatestStories();
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(stories, null, 2)); 
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}


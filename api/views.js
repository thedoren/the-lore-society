const { Client } = require('@notionhq/client');

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

// DATABASE_ID not needed when querying by page ID directly

export default async function handler(req, res) {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, postId } = req.query;

    try {
        if (action === 'get') {
            // Get page directly by ID
            const page = await notion.pages.retrieve({ page_id: postId });
            const views = page.properties.views?.number || 0;
            
            return res.status(200).json({ views });

        } else if (action === 'increment') {
            // Get current page
            const page = await notion.pages.retrieve({ page_id: postId });
            const currentViews = page.properties.views?.number || 0;
            const newViews = currentViews + 1;

            // Update the page
            await notion.pages.update({
                page_id: postId,
                properties: {
                    views: {
                        number: newViews
                    }
                }
            });

            return res.status(200).json({ views: newViews });

        } else {
            return res.status(400).json({ error: 'Invalid action. Use "get" or "increment"' });
        }

    } catch (error) {
        console.error('Notion API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
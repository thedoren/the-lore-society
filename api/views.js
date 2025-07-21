const { Client } = require('@notionhq/client');

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action, postTitle } = req.query;

    try {
        if (action === 'get') {
            // Get current view count
            const response = await notion.databases.query({
                database_id: DATABASE_ID,
                filter: {
                    property: 'title',
                    title: {
                        equals: postTitle
                    }
                }
            });

            if (response.results.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const page = response.results[0];
            const views = page.properties.views?.number || 0;
            
            return res.status(200).json({ views });

        } else if (action === 'increment') {
            // Find the page first
            const queryResponse = await notion.databases.query({
                database_id: DATABASE_ID,
                filter: {
                    property: 'title',
                    title: {
                        equals: postTitle
                    }
                }
            });

            if (queryResponse.results.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const page = queryResponse.results[0];
            const currentViews = page.properties.views?.number || 0;
            const newViews = currentViews + 1;

            // Update the page
            await notion.pages.update({
                page_id: page.id,
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
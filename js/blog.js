const NOTION_DATABASE_ID = window.BLOG_CONFIG.NOTION_DATABASE_ID;
const NOTION_API_URL = `https://notion-api.splitbee.io/v1/table/${NOTION_DATABASE_ID}`;
const VERCEL_API_URL = window.BLOG_CONFIG.VERCEL_API_URL || 'https://your-api-project.vercel.app';

class Blog {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.globalStats = {};
        this.posts = [];
        this.init();
    }

    async init() {
        await this.loadNotionPosts();
        this.renderPosts();
    }

    async loadNotionPosts() {
        try {
            const response = await fetch(NOTION_API_URL);
            const data = await response.json();
            this.posts = data
                //.filter(post => post.Published) // Make sure your Notion database has this checkbox
                .map(post => ({
                    id: post.id,
                    title: post.title,
                    date: post.created,
                    content: post.content || "(Content not loaded)",
                    views: post.views || 0  // Get views from Notion
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Failed to load Notion posts:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderPosts() {
        if (this.posts.length === 0) {
            this.postsContainer.innerHTML = '<p class="text-gray-600">No posts available.</p>';
            return;
        }

        this.postsContainer.innerHTML = this.posts.map((post, index) => `
            <article class="mb-12 ${index > 0 ? 'border-t border-gray-200 pt-12' : ''}">
                <header class="mb-4">
                    <h2 class="text-base font-normal mb-2 cursor-pointer hover:underline" 
                        onclick="blog.togglePost('${post.id}')">
                        ${post.title}
                    </h2>
                    <div class="text-xs text-gray-600 space-x-4">
                        <span>${this.formatDate(post.date)}</span>
                        <span>${post.views} views</span>
                    </div>
                </header>
                <div class="post-content hidden" id="content-${post.id}">
                    <div class="whitespace-pre-line leading-relaxed">${post.content}</div>
                </div>
            </article>
        `).join('');
    }

    async togglePost(postId) {
        const contentDiv = document.getElementById(`content-${postId}`);
        const isHidden = contentDiv.classList.contains('hidden');

        if (isHidden) {
            contentDiv.classList.remove('hidden');

            // Update views on open
            const newViews = await this.incrementViews(postId);

            const post = this.posts.find(p => p.id === postId);
            if (post) {
                post.views = newViews;
                const viewsSpan = contentDiv.parentElement.querySelector('.text-xs span:last-child');
                if (viewsSpan) {
                    viewsSpan.textContent = `${newViews} views`;
                }
            }
        } else {
            contentDiv.classList.add('hidden');
        }
    }

    async incrementViews(postId) {
        if (window.location.protocol === 'file:') {
            this.globalStats[postId] = (this.globalStats[postId] || 0) + 1;
            return this.globalStats[postId];
        }

        try {
            const post = this.posts.find(p => p.id === postId);
            const postTitle = post ? post.title : '';

            const response = await fetch(`${VERCEL_API_URL}/api/views?action=increment&postTitle=${encodeURIComponent(postTitle)}`);
            const data = await response.json();

            if (response.ok) {
                return data.views;
            } else {
                console.error('Failed to increment views:', data.error);
                return post ? post.views : 0;
            }
        } catch (error) {
            console.error('Failed to increment view count:', error);
            const post = this.posts.find(p => p.id === postId);
            return post ? post.views : 0;
        }
    }
}

const blog = new Blog();
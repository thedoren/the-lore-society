const POSTS_DATA = [
    {
        "id": "001",
        "title": "The Origins of Lore: Where It All Began",
        "date": "2025-01-15",
        "content": `The story of Lore begins in the early days of browser-based gaming, when simplicity was king and imagination filled the gaps that graphics couldn't. 

Unlike many modern games that overwhelm players with complex mechanics and flashy visuals, Lore chose a different path. It embraced minimalism not as a limitation, but as a feature.

The original concept was born from a simple question: "What if a game's depth came from its community and stories, rather than its graphics?" This philosophy shaped every aspect of Lore's development.

Early beta versions were nothing more than text-based interfaces with basic character progression. Yet players were immediately drawn to the world-building potential and the sense of discovery that came with each new area.

The developers made a crucial decision early on: let the players shape the narrative. This decision would prove to be both Lore's greatest strength and its most challenging aspect to balance.`
    },
    {
        "id": "002",
        "title": "Hidden Easter Eggs in Early Lore Versions",
        "date": "2025-01-10",
        "content": `Veteran Lore players know that the game has always been filled with hidden secrets, but the earliest versions contained some of the most obscure easter eggs in gaming history.

The Developer's Riddle
In the original release, there was a seemingly empty room in the abandoned library. Players who typed exactly "read between the lines" would discover a hidden message from the developers about their vision for the game's future.

The Fibonacci Quest
One of the most mathematically elegant secrets involved a series of NPCs whose dialogue lengths followed the Fibonacci sequence. Players who recognized the pattern and spoke to them in the correct order unlocked a rare artifact.

Hidden Stats
Long before modern games displayed everything in detailed UI panels, Lore had a secret command "/reveal" that would show hidden character statistics. Most players never discovered this, relying instead on community experimentation to understand game mechanics.

The Time Traveler
Perhaps the most meta easter egg was an NPC who would reference events that hadn't happened yet in the game's timeline. This character's dialogue changed based on the server's actual timestamp, creating a living, breathing mystery that evolved over time.

These secrets weren't just fun diversions - they became the foundation for Lore's legendary community-driven puzzle-solving culture.`
    }
];

class Blog {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.posts = [];
        this.globalStats = {};
        this.init();
    }

    async init() {
        await this.loadGlobalStats();
        this.loadPosts();
        this.renderPosts();
    }

    async loadGlobalStats() {
        this.globalStats = {};
        // Load each post's view count from CountAPI
        for (const post of POSTS_DATA) {
            try {
                const response = await fetch(`https://api.countapi.xyz/get/lore-blog/${post.id}`);
                const data = await response.json();
                this.globalStats[post.id] = data.value || 0;
            } catch (error) {
                console.log(`Could not load stats for post ${post.id}`);
                this.globalStats[post.id] = 0;
            }
        }
    }

    loadPosts() {
        this.posts = POSTS_DATA.map(post => ({
            ...post,
            views: this.getGlobalViews(post.id)
        }));
        
        this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getGlobalViews(postId) {
        return this.globalStats[postId] || 0;
    }

    async incrementViews(postId) {
        try {
            const response = await fetch(`https://api.countapi.xyz/hit/lore-blog/${postId}`);
            const data = await response.json();
            this.globalStats[postId] = data.value;
            return data.value;
        } catch (error) {
            console.error('Failed to increment view count:', error);
            return this.getGlobalViews(postId);
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
            
            // Increment global view count
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

}

const blog = new Blog();
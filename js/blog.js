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
        try {
            const response = await fetch('stats.json');
            this.globalStats = await response.json();
        } catch (error) {
            console.log('Could not load global stats, using defaults');
            this.globalStats = {};
        }
    }

    loadPosts() {
        this.posts = POSTS_DATA.map(post => ({
            ...post,
            views: this.getTotalViews(post.id)
        }));
        
        this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getLocalViews(postId) {
        const views = localStorage.getItem(`post-views-${postId}`) || 0;
        return parseInt(views);
    }

    getGlobalViews(postId) {
        return this.globalStats[postId] || 0;
    }

    getTotalViews(postId) {
        return this.getGlobalViews(postId) + this.getLocalViews(postId);
    }

    incrementViews(postId) {
        const currentLocalViews = this.getLocalViews(postId);
        const newLocalViews = currentLocalViews + 1;
        localStorage.setItem(`post-views-${postId}`, newLocalViews);
        return this.getTotalViews(postId);
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

    togglePost(postId) {
        const contentDiv = document.getElementById(`content-${postId}`);
        const isHidden = contentDiv.classList.contains('hidden');
        
        if (isHidden) {
            contentDiv.classList.remove('hidden');
            const newViews = this.incrementViews(postId);
            
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                post.views = newViews;
                const viewsSpan = contentDiv.parentElement.querySelector('.text-xs span:last-child');
                if (viewsSpan) {
                    viewsSpan.textContent = `${newViews} views`;
                }
            }
            
            // Store for potential submission to global stats
            this.markForSubmission(postId);
        } else {
            contentDiv.classList.add('hidden');
        }
    }

    markForSubmission(postId) {
        const pendingStats = JSON.parse(localStorage.getItem('pending-stats') || '{}');
        pendingStats[postId] = this.getLocalViews(postId);
        localStorage.setItem('pending-stats', JSON.stringify(pendingStats));
    }

    // Method to get stats ready for submission via GitHub issue
    getPendingStats() {
        const pending = JSON.parse(localStorage.getItem('pending-stats') || '{}');
        const hasData = Object.keys(pending).length > 0;
        
        if (hasData) {
            const instructions = `To contribute your view data to global statistics:

1. Copy the JSON below
2. Create a new GitHub issue with title: [STATS] View Data Submission
3. Paste the JSON as the issue body
4. Submit the issue

Your data:
\`\`\`json
${JSON.stringify(pending, null, 2)}
\`\`\``;
            
            console.log(instructions);
            return { pending, instructions };
        }
        return null;
    }
}

const blog = new Blog();

// Expose method for manual stats submission
window.submitStats = () => {
    const data = blog.getPendingStats();
    if (data) {
        const blob = new Blob([data.instructions], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stats-submission-instructions.txt';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        console.log('No pending stats to submit');
    }
};
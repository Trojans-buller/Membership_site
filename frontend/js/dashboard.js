let allMembers = [];
let posts = JSON.parse(localStorage.getItem('posts') || '[]');
let currentUser = localStorage.getItem('username') || 'Member';

// Load members
async function loadMembers() {
    try {
        const res = await fetch('/api/members');
        const data = await res.json();
        if (data.users) {
            allMembers = data.users.filter(u => u.username !== currentUser);
            displayMembers(allMembers);
        }
    } catch (err) {
        document.getElementById('membersList').innerHTML = '<div>❌ Could not load members</div>';
    }
}

function displayMembers(members) {
    const container = document.getElementById('membersList');
    if (!members || members.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">No other members</div>';
        return;
    }
    container.innerHTML = members.map(m => `
        <div class="member-item">
            <div class="member-avatar">
                <span class="avatar-letter">${m.full_name.charAt(0).toUpperCase()}</span>
                <span class="status-dot ${m.is_paid ? 'online' : 'offline'}"></span>
            </div>
            <div class="member-info">
                <div class="member-name">${m.full_name}</div>
                <div class="member-username">@${m.username}</div>
            </div>
        </div>
    `).join('');
}

function searchMembers() {
    const term = document.getElementById('searchMembers').value.toLowerCase();
    displayMembers(allMembers.filter(m => 
        m.full_name.toLowerCase().includes(term) || 
        m.username.toLowerCase().includes(term)
    ));
}

// Posts
function displayPosts() {
    const container = document.getElementById('feedContainer');
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div style="padding:60px;text-align:center;color:#999;">No posts yet. Be the first!</div>';
        return;
    }
    container.innerHTML = posts.map((post, i) => `
        <div class="feed-post">
            <div class="post-header">
                <div class="post-author-info">
                    <span class="post-avatar">${post.author.charAt(0).toUpperCase()}</span>
                    <div>
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${post.timestamp}</div>
                    </div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-stats">
                <span>❤️ ${post.likes || 0}</span>
                <span>💬 ${post.comments || 0}</span>
            </div>
            <div class="post-actions">
                <button onclick="likePost(${i})" class="action-btn">❤️ Like</button>
                <button onclick="commentPost(${i})" class="action-btn">💬 Comment</button>
            </div>
        </div>
    `).join('');
}

function submitPost() {
    const content = document.getElementById('postContentInput').value.trim();
    if (!content) { alert('Please write something!'); return; }
    posts.unshift({
        author: currentUser,
        content: content,
        timestamp: new Date().toLocaleString(),
        likes: 0,
        comments: 0
    });
    localStorage.setItem('posts', JSON.stringify(posts));
    document.getElementById('postContentInput').value = '';
    displayPosts();
}

function likePost(index) {
    posts[index].likes = (posts[index].likes || 0) + 1;
    localStorage.setItem('posts', JSON.stringify(posts));
    displayPosts();
}

function commentPost(index) {
    const comment = prompt('💬 Add a comment:');
    if (comment) {
        posts[index].comments = (posts[index].comments || 0) + 1;
        localStorage.setItem('posts', JSON.stringify(posts));
        displayPosts();
    }
}

function showPostModal() {
    document.getElementById('postContentInput').focus();
}

function scrollToFeed() {
    document.querySelector('.feed-section').scrollIntoView({ behavior: 'smooth' });
}

function scrollToMembers() {
    document.querySelector('.members-section').scrollIntoView({ behavior: 'smooth' });
}

function showEarningsModal() { alert('💰 Earnings: KSH ' + (Math.random() * 10).toFixed(2)); }
function showNotifications() { alert('🔔 No new notifications'); }
function showProfileModal() { alert('👤 Profile\nUsername: ' + currentUser + '\nMember since: ' + new Date().toLocaleDateString()); }

function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadMembers();
    displayPosts();
    document.getElementById('onlineCount').textContent = '🟢 ' + (Math.floor(Math.random() * 10) + 1) + ' online';
});

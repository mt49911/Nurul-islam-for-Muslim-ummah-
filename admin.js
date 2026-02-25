// GitHub configuration – REPLACE WITH YOUR DETAILS
const repoOwner = 'YOUR_GITHUB_USERNAME';
const repoName = 'nurul-islam';
const branch = 'main';
const token = 'YOUR_PERSONAL_ACCESS_TOKEN';

// Password
const password = prompt('Enter admin password:');
if (password !== 'Mt#685522') {
    alert('Incorrect password');
    throw new Error('Authentication failed');
}

document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const type = document.getElementById('postType').value;
    const url = document.getElementById('postUrl').value;

    const newPost = {
        title,
        content,
        category,
        type,
        url,
        date: new Date().toISOString()
    };

    let sha = null;
    let currentPosts = [];

    const getUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/posts.json`;
    try {
        const response = await fetch(getUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
            const decoded = atob(data.content);
            currentPosts = JSON.parse(decoded);
        }
    } catch (err) {
        console.log('posts.json not found, will create new');
    }

    currentPosts.push(newPost);
    const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(currentPosts, null, 2))));

    const commitData = {
        message: 'Add new post via admin dashboard',
        content: updatedContent,
        branch,
        sha: sha || undefined
    };

    const commitResponse = await fetch(getUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitData)
    });

    const messageDiv = document.getElementById('message');
    if (commitResponse.ok) {
        messageDiv.style.color = '#4caf50';
        messageDiv.innerHTML = '✅ Post published successfully!';
        document.getElementById('postForm').reset();
    } else {
        const error = await commitResponse.json();
        messageDiv.style.color = '#f44336';
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
    }
});

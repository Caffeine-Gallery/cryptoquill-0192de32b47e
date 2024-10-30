import { backend } from "declarations/backend";

let quill;
const modal = document.getElementById('modal');
const postForm = document.getElementById('postForm');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');
const postsContainer = document.getElementById('posts');
const loadingElement = document.getElementById('loading');

// Initialize Quill editor
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
});

// Load posts
async function loadPosts() {
    try {
        loadingElement.style.display = 'block';
        const posts = await backend.getPosts();
        loadingElement.style.display = 'none';
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">By ${post.author}</span>
                    <span class="date">${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}</span>
                </div>
                <div class="post-content">${post.body}</div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        loadingElement.textContent = 'Error loading posts. Please try again later.';
    }
}

// Show modal
newPostBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    quill.setContents([]);
    postForm.reset();
});

// Hide modal
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Submit new post
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = postForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Publishing...';

    try {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const body = quill.root.innerHTML;

        await backend.createPost(title, body, author);
        modal.style.display = 'none';
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Publish';
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initial load
loadPosts();

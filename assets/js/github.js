async function loadGitHubRepositories() {
    const container = document.getElementById('github-profile-card');
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/ahmadfarhadcina-tech/repos?sort=updated&per_page=6`);
        if (!response.ok) throw new Error('GitHub API response failed');
        
        const repos = await response.json();
        
        if (repos.length === 0) {
            throw new Error('No public repositories found');
        }

        let html = '<div class="github-repos-grid">';
        repos.forEach(repo => {
            const updatedDate = new Date(repo.updated_at).toLocaleDateString();
            html += `
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card">
                    <div class="repo-name">${repo.name}</div>
                    <div class="repo-desc">${repo.description ? repo.description : 'Public repository by Farhad Cina.'}</div>
                    <div class="repo-meta">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                        <span>💻 ${repo.language || 'Code'}</span>
                    </div>
                </a>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) {
        // Fallback if GitHub API fails
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--text-muted); margin-bottom: 1rem;">Unable to load live GitHub repositories at the moment.</p>
                <a href="${CONFIG.GITHUB_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit GitHub Profile directly</a>
            </div>
        `;
    }
}

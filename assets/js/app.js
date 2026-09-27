let currentLang = localStorage.getItem('farhad_cina_lang') || 'en';
let currentTheme = localStorage.getItem('farhad_cina_theme') || 'system';
let reducedMotion = localStorage.getItem('farhad_cina_motion') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initNavigation();
    initProjects();
    initCV();
    initSettingsModal();
    initScrollEffects();
    loadGitHubRepositories();
    
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

/* --- Theme System --- */
function initTheme() {
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) themeSelect.value = currentTheme;
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('farhad_cina_theme', theme);
    
    let effectiveTheme = theme;
    if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = effectiveTheme === 'dark' ? '☀️' : '🌙';
    }
}

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) themeSelect.value = newTheme;
});

/* --- Language & RTL System --- */
function initLanguage() {
    const langSelect = document.getElementById('language-select');
    const settingLang = document.getElementById('setting-lang');
    
    if (langSelect) langSelect.value = currentLang;
    if (settingLang) settingLang.value = currentLang;
    
    setLanguage(currentLang);
    
    if (langSelect) {
        langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    if (settingLang) {
        settingLang.addEventListener('change', (e) => setLanguage(e.target.value));
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('farhad_cina_lang', lang);
    
    const langSelect = document.getElementById('language-select');
    const settingLang = document.getElementById('setting-lang');
    if (langSelect) langSelect.value = lang;
    if (settingLang) settingLang.value = lang;

    // Set RTL for Persian, Arabic, Pashto
    if (['fa', 'ar', 'ps'].includes(lang)) {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.setAttribute('lang', lang);

    // Translate DOM elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Re-render dynamic projects to update localized strings if needed
    renderProjects('all');
}

/* --- CV Button Automatic Hiding if Missing --- */
async function initCV() {
    const cvContainer = document.getElementById('cv-container');
    if (!cvContainer) return;

    try {
        const response = await fetch(CONFIG.CV_URL, { method: 'HEAD' });
        if (response.ok) {
            const btnText = translations[currentLang]?.btn_cv || 'Download CV';
            cvContainer.innerHTML = `
                <a href="${CONFIG.CV_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${btnText}</a>
            `;
        } else {
            cvContainer.innerHTML = '';
        }
    } catch (e) {
        cvContainer.innerHTML = '';
    }
}

/* --- Projects Rendering & Filtering --- */
function initProjects() {
    renderProjects('all');
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.getAttribute('data-filter');
            renderProjects(filter);
        });
    });
}

function renderProjects(filter) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const filtered = filter === 'all' 
        ? projectsData 
        : projectsData.filter(p => p.category === filter);

    let html = '';
    filtered.forEach(project => {
        const detailsText = translations[currentLang]?.btn_details || 'View Details';
        const demoText = translations[currentLang]?.btn_demo || 'Live Demo';
        const repoText = translations[currentLang]?.btn_repo || 'GitHub';

        html += `
            <div class="project-card">
                <div class="project-img-wrapper">
                    <img src="${project.image}" alt="${project.title}" class="project-img" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'1\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21 15 16 10 5 21\'></polyline></svg>';">
                    <span class="project-status">${project.status}</span>
                </div>
                <div class="project-info">
                    <div class="project-category">${project.category}</div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <button class="btn btn-primary" onclick="openProjectModal('${project.id}')">${detailsText}</button>
                        ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${demoText}</a>` : ''}
                        ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${repoText}</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

/* --- Project Detail Modal --- */
function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    
    const detailsText = translations[currentLang]?.btn_details || 'View Details';
    const demoText = translations[currentLang]?.btn_demo || 'Live Demo';
    const repoText = translations[currentLang]?.btn_repo || 'GitHub';

    let featuresHtml = '';
    if (project.features && project.features.length > 0) {
        featuresHtml = `<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Key Features:</h4><ul style="padding-left: 1.25rem; color: var(--text-muted); margin-bottom: 1.5rem;">`;
        project.features.forEach(f => {
            featuresHtml += `<li>${f}</li>`;
        });
        featuresHtml += `</ul>`;
    }

    let promoHtml = '';
    if (project.promo) {
        promoHtml = `<p style="color: var(--primary-color); font-weight: 700; margin-bottom: 1rem;">${project.promo}</p>`;
    }

    modalBody.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <span style="font-size: 0.85rem; color: var(--primary-color); font-weight: 600; text-transform: uppercase;">${project.category}</span>
            <h2 style="font-size: 1.75rem; margin-top: 0.25rem; margin-bottom: 0.5rem;">${project.title}</h2>
            <span style="display: inline-block; background: var(--bg-alt); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;">${project.status}</span>
        </div>
        <div style="height: 250px; background: var(--bg-alt); border-radius: 8px; overflow: hidden; margin-bottom: 1.5rem;">
            <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'1\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21 15 16 10 5 21\'></polyline></svg>';">
        </div>
        <p style="color: var(--text-muted); margin-bottom: 1rem; line-height: 1.6;">${project.description}</p>
        ${promoHtml}
        ${featuresHtml}
        <div style="margin-bottom: 1.5rem;">
            <strong>Technologies:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem;">
                ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${demoText}</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${repoText}</a>` : ''}
        </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('project-modal');
    const settingsModal = document.getElementById('settings-modal');
    if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
        settingsModal.setAttribute('aria-hidden', 'true');
    }
});

/* --- Settings Modal --- */
function initSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('settings-close-btn');
    const settingTheme = document.getElementById('setting-theme');
    const settingMotion = document.getElementById('setting-reduced-motion');
    const resetBtn = document.getElementById('reset-preferences-btn');

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        settingsModal.setAttribute('aria-hidden', 'false');
    });

    closeBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        settingsModal.setAttribute('aria-hidden', 'true');
    });

    settingTheme.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    settingMotion.checked = reducedMotion;
    settingMotion.addEventListener('change', (e) => {
        reducedMotion = e.target.checked;
        localStorage.setItem('farhad_cina_motion', reducedMotion);
        if (reducedMotion) {
            document.documentElement.style.setProperty('--transition', 'none');
        } else {
            document.documentElement.style.setProperty('--transition', 'all 0.3s ease');
        }
    });

    resetBtn.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });

    if (reducedMotion) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
}

/* --- Navigation & Scroll Effects --- */
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Highlight current section while scrolling
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        
        // Scroll progress bar
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('scroll-progress').style.width = scrolled + '%';

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (scrollPos > 500) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }

        // Active nav link
        document.querySelectorAll('section').forEach(section => {
            const top = section.offsetTop - 100;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
}

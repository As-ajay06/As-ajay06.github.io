document.addEventListener('DOMContentLoaded', () => {

  // SPA Routing Logic
  const navLinks = document.querySelectorAll('.nav-links a');
  const views = document.querySelectorAll('.view');
  const navLinksContainer = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');

  // Mobile Menu Toggle
  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', () => {
      navLinksContainer.classList.toggle('show');
    });
  }

  function navigateTo(viewId) {
    // Update active nav link
    navLinks.forEach(link => {
      if (link.getAttribute('data-link') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Show active view
    views.forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Attach click events to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-link');
      navigateTo(viewId);
      // Close mobile menu on link click
      if (navLinksContainer) {
        navLinksContainer.classList.remove('show');
      }
    });
  });


  // Render Social Links
  const socialContainers = document.querySelectorAll('.social-links-dynamic');
  if (portfolioData.profile.socialLinks) {
    const links = portfolioData.profile.socialLinks;
    const iconsMap = {
      github: 'fab fa-github',
      twitter: 'fab fa-twitter',
      linkedin: 'fab fa-linkedin-in',
      reddit: 'fab fa-reddit-alien',
      discord: 'fab fa-discord'
    };

    let socialHTML = '';
    for (const [platform, url] of Object.entries(links)) {
      if (url && url !== '#') {
        socialHTML += `<a href="${url}" target="_blank" aria-label="${platform}"><i class="${iconsMap[platform]}"></i></a>`;
      }
    }
    socialContainers.forEach(container => {
      container.innerHTML = socialHTML;
    });
  }

  // Render Skills
  const skillsContainer = document.getElementById('skills-container');
  if (skillsContainer && portfolioData.skills) {
    skillsContainer.innerHTML = portfolioData.skills.map(skill =>
      `<span class="skill-pill">${skill}</span>`
    ).join('');
  }

  // Render Web Projects
  const webProjectsGrid = document.getElementById('web-projects-grid');
  console.log("hi there")
  if (webProjectsGrid && portfolioData.fullStackProjects) {
    webProjectsGrid.innerHTML = portfolioData.fullStackProjects.map(project => `
      <div class="project-card">
        <h4>${project.title}</h4>
        <div class="project-tags">
          ${project.tags.join(', ')}
        </div>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" class="project-link">[ View Project ]</a>
      </div>
    `).join('');
  }

  const templatesProjectsGrid = document.getElementById('templates-projects-grid');
  if (templatesProjectsGrid && portfolioData.templatesYouCanUse) {
    templatesProjectsGrid.innerHTML = portfolioData.templatesYouCanUse.map(project => `
      <div class="project-card">
        <h4>${project.title}</h4>
        <div class="project-tags">
          ${project.tags.join(', ')}
        </div>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" class="project-link">[ View Project ]</a>
      </div>
    `).join('');
  }

  // Render ML Projects
  const mlProjectsGrid = document.getElementById('ml-projects-grid');
  if (mlProjectsGrid && portfolioData.mlProjectsAsContributer) {
    mlProjectsGrid.innerHTML = portfolioData.mlProjectsAsContributer.map(project => `
      <div class="project-card">
        <h4>${project.title}</h4>
        <div class="project-tags">
          ${project.tags.join(', ')}
        </div>
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank" class="project-link">[ View Project ]</a>
      </div>
    `).join('');
  }

  // Render Blog Posts
  const blogContainer = document.getElementById('blog-container');
  if (blogContainer && portfolioData.blogPosts) {
    // Sort blog posts by date descending
    const sortedBlogs = portfolioData.blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    blogContainer.innerHTML = sortedBlogs.map(post => `
      <article class="blog-post">
        <span class="blog-date">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <h3>${post.title}</h3>
        <p><a href="${post.link}" target="_blank" class="project-link">[ Read Post ]</a></p>
      </article>
    `).join('');
  }

  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Page View Counter
  const viewsElement = document.getElementById('profile-views');
  if (viewsElement) {
    // We use counterapi.dev for a free, no-login hit counter
    fetch('https://api.counterapi.dev/v1/ajaysahani/portfolio/up')
      .then(response => response.json())
      .then(data => {
        viewsElement.textContent = data.count;
      })
      .catch(error => {
        console.error('Error fetching view count:', error);
        viewsElement.textContent = 'Unavailable';
      });
  }
});

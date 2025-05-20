const projects = [
  {
    hero_img: "/assets/projects/joejonas-offline.webp",
    title: "Joe Jonas",
    summary: "A branding project for Joe Jonas' twitch live stream.",
    url: "joejonas"
  },
];

function createProjectCard(project) {
  const card = document.createElement('a');
  card.href = `/projects/${project.url}`;
  card.className = 'project-card';

  card.innerHTML = `
    <img src="${project.hero_img}" alt="${project.title}" class="project-image">
    <div class="project-content">
      <h2 class="project-title">${project.title}</h2>
      <p class="project-summary">${project.summary}</p>
    </div>
  `;

  return card;
}

function initializeProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  if (!projectsGrid) return;

  projects.forEach(project => {
    const card = createProjectCard(project);
    projectsGrid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', initializeProjects); 
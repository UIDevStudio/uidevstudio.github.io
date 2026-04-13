const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('is-open');
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navMenu.classList.remove('is-open'));
  });
}

const terminalSteps = [
  {
    command: 'help',
    output: 'GUI TERMINAL - СПРАВКА\n📦 стандартные\n🔧 специальные\n🌐 универсальные\n📄 файловые\n📂 директории\n⚙️ системные\n🐍 python',
  },
  {
    command: 'echo %USERPROFILE%',
    output: 'C:\\Users\\aaleb',
  },
  {
    command: 'ls',
    output: '[i] Listing directory contents...\nGUI Terminal.exe\nsrc\nREADME.md\nutils',
  },
  {
    command: 'systeminfo',
    output: '[i] Информация о системе подготовлена в удобном для чтения виде.',
  },
  {
    command: 'mkdir demo_folder',
    output: '✔ Папка успешно создана: demo_folder',
  },
];

const typedCommand = document.getElementById('typedCommand');
const typedOutput = document.getElementById('typedOutput');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(node, text, speed = 44) {
  node.textContent = '';
  for (const char of text) {
    node.textContent += char;
    await sleep(speed);
  }
}

async function playTerminal() {
  if (!typedCommand || !typedOutput) return;

  let index = 0;
  while (true) {
    const step = terminalSteps[index % terminalSteps.length];
    typedOutput.textContent = '';
    await typeText(typedCommand, step.command, 42);
    await sleep(260);
    typedOutput.textContent = step.output;
    await sleep(1850);
    typedCommand.textContent = '';
    typedOutput.textContent = '';
    await sleep(260);
    index += 1;
  }
}

playTerminal();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }
  });
}, {
  threshold: 0.18,
  rootMargin: '0px 0px -6% 0px',
});

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

function releaseStatusClass(status) {
  return /последнее/i.test(status) ? 'release-badge' : 'release-badge is-legacy';
}

function buildTableRows(rows) {
  return rows.map((row) => `
    <tr>
      <td><strong>${row.version}</strong></td>
      <td><span class="${releaseStatusClass(row.status)}">${row.status}</span></td>
      <td><a class="text-link" href="${row.release_url}" target="_blank" rel="noopener">Ознакомиться</a></td>
      <td>
        <a
          class="text-link"
          href="${row.download_url}"
          target="_blank"
          rel="noopener"
          ${row.download_name ? `download="${row.download_name}"` : ''}
        >
          ${row.download_label || 'Скачать'}
        </a>
      </td>
    </tr>
  `).join('');
}

function buildCommands(categories) {
  const grid = document.getElementById('commandsGrid');
  if (!grid) return;

  grid.innerHTML = categories.map((category, index) => `
    <article class="command-category reveal ${index % 3 === 1 ? 'delay-1' : index % 3 === 2 ? 'delay-2' : ''}">
      <div class="command-category-header">
        <h3>${category.title}</h3>
        <span class="command-count">${category.commands.length} шт.</span>
      </div>
      <div class="command-list">
        ${category.commands.map((command) => `
          <div class="command-item">
            <div class="command-name">${command.name}</div>
            <div class="command-desc">${command.description}</div>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function fillRequirements(items) {
  const list = document.getElementById('requirementsList');
  if (!list) return;
  list.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

function applyLink(id, href) {
  const element = document.getElementById(id);
  if (element && href) {
    element.href = href;
    if (/^https?:/i.test(href)) {
      element.target = '_blank';
      element.rel = 'noopener';
    }
  }
}

async function hydrateSite() {
  try {
    const response = await fetch('./site-data.json');
    const data = await response.json();

    buildCommands(data.command_categories);

    const portableTableBody = document.querySelector('#portableTable tbody');
    const installerTableBody = document.querySelector('#installerTable tbody');

    if (portableTableBody) {
      portableTableBody.innerHTML = buildTableRows(data.downloads.portable_versions);
    }
    if (installerTableBody) {
      installerTableBody.innerHTML = buildTableRows(data.downloads.installer_versions);
    }

    fillRequirements(data.downloads.requirements);

    const securityNote = document.getElementById('securityNote');
    if (securityNote) securityNote.textContent = data.downloads.security_note;

    const portableNote = document.getElementById('portableNote');
    if (portableNote) portableNote.textContent = data.downloads.portable_note;

    const installerNote = document.getElementById('installerNote');
    if (installerNote) installerNote.textContent = data.downloads.installer_note;

    applyLink('navLaunchLink', data.downloads.quick_launch_url);
    // applyLink('heroDownloadLink', data.downloads.quick_launch_url);
    applyLink('quickDownloadLink', data.downloads.quick_launch_url);
    applyLink('allReleasesLink', data.releases_url);
    applyLink('portableReleasesLink', data.releases_url);
    applyLink('installerReleasesLink', data.releases_url);
    applyLink('githubRepoLink', data.github_url);
    applyLink('githubReleasesLink', data.releases_url);
    applyLink('virusTotalLink', data.downloads.virustotal_url);
  } catch (error) {
    console.error('Failed to load site info', error);
  }
}

hydrateSite();
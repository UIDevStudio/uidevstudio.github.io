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

const aboutNavItem = document.getElementById('aboutNavItem');
const aboutMegaMenu = document.getElementById('aboutMegaMenu');

if (aboutNavItem && aboutMegaMenu) {
  let megaCloseTimeout = null;

  const openMega = () => {
    clearTimeout(megaCloseTimeout);
    aboutNavItem.classList.add('is-open');
  };

  const closeMega = () => {
    clearTimeout(megaCloseTimeout);
    aboutNavItem.classList.remove('is-open');
  };

  const scheduleMegaClose = () => {
    clearTimeout(megaCloseTimeout);
    megaCloseTimeout = setTimeout(() => {
      aboutNavItem.classList.remove('is-open');
    }, 420);
  };

  aboutNavItem.addEventListener('mouseenter', openMega);
  aboutNavItem.addEventListener('mouseleave', scheduleMegaClose);
  aboutMegaMenu.addEventListener('mouseenter', openMega);
  aboutMegaMenu.addEventListener('mouseleave', scheduleMegaClose);

  const aboutMainLink = aboutNavItem.querySelector('.nav-main-link');
  aboutMainLink?.addEventListener('focus', openMega);
  aboutMegaMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('focus', openMega);
    link.addEventListener('click', () => closeMega());
  });
  document.addEventListener('click', (event) => {
    if (!aboutNavItem.contains(event.target)) closeMega();
  });
}

const terminalSteps = [
  {
    command: 'help',
    output: 'ViperTerm - СПРАВКА\n📦 стандартные\n🔧 специальные\n🌐 универсальные\n📄 файловые\n📂 директории\n⚙️ системные\n🐍 python',
  },
  {
    command: 'echo %USERPROFILE%',
    output: 'C:\\Users\\aaleb',
  },
  {
    command: 'ls',
    output: '[i] Listing directory contents...\nViperTerm.exe\nsrc\nREADME.md\nutils',
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
  return /последнее|актуальн|рекомендуется/i.test(status) ? 'release-badge' : 'release-badge is-legacy';
}

function buildTableRows(rows) {
  return rows.map((row) => {
    const downloadCell = Array.isArray(row.downloads) && row.downloads.length
      ? row.downloads.map((item) => `<a class="text-link archive-download-link" href="${item.url}" target="_blank" rel="noopener">${item.label}</a>`).join('')
      : `
        <a
          class="text-link"
          href="${row.download_url}"
          target="_blank"
          rel="noopener"
          ${row.download_name ? `download="${row.download_name}"` : ''}
        >
          ${row.download_label || 'Скачать'}
        </a>
      `;

    return `
      <tr>
        <td><strong>${row.version}</strong></td>
        <td><span class="${releaseStatusClass(row.status)}">${row.status}</span></td>
        <td><a class="text-link" href="${row.release_url}" target="_blank" rel="noopener">Ознакомиться</a></td>
        <td>${downloadCell}</td>
      </tr>
    `;
  }).join('');
}

function buildCurrentReleaseCard(release) {
  if (!release) return '';

  const options = (release.options || []).map((option, index) => `
    <a class="release-option" href="${option.download_url}" target="_blank" rel="noopener">
      <div class="release-option-top">
        <span class="release-option-index">0${index + 1}</span>
        <span class="release-option-title">${option.title}</span>
        ${option.recommended ? '<span class="mode-label">Рекомендуется</span>' : ''}
      </div>
      <p>${option.description}</p>
      <span class="release-option-link">${option.download_label || 'Скачать'}</span>
    </a>
  `).join('');

  return `
    <div class="current-release-head">
      <div>
        <div class="mini-label">${release.version}</div>
        <h4>${release.status}</h4>
      </div>
      <a class="text-link" href="${release.release_url}" target="_blank" rel="noopener">Описание релиза</a>
    </div>
    <p class="current-release-summary">${release.description}</p>
    <div class="release-options-grid">
      ${options}
    </div>
  `;
}

function buildCommands(categories) {
  const grid = document.getElementById('commandsGrid');
  if (!grid) return;

  const columns = [[], []];
  const weights = [0, 0];

  categories.forEach((category, index) => {
    const score = (category.commands?.length || 0) + 1;
    const targetIndex = weights[0] <= weights[1] ? 0 : 1;
    weights[targetIndex] += score;

    columns[targetIndex].push(`
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
    `);
  });

  grid.innerHTML = columns.map((items, columnIndex) => `
    <div class="commands-column commands-column-${columnIndex + 1}">
      ${items.join('')}
    </div>
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

    const archiveTableBody = document.querySelector('#archiveTable tbody');
    const currentReleaseCard = document.getElementById('currentReleaseCard');

    if (archiveTableBody) {
      archiveTableBody.innerHTML = buildTableRows(data.downloads.archive_versions);
    }
    if (currentReleaseCard) {
      currentReleaseCard.innerHTML = buildCurrentReleaseCard(data.downloads.current_release);
    }

    fillRequirements(data.downloads.requirements);

    const securityNote = document.getElementById('securityNote');
    if (securityNote) securityNote.textContent = data.downloads.security_note;

    const archiveNote = document.getElementById('archiveNote');
    if (archiveNote) archiveNote.textContent = data.downloads.archive_note;

    const currentReleaseNote = document.getElementById('currentReleaseNote');
    if (currentReleaseNote) currentReleaseNote.textContent = data.downloads.current_release_note;

    const currentReleaseTitle = document.getElementById('currentReleaseTitle');
    if (currentReleaseTitle && data.downloads.current_release_hero_title) {
      currentReleaseTitle.textContent = data.downloads.current_release_hero_title;
    }

    const currentReleaseDescription = document.getElementById('currentReleaseDescription');
    if (currentReleaseDescription && data.downloads.current_release_hero_description) {
      currentReleaseDescription.textContent = data.downloads.current_release_hero_description;
    }

    applyLink('navLaunchLink', data.downloads.quick_launch_url);
    applyLink('heroDownloadLink', '#downloads');
    applyLink('quickDownloadLink', data.downloads.quick_launch_url);
    applyLink('allReleasesLink', data.releases_url);
    applyLink('currentReleasesLink', data.releases_url);
    applyLink('archiveReleasesLink', data.releases_url);
    applyLink('githubRepoLink', data.github_tab_url || data.github_url);
    applyLink('githubReleasesLink', data.github_tab_releases_url || data.releases_url);
    applyLink('virusTotalLink', data.downloads.virustotal_url);
  } catch (error) {
    console.error('Failed to load site info', error);
  }
}

hydrateSite();


const interfaceStates = {
  mode: {},
  panel: {},
  windows: {},
};

const interfaceTabs = document.querySelectorAll('[data-interface-tab]');
const interfacePanels = document.querySelectorAll('[data-interface-panel]');
const interfaceShell = document.getElementById('interfaceDemoShell');
let interfaceInterval = null;
let interfaceHovered = false;
let interfaceResumeTimeout = null;

function setInterfaceState(key) {
  if (!interfaceShell || !interfaceStates[key]) return;

  interfaceShell.dataset.interfaceState = key;
  interfaceTabs.forEach((button) => button.classList.toggle('is-active', button.dataset.interfaceTab === key));
  interfacePanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.interfacePanel === key));
}

function stopInterfaceCycle() {
  clearInterval(interfaceInterval);
  clearTimeout(interfaceResumeTimeout);
  interfaceInterval = null;
}

function startInterfaceCycle() {
  const order = ['mode', 'panel', 'windows'];
  let index = order.indexOf(interfaceShell?.dataset.interfaceState || 'mode');
  if (index < 0) index = 0;
  stopInterfaceCycle();
  interfaceInterval = setInterval(() => {
    if (interfaceHovered) return;
    index = (index + 1) % order.length;
    setInterfaceState(order[index]);
  }, 2600);
}

interfaceTabs.forEach((button) => {
  const activate = () => {
    interfaceHovered = true;
    stopInterfaceCycle();
    setInterfaceState(button.dataset.interfaceTab);
  };

  button.addEventListener('mouseenter', activate);
  button.addEventListener('focus', activate);
  button.addEventListener('click', activate);
  button.addEventListener('mouseleave', () => {
    interfaceHovered = false;
    clearTimeout(interfaceResumeTimeout);
    interfaceResumeTimeout = setTimeout(() => startInterfaceCycle(), 900);
  });
  button.addEventListener('blur', () => {
    interfaceHovered = false;
    clearTimeout(interfaceResumeTimeout);
    interfaceResumeTimeout = setTimeout(() => startInterfaceCycle(), 900);
  });
});

if (interfaceShell) {
  startInterfaceCycle();
}

const modeStates = {
  separate: {},
  classic: {},
  adaptive: {},
};

const modePreviewStage = document.getElementById('modeDemoStage');
const modeSwitches = document.querySelectorAll('[data-mode-preview]');
let modeInterval = null;
let modeHovered = false;
let modeResumeTimeout = null;

function setModeState(key) {
  if (!modePreviewStage || !modeStates[key]) return;

  modePreviewStage.dataset.modeState = key;
  modeSwitches.forEach((button) => button.classList.toggle('is-active', button.dataset.modePreview === key));
}

function stopModeCycle() {
  clearInterval(modeInterval);
  clearTimeout(modeResumeTimeout);
  modeInterval = null;
}

function startModeCycle() {
  const order = ['separate', 'classic', 'adaptive'];
  let index = order.indexOf(modePreviewStage?.dataset.modeState || 'separate');
  if (index < 0) index = 0;
  stopModeCycle();
  modeInterval = setInterval(() => {
    if (modeHovered) return;
    index = (index + 1) % order.length;
    setModeState(order[index]);
  }, 2800);
}

modeSwitches.forEach((button) => {
  const activate = () => {
    modeHovered = true;
    stopModeCycle();
    setModeState(button.dataset.modePreview);
  };

  button.addEventListener('mouseenter', activate);
  button.addEventListener('focus', activate);
  button.addEventListener('click', activate);
  button.addEventListener('mouseleave', () => {
    modeHovered = false;
    clearTimeout(modeResumeTimeout);
    modeResumeTimeout = setTimeout(() => startModeCycle(), 950);
  });
  button.addEventListener('blur', () => {
    modeHovered = false;
    clearTimeout(modeResumeTimeout);
    modeResumeTimeout = setTimeout(() => startModeCycle(), 950);
  });
});

if (modePreviewStage) {
  startModeCycle();
}

const editorStates = {
  open: { duration: 5600 },
  edit: { duration: 7200 },
  actions: { duration: 5200 },
};

const editorShell = document.getElementById('editorDemoShell');
const editorTabs = document.querySelectorAll('[data-editor-tab]');
const editorPanels = document.querySelectorAll('[data-editor-panel]');
let editorInterval = null;
let editorHovered = false;
let editorResumeTimeout = null;
let editorCycleIndex = 0;
const editorOrder = ['open', 'edit', 'actions'];

function setEditorState(key) {
  if (!editorShell || !editorStates[key]) return;
  editorShell.dataset.editorState = key;
  editorTabs.forEach((button) => button.classList.toggle('is-active', button.dataset.editorTab === key));
  editorPanels.forEach((panel) => panel.classList.toggle('is-active', panel.datasetEditorPanel === key || panel.dataset.editorPanel === key));
  editorCycleIndex = Math.max(0, editorOrder.indexOf(key));
}

function stopEditorCycle() {
  clearTimeout(editorInterval);
  clearTimeout(editorResumeTimeout);
  editorInterval = null;
}

function scheduleEditorNext() {
  if (!editorShell || editorHovered) return;
  const current = editorOrder[editorCycleIndex] || 'open';
  const delay = editorStates[current]?.duration || 7000;
  clearTimeout(editorInterval);
  editorInterval = setTimeout(() => {
    if (editorHovered) return;
    editorCycleIndex = (editorCycleIndex + 1) % editorOrder.length;
    setEditorState(editorOrder[editorCycleIndex]);
    scheduleEditorNext();
  }, delay);
}

function startEditorCycle() {
  stopEditorCycle();
  const current = editorShell?.dataset.editorState || 'open';
  editorCycleIndex = Math.max(0, editorOrder.indexOf(current));
  scheduleEditorNext();
}

editorTabs.forEach((button) => {
  const activate = () => {
    editorHovered = true;
    stopEditorCycle();
    setEditorState(button.dataset.editorTab);
  };
  button.addEventListener('mouseenter', activate);
  button.addEventListener('focus', activate);
  button.addEventListener('click', activate);
  button.addEventListener('mouseleave', () => {
    editorHovered = false;
    clearTimeout(editorResumeTimeout);
    editorResumeTimeout = setTimeout(() => startEditorCycle(), 1100);
  });
  button.addEventListener('blur', () => {
    editorHovered = false;
    clearTimeout(editorResumeTimeout);
    editorResumeTimeout = setTimeout(() => startEditorCycle(), 1100);
  });
});

if (editorShell) {
  startEditorCycle();
}

// Active navigation state
(() => {
  const navMenu = document.getElementById('navMenu');
  if (!navMenu) return;

  const navLinks = Array.from(navMenu.querySelectorAll('a[href^="#"]'));
  const topLinks = {
    about: document.querySelector('#aboutNavItem > .nav-main-link'),
    commands: navMenu.querySelector(':scope > a[href="#commands"]'),
    downloads: navMenu.querySelector(':scope > a[href="#downloads"]:not(.nav-cta)'),
    github: navMenu.querySelector(':scope > a[href="#github"]'),
  };

  const groupToTop = {
    about: 'about',
    interface: 'about',
    modes: 'about',
    editor: 'about',
    audience: 'about',
    commands: 'commands',
    downloads: 'downloads',
    github: 'github',
  };

  const sectionIds = ['about', 'interface', 'modes', 'editor', 'audience', 'commands', 'downloads', 'github'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  let clickedTargetId = null;
  let clickLockTimer = null;
  let suppressTopActive = false;
  let topScrollLockTimer = null;

  const clearActive = () => {
    navLinks.forEach((link) => link.classList.remove('is-active'));
  };

  const setActive = (sectionId) => {
    clearActive();

    const topId = groupToTop[sectionId];
    if (topId && topLinks[topId]) {
      topLinks[topId].classList.add('is-active');
    }

    // Also highlight the current item inside the dropdown/floating subnav.
    const exactLink = navMenu.querySelector(`.nav-mega a[href="#${sectionId}"]`);
    exactLink?.classList.add('is-active');
  };

  const getActiveSectionByScroll = () => {
    const about = document.getElementById('about');
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;

    // Hero screen: no active pill.
    if (about && about.getBoundingClientRect().top > headerHeight + 40) {
      return null;
    }

    // GitHub is the last section and often shorter than the viewport.
    // Once its top reaches the lower half of the screen, GitHub wins.
    const github = document.getElementById('github');
    if (github) {
      const githubRect = github.getBoundingClientRect();
      if (githubRect.top <= window.innerHeight * 0.58) {
        return 'github';
      }
    }

    const markerY = headerHeight + window.innerHeight * 0.32;
    let activeId = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= markerY && rect.bottom > headerHeight + 20) {
        activeId = section.id;
      }
    });

    return activeId;
  };

  const updateFromScroll = () => {
    if (suppressTopActive) {
      clearActive();

      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      const about = document.getElementById('about');
      const isBackAtTop = window.scrollY < 24 || (about && about.getBoundingClientRect().top > headerHeight + 40);

      if (isBackAtTop) {
        suppressTopActive = false;
      }

      return;
    }

    if (clickedTargetId) {
      const target = document.getElementById(clickedTargetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const reachedTarget = Math.abs(rect.top - ((document.querySelector('.site-header')?.offsetHeight || 0))) < 80
          || (clickedTargetId === 'github' && rect.top <= window.innerHeight * 0.58);

        if (!reachedTarget) return;
      }

      clickedTargetId = null;
    }

    const activeId = getActiveSectionByScroll();

    if (!activeId) {
      clearActive();
      return;
    }

    setActive(activeId);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href || href.length < 2) return;

      clickedTargetId = href.slice(1);
      setActive(clickedTargetId);

      clearTimeout(clickLockTimer);
      clickLockTimer = window.setTimeout(() => {
        clickedTargetId = null;
        updateFromScroll();
      }, 1600);
    });
  });

  document.querySelectorAll('[data-home-top], a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetUrl = new URL(link.getAttribute('href') || '', window.location.href);
      const currentPath = window.location.pathname.replace(/\/index\.html$/i, '/');
      const targetPath = targetUrl.pathname.replace(/\/index\.html$/i, '/');

      if (targetUrl.origin === window.location.origin && targetPath === currentPath) {
        event.preventDefault();

        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', targetUrl.pathname + targetUrl.search);
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }

      suppressTopActive = true;
      clickedTargetId = null;
      clearActive();

      clearTimeout(topScrollLockTimer);
      topScrollLockTimer = window.setTimeout(() => {
        suppressTopActive = false;
        updateFromScroll();
      }, 1800);
    });
  });

  updateFromScroll();
  window.addEventListener('scroll', updateFromScroll, { passive: true });
  window.addEventListener('resize', updateFromScroll);
})();

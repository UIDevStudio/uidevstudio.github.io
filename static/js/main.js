(() => {
  const path = window.location.pathname;
  if (window.history?.replaceState && window.location.protocol !== 'file:' && /\/index\.html$/i.test(path)) {
    const cleanPath = path.replace(/index\.html$/i, '');
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }
})();

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

const MAX_COMMAND_LENGTH = 100;

const COMMAND_SYNTAX_KEYWORDS = {
  move: new Set(['to']),
  copy: new Set(['to']),
  rename: new Set(['to']),
  find: new Set(['in']),
  count: new Set(['in']),
};

const PATH_ONLY_COMMANDS = new Set([
  'info', 'open', 'read', 'clear', 'create', 'delete',
  'mkdir', 'rmdir', 'clean', 'cd', 'ls',
]);

const TO_PATH_COMMANDS = new Set(['move', 'copy', 'rename']);
const IN_PATH_COMMANDS = new Set(['find', 'count']);
const PYTHON_COMMANDS = new Set(['python']);
const PYTHON_SCRIPT_SOURCE_OPTIONS = new Set(['-c', '-m']);
const PYTHON_VALUE_OPTIONS = new Set(['-W', '-X', '--check-hash-based-pycs']);
const WRITE_COMMANDS = new Set(['write']);
const REMOVE_COMMANDS = new Set(['remove']);

const terminalSteps = [
  {
    command: 'diskspace C',
    rows: [
      { type: 'warning', text: ' [i] Showing disk space...' },
      { type: 'normal', text: '' },
      { type: 'normal', text: '    ==============================' },
      { type: 'normal', text: '          DRIVE INFORMATION       ' },
      { type: 'normal', text: '    ==============================' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '> GENERAL:' },
      { type: 'normal', text: '--------------------' },
      { type: 'normal', text: '   Volume label     - Windows' },
      { type: 'normal', text: '   File system      - NTFS' },
      { type: 'normal', text: '   Serial number    - 3A4F19C2' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '> STORAGE:' },
      { type: 'normal', text: '--------------------' },
      { type: 'normal', text: '   Total size       - 476 GB' },
      { type: 'normal', text: '   Used             - 181 GB (38.1%)' },
      { type: 'normal', text: '   Free             - 295 GB' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '> STATUS:' },
      { type: 'normal', text: '--------------------' },
      { type: 'normal', text: '   Ready            - Yes' },
      { type: 'normal', text: '   Access           - Read/Write' },
      { type: 'path_value_row', label: 'Root directory', value: 'C:\\', labelWidth: 16 },
      { type: 'normal', text: '' },
      { type: 'success', text: '   Information retrieved successfully' },
    ],
  },
  {
    command: 'tree view -d',
    rows: [
      { type: 'tree_line', text: '   [view]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    ├── [custom_frame]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    ├── [dialogs]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    ├── [editor]' },
      { type: 'tree_line', text: '    │    │' },
      { type: 'tree_line', text: '    │    └── [editor_syntax]' },
      { type: 'tree_line', text: '    │         │' },
      { type: 'tree_line', text: '    │         ├── [core]' },
      { type: 'tree_line', text: '    │         │' },
      { type: 'tree_line', text: '    │         └── [rules]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    ├── [edits]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    ├── [panels]' },
      { type: 'tree_line', text: '    │' },
      { type: 'tree_line', text: '    └── [styles]' },
      { type: 'normal', text: '' },
      { type: 'success', text: '   📊 Total: 9 directories' },
    ],
  },
  {
    command: 'info main.py',
    rows: [
      { type: 'warning', text: ' [i] Showing information...' },
      { type: 'normal', text: '' },
      { type: 'normal', text: '    ==============================' },
      { type: 'normal', text: '           FILE INFORMATION       ' },
      { type: 'normal', text: '    ==============================' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '> GENERAL:' },
      { type: 'normal', text: '--------------------' },
      { type: 'normal', text: '   Name         - main.py' },
      { type: 'normal', text: '   Type         - text file' },
      { type: 'normal', text: '   Size         - 1 KB' },
      { type: 'normal', text: '   Extension    - .py' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '> PATHS:' },
      { type: 'normal', text: '--------------------' },
      { type: 'path_value_row', label: 'Absolute', value: 'C:\\Users\\aaleb\\ViperTerm\\app\\main.py', labelWidth: 15 },
      { type: 'path_value_row', label: 'Relative', value: 'app\\main.py', labelWidth: 15 },
      { type: 'path_value_row', label: 'Root', value: 'C:\\', labelWidth: 15 },
      { type: 'normal', text: '' },
      { type: 'success', text: '   Information retrieved successfully' },
    ],
  },
  {
    command: 'find -f[terminal_view.py] -e in view',
    rows: [
      { type: 'warning', text: ' [i] Searching...' },
      { type: 'normal', text: '' },
      {
        type: 'live_progress',
        iterations: [
          { text: '   [i] Searching: C:\\Users\\aaleb\\ViperTerm\\app', hold: 980 },
          { text: '   [i] Searching: C:\\Users\\aaleb\\ViperTerm\\app\\view', hold: 980 },
          { text: '   [i] Searching: C:\\Users\\aaleb\\ViperTerm\\app\\view\\dialogs', hold: 980 },
          { text: '   [i] Searching: C:\\Users\\aaleb\\ViperTerm\\app\\view\\panels', hold: 980 },
          { text: '   [i] Searching: C:\\Users\\aaleb\\ViperTerm\\app\\view\\terminal_view.py', hold: 980 },
        ],
        finalRows: [
          { type: 'table_row', icon: '📄', left: 'view\\terminal_view.py', right: 'file' },
        ],
      },
      { type: 'normal', text: '' },
      { type: 'success', text: '   Found: 1 entries' },
    ],
  },
  {
    command: 'count -s[terminal_view.py] in view',
    rows: [
      { type: 'warning', text: ' [i] Counting...' },
      { type: 'normal', text: '' },
      {
        type: 'live_progress',
        iterations: [
          { text: '   [i] Counting: C:\\Users\\aaleb\\ViperTerm\\app', hold: 980 },
          { text: '   [i] Counting: C:\\Users\\aaleb\\ViperTerm\\app\\view', hold: 980 },
          { text: '   [i] Counting: C:\\Users\\aaleb\\ViperTerm\\app\\view\\custom_frame', hold: 980 },
          { text: '   [i] Counting: C:\\Users\\aaleb\\ViperTerm\\app\\view\\panels', hold: 980 },
          { text: '   [i] Counting: C:\\Users\\aaleb\\ViperTerm\\app\\view\\terminal_view.py', hold: 980 },
        ],
        finalRows: [
          { type: 'table_row', icon: '📄', left: 'terminal_view.py', right: '1 917 lines' },
        ],
      },
    ],
  },
  {
    command: 'ls view\\panels',
    rows: [
      { type: 'warning', text: ' [i] Listing directory contents...' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '📁 Directories:' },
      { type: 'normal', text: '  📁 __pycache__' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '📄 Files:' },
      { type: 'normal', text: '  📄 __init__.py (251 B)' },
      { type: 'normal', text: '  📄 control_panel.py (10 KB)' },
      { type: 'normal', text: '  📄 input_panel.py (4 KB)' },
      { type: 'normal', text: '  📄 status_panel.py (4 KB)' },
      { type: 'normal', text: '' },
      { type: 'warning', text: '📊 Total: 1 directories, 4 files' },
    ],
  },
];

const heroTerminalWindow = document.getElementById('heroTerminalWindow');
const terminalTranscript = document.getElementById('terminalTranscript');
const terminalPromptLine = document.getElementById('terminalPromptLine');
const typedCommand = document.getElementById('typedCommand');
const typedOutput = document.getElementById('typedOutput');
const heroInfoWindow = document.getElementById('heroInfoWindow');
const infoPreviewScroll = document.getElementById('infoPreviewScroll');
const terminalCounter = document.getElementById('terminalCounter');

const TERMINAL_TYPE_INTERVAL = 92;
const TERMINAL_BEFORE_COMMIT_DELAY = 220;
const TERMINAL_BEFORE_OUTPUT_DELAY = 150;
const TERMINAL_OUTPUT_ROW_DELAY = 58;
const TERMINAL_AFTER_OUTPUT_DELAY = 620;
const TERMINAL_STEP_PAUSE = 760;
const TERMINAL_RESET_PAUSE = 720;
const TERMINAL_RESET_RECOVER_DELAY = 420;

function sleep(ms) {
  const duration = Math.max(0, Number(ms) || 0);

  return new Promise((resolve) => {
    const start = performance.now();

    function tick(now) {
      if (now - start >= duration) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updateTerminalCounter(length = 0) {
  if (!terminalCounter) return;

  const value = Math.max(0, Math.min(length, MAX_COMMAND_LENGTH));
  terminalCounter.textContent = `${value} / ${MAX_COMMAND_LENGTH}`;
  terminalCounter.classList.remove('is-active', 'is-warning', 'is-danger', 'is-max');

  if (value >= MAX_COMMAND_LENGTH) {
    terminalCounter.classList.add('is-max');
  } else if (value >= MAX_COMMAND_LENGTH - 10) {
    terminalCounter.classList.add('is-danger');
  } else if (value >= MAX_COMMAND_LENGTH - 20) {
    terminalCounter.classList.add('is-warning');
  } else if (value > 0) {
    terminalCounter.classList.add('is-active');
  }
}

function startsWithAnyOption(value, options) {
  for (const option of options) {
    if (value.startsWith(option) && value.length > option.length) return true;
  }
  return false;
}

function isPythonScriptSourceOption(value) {
  return PYTHON_SCRIPT_SOURCE_OPTIONS.has(value) || startsWithAnyOption(value, PYTHON_SCRIPT_SOURCE_OPTIONS);
}

function isPythonValueOption(value) {
  return PYTHON_VALUE_OPTIONS.has(value)
    || value.startsWith('--check-hash-based-pycs=')
    || startsWithAnyOption(value, new Set(['-W', '-X']));
}

function nextCommandWord(command, startIndex) {
  let index = startIndex;
  const quote = command[index] === '"' || command[index] === "'" ? command[index] : null;

  if (quote) {
    index += 1;
    while (index < command.length && command[index] !== quote) index += 1;
    if (index < command.length) index += 1;
    return { start: startIndex, end: index, text: command.slice(startIndex, index), isQuoted: true };
  }

  while (
    index < command.length
    && !/\s/.test(command[index])
    && command[index] !== '"'
    && command[index] !== "'"
  ) {
    index += 1;
  }

  return { start: startIndex, end: index, text: command.slice(startIndex, index), isQuoted: false };
}

function commandSegments(command) {
  const segments = [];
  let index = 0;
  let wordIndex = 0;
  let commandName = null;
  let allowedSyntaxKeywords = new Set();
  let syntaxKeywordSeen = false;
  let writePathSeen = false;
  let removeModeSeen = false;
  let removePathSeen = false;
  let pythonValueOptionPending = false;
  let pythonScriptSourceMode = false;
  let pythonScriptPathSeen = false;
  let pythonOptionsFinished = false;

  while (index < command.length) {
    if (/\s/.test(command[index])) {
      const start = index;
      while (index < command.length && /\s/.test(command[index])) index += 1;
      segments.push({ text: command.slice(start, index), className: 'terminal-command-arg' });
      continue;
    }

    const word = nextCommandWord(command, index);
    index = word.end;

    const rawWord = word.text;
    const normalizedWord = rawWord.toLowerCase();
    const pathClass = 'terminal-command-path';
    const argumentClass = word.isQuoted ? 'terminal-command-quote' : 'terminal-command-arg';
    let className = argumentClass;

    const isSyntaxKeyword = !word.isQuoted && allowedSyntaxKeywords.has(normalizedWord);
    const isSyntaxKeywordPrefix = (
      !word.isQuoted
      && !syntaxKeywordSeen
      && wordIndex > 1
      && Boolean(normalizedWord)
      && Array.from(allowedSyntaxKeywords).some((keyword) => keyword.startsWith(normalizedWord))
    );

    if (wordIndex === 0) {
      commandName = normalizedWord;
      allowedSyntaxKeywords = COMMAND_SYNTAX_KEYWORDS[commandName] || new Set();
      className = 'terminal-command-name';
    } else if (isSyntaxKeyword) {
      className = 'terminal-command-name';
      syntaxKeywordSeen = true;
    } else if (isSyntaxKeywordPrefix) {
      className = 'terminal-command-name';
    } else if (PATH_ONLY_COMMANDS.has(commandName)) {
      className = pathClass;
    } else if (TO_PATH_COMMANDS.has(commandName)) {
      className = pathClass;
    } else if (IN_PATH_COMMANDS.has(commandName) && syntaxKeywordSeen) {
      className = pathClass;
    } else if (PYTHON_COMMANDS.has(commandName)) {
      if (pythonValueOptionPending) {
        className = argumentClass;
        pythonValueOptionPending = false;
      } else if (pythonScriptSourceMode) {
        className = argumentClass;
      } else if (!pythonOptionsFinished && normalizedWord === '--') {
        className = argumentClass;
        pythonOptionsFinished = true;
      } else if (!pythonOptionsFinished && isPythonScriptSourceOption(normalizedWord)) {
        className = argumentClass;
        pythonScriptSourceMode = true;
        pythonValueOptionPending = PYTHON_SCRIPT_SOURCE_OPTIONS.has(normalizedWord);
      } else if (!pythonOptionsFinished && isPythonValueOption(normalizedWord)) {
        className = argumentClass;
        pythonValueOptionPending = PYTHON_VALUE_OPTIONS.has(normalizedWord);
      } else if (!pythonScriptPathSeen && (pythonOptionsFinished || !normalizedWord.startsWith('-'))) {
        className = pathClass;
        pythonScriptPathSeen = true;
      } else {
        className = argumentClass;
      }
    } else if (WRITE_COMMANDS.has(commandName)) {
      if (!writePathSeen && !normalizedWord.startsWith('-') && !normalizedWord.startsWith('[')) {
        className = pathClass;
        writePathSeen = true;
      } else {
        className = argumentClass;
      }
    } else if (REMOVE_COMMANDS.has(commandName)) {
      if (!removeModeSeen) {
        className = argumentClass;
        removeModeSeen = true;
      } else if (!removePathSeen) {
        className = pathClass;
        removePathSeen = true;
      } else {
        className = argumentClass;
      }
    }

    segments.push({ text: rawWord, className });
    wordIndex += 1;
  }

  return segments;
}

function formatCommand(command) {
  return commandSegments(command)
    .map((segment) => `<span class="${segment.className}">${escapeHtml(segment.text)}</span>`)
    .join('');
}

function outputRowClass(row = {}) {
  if (row.type === 'success') return 'is-success';
  if (row.type === 'warning' || row.type === 'progress' || row.type === 'warning_table_row' || row.type === 'section_header') return 'is-warning';
  if (row.type === 'error') return 'is-error';
  if (row.type === 'path_row') return 'is-path';
  if (row.type === 'tree_line') return 'is-tree-line';
  if (row.type === 'table_row' || row.type === 'path_value_row') return 'is-responsive-row';
  return 'is-normal';
}

function getTerminalCharacterWidth() {
  if (!terminalTranscript) return 9;

  const computed = window.getComputedStyle(terminalTranscript);
  const probe = document.createElement('span');
  probe.textContent = '0000000000';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.whiteSpace = 'pre';
  probe.style.fontFamily = computed.fontFamily;
  probe.style.fontSize = computed.fontSize;
  probe.style.fontWeight = computed.fontWeight;
  terminalTranscript.appendChild(probe);

  const width = probe.getBoundingClientRect().width / 10;
  probe.remove();

  return Math.max(1, width || 9);
}

function terminalVisibleColumns() {
  if (!terminalTranscript) return 72;

  const charWidth = getTerminalCharacterWidth();
  const usableWidth = Math.max(120, terminalTranscript.clientWidth - 8);
  return Math.max(20, Math.floor(usableWidth / charWidth));
}

function compactVisibleText(value = '', maxLength = 8) {
  const text = String(value);
  const length = Math.max(0, Math.floor(maxLength));

  if (length <= 0) return '';
  if (text.length <= length) return text;
  if (length <= 3) return '.'.repeat(length);

  return `...${text.slice(-(length - 3))}`;
}

function padRight(value = '', width = 0) {
  const text = String(value);
  const length = Math.max(0, Math.floor(width));
  if (text.length >= length) return text;
  return text + ' '.repeat(length - text.length);
}

function responsiveRightReservedWidth(right = '') {
  const value = String(right || '');

  if (value === 'file' || value === 'dir') return value.length;
  if (value.endsWith(' characters')) return 22;
  if (value.endsWith(' directories') || value.endsWith(' files') || value.endsWith(' lines')) return 16;

  return Math.max(12, value.length);
}

function formatResponsivePathValueRow(row = {}) {
  const label = String(row.label ?? row.row_left ?? row.left ?? '');
  const path = String(row.value ?? row.row_right ?? row.right ?? '');
  const iconPart = row.icon ? `${row.icon} ` : '';
  const prefix = `   ${iconPart}`;
  const separator = ' - ';
  const labelWidth = Math.max(Number(row.labelWidth ?? row.rightWidth ?? 0) || 0, label.length);
  const fixedWidth = prefix.length + labelWidth + separator.length + 2;
  const pathWidth = Math.max(8, terminalVisibleColumns() - fixedWidth);
  const compactPath = compactVisibleText(path, pathWidth);

  return `${prefix}${padRight(label, labelWidth)}${separator}${compactPath}`;
}

function formatResponsivePathRow(row = {}) {
  const prefix = `   ${row.icon || ''} `;
  const leftWidth = Math.max(8, terminalVisibleColumns() - prefix.length - 2);
  return `${prefix}${compactVisibleText(row.left || row.path || row.text || '', leftWidth)}`;
}

function formatResponsiveTableRow(row = {}) {
  const icon = row.icon || '';
  const left = String(row.left ?? row.row_left ?? '');
  const right = String(row.right ?? row.row_right ?? '');
  const prefix = `   ${icon} `;
  const separator = ' │ ';
  const explicitRightWidth = Number(row.rightWidth ?? row.row_right_width);
  const rightWidth = Math.max(Number.isFinite(explicitRightWidth) ? explicitRightWidth : right.length, right.length);
  const fixedWidth = prefix.length + separator.length + rightWidth + 2;
  const leftWidth = Math.max(8, terminalVisibleColumns() - fixedWidth);
  const compactLeft = compactVisibleText(left, leftWidth);

  return `${prefix}${padRight(compactLeft, leftWidth)}${separator}${right}`;
}

function formatProgressOutputText(text = '') {
  const value = String(text);
  const columns = terminalVisibleColumns();
  const maxWidth = Math.max(8, columns - 1);

  for (const prefix of ['   [i] Searching: ', '   [i] Counting: ']) {
    if (value.startsWith(prefix)) {
      const pathWidth = Math.max(8, maxWidth - prefix.length);
      return `${prefix}${compactVisibleText(value.slice(prefix.length), pathWidth)}`;
    }
  }

  if (value.length <= maxWidth) return value;

  return compactVisibleText(value, maxWidth);
}

function outputRowText(row = {}) {
  if (row.type === 'path_value_row') return formatResponsivePathValueRow(row);
  if (row.type === 'path_row') return formatResponsivePathRow(row);
  if (row.type === 'table_row' || row.type === 'warning_table_row') return formatResponsiveTableRow(row);
  if (row.type === 'progress') return formatProgressOutputText(row.text || '');
  if (row.type === 'section_header') return `${row.text || ''}\n${row.underline || '--------------------'}`;
  return row.text || '';
}

function formatTreeLine(value = '') {
  const line = String(value);
  const match = line.match(/^(.*?)(\[[^\]]+\])$/);

  if (!match) return escapeHtml(line);

  return `${escapeHtml(match[1])}<span class="terminal-tree-directory">${escapeHtml(match[2])}</span>`;
}

function applyOutputRowToElement(element, row = {}) {
  if (!element) return;

  element.className = `terminal-output-row ${outputRowClass(row)}`;
  element._terminalRow = { ...row };

  if (row.type === 'tree_line') {
    element.innerHTML = formatTreeLine(row.text || '');
    return;
  }

  if (row.type === 'section_header') {
    element.innerHTML = `<span class="terminal-section-title">${escapeHtml(row.text || '')}</span>\n<span class="terminal-section-rule">${escapeHtml(row.underline || '--------------------')}</span>`;
    return;
  }

  element.textContent = outputRowText(row);
}

function createOutputRowElement(row = {}) {
  const element = document.createElement('div');
  applyOutputRowToElement(element, row);
  return element;
}

function reflowResponsiveOutputRows() {
  if (!terminalTranscript) return;

  terminalTranscript.querySelectorAll('.terminal-output-row').forEach((element) => {
    const row = element._terminalRow;
    if (!row || row.type === 'tree_line' || row.type === 'section_header') return;
    element.textContent = outputRowText(row);
  });

  keepTerminalBottom(true);
}

async function typeCommand(node, command, speed = TERMINAL_TYPE_INTERVAL) {
  if (!node) return;

  node.innerHTML = '';
  updateTerminalCounter(0);

  for (let index = 0; index < command.length; index += 1) {
    const current = command.slice(0, index + 1);
    node.innerHTML = formatCommand(current);
    updateTerminalCounter(current.length);
    keepTerminalBottom();
    await sleep(speed);
  }
}

function hideActivePrompt() {
  terminalPromptLine?.classList.add('is-waiting');
}

function showActivePrompt() {
  terminalPromptLine?.classList.remove('is-waiting');
  keepTerminalBottom();
}

let terminalScrollAnimation = null;
let terminalScrollTarget = 0;

function keepTerminalBottom(immediate = false) {
  if (!terminalTranscript) return;

  terminalScrollTarget = Math.max(0, terminalTranscript.scrollHeight - terminalTranscript.clientHeight);

  if (immediate) {
    if (terminalScrollAnimation !== null) {
      cancelAnimationFrame(terminalScrollAnimation);
      terminalScrollAnimation = null;
    }
    terminalTranscript.scrollTop = terminalScrollTarget;
    return;
  }

  if (terminalScrollAnimation !== null) return;

  const glide = () => {
    const current = terminalTranscript.scrollTop;
    const delta = terminalScrollTarget - current;

    if (Math.abs(delta) < 0.5) {
      terminalTranscript.scrollTop = terminalScrollTarget;
      terminalScrollAnimation = null;
      return;
    }

    terminalTranscript.scrollTop = current + delta * 0.24;
    terminalScrollAnimation = requestAnimationFrame(glide);
  };

  terminalScrollAnimation = requestAnimationFrame(glide);
}

function commitCommandBlock(command) {
  if (!terminalTranscript || !terminalPromptLine) return null;

  const block = document.createElement('div');
  block.className = 'terminal-block';

  const commandLine = document.createElement('div');
  commandLine.className = 'terminal-line prompt';
  commandLine.innerHTML = `<span class="terminal-prompt-mark">&gt;&gt;&gt;</span> ${formatCommand(command)}`;

  const spacer = document.createElement('div');
  spacer.className = 'terminal-output-spacer';

  const output = document.createElement('div');
  output.className = 'terminal-output-block';

  block.append(commandLine, spacer, output);
  terminalTranscript.insertBefore(block, terminalPromptLine);

  const blocks = terminalTranscript.querySelectorAll('.terminal-block');
  if (blocks.length > 3) blocks[0].remove();

  keepTerminalBottom();
  return output;
}

async function flushLiveProgressRows(container, row = {}) {
  const iterations = Array.isArray(row.iterations) ? row.iterations : [];
  const finalRows = Array.isArray(row.finalRows) ? row.finalRows : [];
  let progressElement = null;

  for (const iteration of iterations) {
    const progressRow = {
      type: 'progress',
      text: iteration.text || '',
    };

    if (!progressElement) {
      progressElement = createOutputRowElement(progressRow);
      progressElement.classList.add('is-live-progress');
      container.appendChild(progressElement);
    } else {
      applyOutputRowToElement(progressElement, progressRow);
      progressElement.classList.add('is-live-progress');
    }

    keepTerminalBottom();
    await sleep(Number(iteration.hold) || 760);

    const revealedRows = Array.isArray(iteration.rows) ? iteration.rows : [];
    for (const revealedRow of revealedRows) {
      const revealedElement = createOutputRowElement(revealedRow);

      if (progressElement) {
        progressElement.replaceWith(revealedElement);
        progressElement = null;
      } else {
        container.appendChild(revealedElement);
      }

      keepTerminalBottom();
      await sleep(TERMINAL_OUTPUT_ROW_DELAY);
    }
  }

  for (let index = 0; index < finalRows.length; index += 1) {
    const element = createOutputRowElement(finalRows[index]);

    if (index === 0 && progressElement) {
      progressElement.replaceWith(element);
      progressElement = null;
    } else {
      container.appendChild(element);
    }

    keepTerminalBottom();
    await sleep(TERMINAL_OUTPUT_ROW_DELAY);
  }

  if (progressElement) {
    progressElement.remove();
    keepTerminalBottom();
  }
}

async function flushOutputRows(container, rows = []) {
  if (!container) return;

  let transientRowElement = null;

  for (const row of rows) {
    if (row.type === 'live_progress') {
      if (transientRowElement) {
        transientRowElement.remove();
        transientRowElement = null;
      }

      await flushLiveProgressRows(container, row);
      continue;
    }

    if (row.transient) {
      const nextTransientRowElement = createOutputRowElement(row);

      if (transientRowElement) {
        transientRowElement.replaceWith(nextTransientRowElement);
      } else {
        container.appendChild(nextTransientRowElement);
      }

      transientRowElement = nextTransientRowElement;
      keepTerminalBottom();
      await sleep(Number(row.hold) || 360);
      continue;
    }

    const element = createOutputRowElement(row);

    if (transientRowElement) {
      transientRowElement.replaceWith(element);
      transientRowElement = null;
    } else {
      container.appendChild(element);
    }

    keepTerminalBottom();
    await sleep(TERMINAL_OUTPUT_ROW_DELAY);
  }
}

function resetTerminalTranscript() {
  if (!terminalTranscript || !terminalPromptLine) return;

  terminalTranscript.querySelectorAll('.terminal-block').forEach((block) => block.remove());
  if (typedOutput) typedOutput.innerHTML = '';
  if (typedCommand) typedCommand.innerHTML = '';
  terminalPromptLine.classList.remove('is-waiting');
  updateTerminalCounter(0);
  keepTerminalBottom(true);
}

async function playTerminal() {
  if (!typedCommand || !terminalTranscript || !terminalPromptLine) return;

  let index = 0;
  let cycleCount = 0;

  while (true) {
    const step = terminalSteps[index % terminalSteps.length];

    showActivePrompt();
    if (typedOutput) typedOutput.innerHTML = '';
    typedCommand.innerHTML = '';
    await typeCommand(typedCommand, step.command);
    keepTerminalBottom();
    await sleep(TERMINAL_BEFORE_COMMIT_DELAY);

    const outputContainer = commitCommandBlock(step.command);
    typedCommand.innerHTML = '';
    updateTerminalCounter(0);
    hideActivePrompt();

    await sleep(TERMINAL_BEFORE_OUTPUT_DELAY);
    await flushOutputRows(outputContainer, step.rows);
    await sleep(TERMINAL_AFTER_OUTPUT_DELAY);
    showActivePrompt();
    await sleep(TERMINAL_STEP_PAUSE);

    index += 1;
    cycleCount += 1;

    if (cycleCount >= terminalSteps.length) {
      await sleep(TERMINAL_RESET_PAUSE);
      resetTerminalTranscript();
      cycleCount = 0;
      await sleep(TERMINAL_RESET_RECOVER_DELAY);
    }
  }
}

function scheduleTerminalReflow() {
  window.setTimeout(reflowResponsiveOutputRows, 280);
}

function setupTerminalWindowControls() {
  if (!heroTerminalWindow) return;

  const maxButton = heroTerminalWindow.querySelector('[data-window-action="maximize"]');
  let closeTimeout = null;

  const syncMaxButton = () => {
    const isMaximized = heroTerminalWindow.classList.contains('is-maximized');
    maxButton?.setAttribute('aria-label', isMaximized ? 'Восстановить' : 'Развернуть');
  };

  const clearCloseTimeout = () => {
    if (closeTimeout) {
      window.clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  };

  heroTerminalWindow.querySelectorAll('[data-window-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-window-action');
      clearCloseTimeout();

      if (action === 'minimize') {
        heroTerminalWindow.classList.remove('is-closed');

        if (heroTerminalWindow.classList.contains('is-minimized')) {
          heroTerminalWindow.classList.remove('is-minimized');
        } else {
          heroTerminalWindow.classList.remove('is-maximized');
          heroTerminalWindow.classList.add('is-minimized');
        }

        syncMaxButton();
        scheduleTerminalReflow();
        return;
      }

      if (action === 'maximize') {
        heroTerminalWindow.classList.remove('is-closed');
        heroTerminalWindow.classList.remove('is-minimized');
        heroTerminalWindow.classList.toggle('is-maximized');
        syncMaxButton();
        scheduleTerminalReflow();
        return;
      }

      if (action === 'close') {
        heroTerminalWindow.classList.remove('is-minimized', 'is-maximized');
        heroTerminalWindow.classList.add('is-closed');
        syncMaxButton();

        closeTimeout = window.setTimeout(() => {
          heroTerminalWindow.classList.remove('is-closed');
          scheduleTerminalReflow();
          closeTimeout = null;
        }, 980);
      }
    });
  });

  syncMaxButton();
}

function setupInfoWindowControls() {
  if (!heroInfoWindow) return;

  const maxButton = heroInfoWindow.querySelector('[data-info-window-action="maximize"]');
  let closeTimeout = null;

  const syncMaxButton = () => {
    const isMaximized = heroInfoWindow.classList.contains('is-maximized');
    maxButton?.setAttribute('aria-label', isMaximized ? 'Восстановить' : 'Развернуть');
  };

  const clearCloseTimeout = () => {
    if (closeTimeout) {
      window.clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  };

  heroInfoWindow.querySelectorAll('[data-info-window-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-info-window-action');
      clearCloseTimeout();

      if (action === 'minimize') {
        heroInfoWindow.classList.remove('is-closed');

        if (heroInfoWindow.classList.contains('is-minimized')) {
          heroInfoWindow.classList.remove('is-minimized');
        } else {
          heroInfoWindow.classList.remove('is-maximized');
          heroInfoWindow.classList.add('is-minimized');
        }

        syncMaxButton();
        return;
      }

      if (action === 'maximize') {
        heroInfoWindow.classList.remove('is-closed');
        heroInfoWindow.classList.remove('is-minimized');
        heroInfoWindow.classList.toggle('is-maximized');
        syncMaxButton();
        return;
      }

      if (action === 'close') {
        heroInfoWindow.classList.remove('is-minimized', 'is-maximized');
        heroInfoWindow.classList.add('is-closed');
        syncMaxButton();

        closeTimeout = window.setTimeout(() => {
          heroInfoWindow.classList.remove('is-closed');
          closeTimeout = null;
        }, 980);
      }
    });
  });

  syncMaxButton();
}

function setupInfoPreviewAnimation() {
  if (!heroInfoWindow || !infoPreviewScroll) return;

  const viewport = heroInfoWindow.querySelector('.info-preview-scroll-viewport');
  const thumb = heroInfoWindow.querySelector('.info-preview-thumb');
  const cursor = heroInfoWindow.querySelector('.info-preview-cursor');
  const scrollbar = heroInfoWindow.querySelector('.info-preview-scrollbar');
  const body = heroInfoWindow.querySelector('.info-preview-body');

  if (!viewport || !thumb || !scrollbar || !body) return;

  const cycleDuration = 16000;
  let startTime = null;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const easeInOut = (t) => 0.5 - Math.cos(Math.PI * clamp(t)) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  const scrollProgressFor = (progress) => {
    if (progress < 0.16) return 0;
    if (progress < 0.70) return easeInOut((progress - 0.16) / 0.54);
    if (progress < 0.84) return 1;
    if (progress < 0.96) return lerp(1, 0, easeInOut((progress - 0.84) / 0.12));
    return 0;
  };

  const cursorOpacityFor = (progress) => {
    if (progress < 0.10) return 0;
    if (progress < 0.16) return easeInOut((progress - 0.10) / 0.06);
    if (progress < 0.72) return 1;
    if (progress < 0.80) return 1 - easeInOut((progress - 0.72) / 0.08);
    return 0;
  };

  const render = (now) => {
    if (!viewport.isConnected) return;

    if (startTime === null) startTime = now;

    const hidden = heroInfoWindow.classList.contains('is-minimized') ||
      heroInfoWindow.classList.contains('is-closed');

    const viewportHeight = viewport.clientHeight;
    const contentHeight = infoPreviewScroll.scrollHeight;
    const trackHeight = scrollbar.clientHeight;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const thumbHeight = maxScroll <= 0
      ? trackHeight
      : Math.max(24, (viewportHeight / contentHeight) * trackHeight);
    const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);

    thumb.style.height = `${thumbHeight}px`;

    if (!hidden) {
      const progress = ((now - startTime) % cycleDuration) / cycleDuration;
      const scrollProgress = scrollProgressFor(progress);
      const scrollY = maxScroll * scrollProgress;
      const thumbY = maxThumbTravel * scrollProgress;

      infoPreviewScroll.style.transform = `translate3d(0, ${-scrollY}px, 0)`;
      thumb.style.transform = `translate3d(0, ${thumbY}px, 0)`;

      if (cursor) {
        const bodyRect = body.getBoundingClientRect();
        const trackRect = scrollbar.getBoundingClientRect();
        const cursorX = trackRect.left - bodyRect.left - 5;
        const thumbCenterY = trackRect.top - bodyRect.top + thumbY + Math.min(thumbHeight * 0.5, 28);
        const approachOffset = progress < 0.16 ? lerp(-18, 0, easeInOut((progress - 0.10) / 0.06)) : 0;
        const releaseOffset = progress > 0.70 && progress < 0.80 ? lerp(0, 10, easeInOut((progress - 0.70) / 0.10)) : 0;
        const cursorY = thumbCenterY + approachOffset + releaseOffset;
        const pressedScale = progress > 0.18 && progress < 0.70 ? 0.96 : 1;

        cursor.style.opacity = `${cursorOpacityFor(progress)}`;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${pressedScale})`;
      }
    } else if (cursor) {
      cursor.style.opacity = '0';
    }

    window.requestAnimationFrame(render);
  };

  infoPreviewScroll.style.transform = 'translate3d(0, 0, 0)';
  thumb.style.transform = 'translate3d(0, 0, 0)';
  if (cursor) {
    cursor.style.opacity = '0';
    cursor.style.transform = 'translate3d(0, 0, 0) scale(1)';
  }

  window.requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  window.requestAnimationFrame(reflowResponsiveOutputRows);
});

updateTerminalCounter(0);
setupTerminalWindowControls();
setupInfoWindowControls();
setupInfoPreviewAnimation();
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
          window.history.replaceState(null, '', targetPath + targetUrl.search);
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

(() => {
  const setupCustomScrollbar = () => {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body || document.querySelector('.custom-page-scrollbar')) return;

    const bar = document.createElement('div');
    bar.className = 'custom-page-scrollbar is-hidden is-initializing';

    const thumb = document.createElement('div');
    thumb.className = 'custom-page-scrollbar__thumb';
    bar.appendChild(thumb);
    body.appendChild(bar);

    let isDragging = false;
    let dragStartY = 0;
    let scrollStartY = 0;
    let isReady = false;

    const TRACK_INSET = 12;
    const getScrollMax = () => Math.max(0, root.scrollHeight - window.innerHeight);

    const updateThumb = (allowReveal = isReady) => {
      const scrollMax = getScrollMax();
      const viewportHeight = window.innerHeight;
      const documentHeight = Math.max(viewportHeight, root.scrollHeight);

      if (scrollMax <= 1) {
        bar.classList.add('is-hidden');
        return;
      }

      const availableHeight = Math.max(1, viewportHeight - TRACK_INSET * 2);
      const thumbHeight = Math.max(48, Math.round((viewportHeight / documentHeight) * viewportHeight));
      const maxThumbTop = Math.max(0, availableHeight - thumbHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollMax));
      const thumbTop = Math.round(TRACK_INSET + progress * maxThumbTop);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;

      if (allowReveal) {
        bar.classList.remove('is-hidden');
      }
    };

    const revealWhenStable = () => {
      const finish = () => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            isReady = true;
            updateThumb(true);
            bar.classList.remove('is-initializing');
          });
        });
      };

      updateThumb(false);

      if (document.fonts?.ready) {
        document.fonts.ready.then(finish).catch(finish);
      } else {
        finish();
      }
    };

    thumb.addEventListener('pointerdown', (event) => {
      isDragging = true;
      dragStartY = event.clientY;
      scrollStartY = window.scrollY;
      body.classList.add('is-custom-scrollbar-dragging');
      thumb.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    const stopDragging = (event) => {
      if (!isDragging) return;
      isDragging = false;
      body.classList.remove('is-custom-scrollbar-dragging');
      if (event?.pointerId !== undefined) thumb.releasePointerCapture?.(event.pointerId);
    };

    thumb.addEventListener('pointermove', (event) => {
      if (!isDragging) return;

      const scrollMax = getScrollMax();
      const availableHeight = Math.max(1, window.innerHeight - TRACK_INSET * 2);
      const maxThumbTop = Math.max(1, availableHeight - thumb.offsetHeight);
      const deltaY = event.clientY - dragStartY;
      const scrollDelta = deltaY * (scrollMax / maxThumbTop);

      window.scrollTo(0, Math.max(0, Math.min(scrollMax, scrollStartY + scrollDelta)));
    });

    thumb.addEventListener('pointerup', stopDragging);
    thumb.addEventListener('pointercancel', stopDragging);
    window.addEventListener('scroll', () => updateThumb(), { passive: true });
    window.addEventListener('resize', () => updateThumb());
    window.addEventListener('load', revealWhenStable, { once: true });

    updateThumb(false);

    if (document.readyState === 'complete') {
      revealWhenStable();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCustomScrollbar, { once: true });
  } else {
    setupCustomScrollbar();
  }
})();

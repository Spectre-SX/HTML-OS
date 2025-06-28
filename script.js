const signupScreen = document.getElementById('signup-screen');
const loginScreen = document.getElementById('login-screen');
const spinnerContainer = document.getElementById('spinner-container');
const welcomeScreen = document.getElementById('welcome-screen');
const desktopScreen = document.getElementById('desktop-screen');

const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const goToLogin = document.getElementById('go-to-login');
const goToSignup = document.getElementById('go-to-signup');

const signupUsername = document.getElementById('signup-username');
const signupPassword = document.getElementById('signup-password');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

const logoutBtn = document.getElementById('logout-btn');

const fileExplorerDesktopIcon = document.getElementById('file-explorer-desktop');
const browserDesktopIcon = document.getElementById('browser-desktop');
const notepadDesktopIcon = document.getElementById('notepad-desktop');

const fileExplorerTaskbarIcon = document.getElementById('file-explorer-taskbar');
const browserTaskbarIcon = document.getElementById('browser-taskbar');
const notepadTaskbarIcon = document.getElementById('notepad-taskbar');

const apps = {
  fileExplorer: document.getElementById('file-explorer-window'),
  browser: document.getElementById('browser-window'),
  notepad: document.getElementById('notepad-window'),
};

const closeButtons = document.querySelectorAll('.close-btn');

let usersDB = {};

goToLogin.onclick = () => {
  signupScreen.classList.remove('active');
  signupScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginScreen.classList.add('active');
};

goToSignup.onclick = () => {
  loginScreen.classList.remove('active');
  loginScreen.classList.add('hidden');
  signupScreen.classList.remove('hidden');
  signupScreen.classList.add('active');
};

signupBtn.onclick = () => {
  const username = signupUsername.value.trim();
  const password = signupPassword.value.trim();
  if (!username || !password) {
    alert('Fill both username and password!');
    return;
  }
  if (usersDB[username]) {
    alert('Username already exists!');
    return;
  }
  usersDB[username] = password;
  alert('Sign up successful! You can now log in.');
  signupUsername.value = '';
  signupPassword.value = '';
  goToLogin.click();
};

loginBtn.onclick = () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password) {
    alert('Fill both username and password!');
    return;
  }
  if (!usersDB[username] || usersDB[username] !== password) {
    alert('Invalid username or password!');
    return;
  }

  loginScreen.classList.add('hidden');
  spinnerContainer.classList.remove('hidden');

  setTimeout(() => {
    spinnerContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');

    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      desktopScreen.classList.remove('hidden');
    }, 5000);
  }, 2500);
};

logoutBtn.onclick = () => {
  desktopScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  loginScreen.classList.add('active');
  loginUsername.value = '';
  loginPassword.value = '';
};

function openApp(appName) {
  apps[appName].classList.remove('hidden');
  apps[appName].parentElement.appendChild(apps[appName]);
}

fileExplorerDesktopIcon.onclick = () => openApp('fileExplorer');
browserDesktopIcon.onclick = () => openApp('browser');
notepadDesktopIcon.onclick = () => openApp('notepad');

fileExplorerTaskbarIcon.onclick = () => openApp('fileExplorer');
browserTaskbarIcon.onclick = () => openApp('browser');
notepadTaskbarIcon.onclick = () => openApp('notepad');

closeButtons.forEach(btn => {
  btn.onclick = e => {
    const appId = btn.getAttribute('data-app');
    document.getElementById(appId).classList.add('hidden');
  };
});

async function updateWidget() {
  const widget = document.querySelector('.pinned-widget');

  function pad(n) { return n < 10 ? '0'+n : n; }
  function formatTime(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
  }
  function formatDate(date) {
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    return days[date.getDay()] + ' ' + pad(date.getMonth()+1) + '-' + pad(date.getDate());
  }

  const hourEl = widget.querySelector('.hour');
  const dateEl = widget.querySelector('.date');
  const cityEl = widget.querySelector('.city');
  const tempEl = widget.querySelector('.temperature');
  const weatherEl = widget.querySelector('.weather div:nth-child(2)');
  const rangeEl = widget.querySelector('.range');

  cityEl.textContent = 'Locating...';
  weatherEl.textContent = '...';
  tempEl.textContent = '--°';
  rangeEl.textContent = '--°/--°';

  try {
    const pos = await new Promise((res, rej) => {
      if (!navigator.geolocation) rej('No geolocation');
      else navigator.geolocation.getCurrentPosition(res, rej, {timeout: 10000});
    });

    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);

    const response = await fetch(`https://wttr.in/${lat},${lon}?format=j1`);
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();

    const current = data.current_condition[0];
    const area = data.nearest_area[0];
    const weatherDesc = current.weatherDesc[0].value;
    const tempC = current.temp_C;
    const maxTemp = data.weather[0].maxtempC;
    const minTemp = data.weather[0].mintempC;

    cityEl.textContent = area.areaName[0].value;
    weatherEl.textContent = weatherDesc;
    tempEl.textContent = `${tempC}°`;
    rangeEl.textContent = `${maxTemp}°/${minTemp}°`;

  } catch (err) {
    cityEl.textContent = 'Unknown';
    weatherEl.textContent = 'Unavailable';
    tempEl.textContent = '--°';
    rangeEl.textContent = '--°/--°';
    console.error('Error updating weather:', err);
  }

  function updateTime() {
    const now = new Date();
    hourEl.textContent = formatTime(now);
    dateEl.textContent = formatDate(now);
  }
  updateTime();
  setInterval(updateTime, 60000);
}

updateWidget();

document.getElementById('skip-login-btn').addEventListener('click', () => {
  signupScreen.classList.add('hidden');
  signupScreen.classList.remove('active');
  
  loginScreen.classList.add('hidden');
  loginScreen.classList.remove('active');
  
  desktopScreen.classList.remove('hidden');
  desktopScreen.classList.add('active');
});

function makeDraggable(el, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = el.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    el.style.zIndex = ++highestZ;
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dx = e.clientX - startX;
    let dy = e.clientY - startY;
    el.style.left = Math.max(0, startLeft + dx) + 'px';
    el.style.top = Math.max(0, startTop + dy) + 'px';
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });
}

function makeResizable(el) {
  const resizer = document.createElement('div');
  resizer.style.width = '15px';
  resizer.style.height = '15px';
  resizer.style.position = 'absolute';
  resizer.style.right = '0';
  resizer.style.bottom = '0';
  resizer.style.cursor = 'se-resize';
  resizer.style.background = 'transparent';
  el.appendChild(resizer);
  el.style.position = 'absolute';

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  resizer.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = el.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;

    el.style.zIndex = ++highestZ;
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    let newWidth = startWidth + (e.clientX - startX);
    let newHeight = startHeight + (e.clientY - startY);

    newWidth = Math.max(200, newWidth);
    newHeight = Math.max(100, newHeight);

    el.style.width = newWidth + 'px';
    el.style.height = newHeight + 'px';
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = '';
    }
  });
}

let highestZ = 1;

const windows = [
  {win: document.getElementById('file-explorer-window'), header: document.querySelector('#file-explorer-window .app-header')},
  {win: document.getElementById('browser-window'), header: document.querySelector('#browser-window .app-header')},
  {win: document.getElementById('notepad-window'), header: document.querySelector('#notepad-window .app-header')}
];

windows.forEach(({win, header}) => {
  win.style.position = 'absolute';
  if (!win.style.left) win.style.left = '100px';
  if (!win.style.top) win.style.top = '100px';
  if (!win.style.width) win.style.width = '400px';
  if (!win.style.height) win.style.height = '300px';

  makeDraggable(win, header);
  makeResizable(win);

  win.addEventListener('mousedown', () => {
    win.style.zIndex = ++highestZ;
  });
});

function loadWebsite() {
  const urlInput = document.getElementById("browser-url");
  let url = urlInput.value.trim();

  // Add https:// if user forgot it
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  document.getElementById("browser-frame").src = url;
}


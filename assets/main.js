const root = document.getElementById("winkos");
let highestZ = 100;
let filesys;

async function loadfilesys() {
    const response = await fetch("Users/Gogo/filesys.json");
    filesys = await response.json();
    desktop();
}

boot();

function boot() {
    root.innerHTML = `
        <div id="bootscr">
            <h1>WinkOS</h1>
            <div id="bootlog"></div>
        </div>
    `;
    const bootLog = document.getElementById("bootlog");
    const msg = [
        "Loading Kernel...",
        "Loading Filesystem...",
        "Loading Desktop Manager...",
        "Loading Apps...",
        "Ready."
    ];
    let i = 0;
    const interval = setInterval(() => {
        bootLog.innerHTML += msg[i] + "<br>";
        i++;
        if (i >= msg.length) {
            clearInterval(interval);
            setTimeout(showlogin, 1000);
        }
    }, 500);
}

function showlogin() {
    root.innerHTML = `
        <div id=loginscr>
            <div id="logincard">
                <img src="../img/avatar.jpg">
                <h2>Ø</h2>
                <button id="loginbtn">Login</button>
            </div>
        </div>
    `;
    document.getElementById("loginbtn").onclick = loadfilesys;
}

function desktop() {
    root.innerHTML = `
        <div id="desktop">
            <div id="desktopicons"></div>
            <div id="startmenu">
                <div class="startitem">Files</div>
                <div class="startitem">Settings</div>
                <div class="startitem">Terminal</div>
            </div>
            <div id="taskbar">
                <button id="startbtn">Start</button>
                <div id="taskapps"></div>
                <div id="clock"></div>
            </div>
        </div>
    `;
    loadicons();
    startclock();
    document.getElementById("startbtn").onclick = togstartmenu;
}

function togstartmenu() {
    const menu = document.getElementById("startmenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function loadicons() {
    const container = document.getElementById("desktopicons");
    container.innerHTML = "";
    for (const name in filesys) {
        const item = filesys[name];
        const icon = document.createElement("div");
        icon.className = "desktopicon";
        if (item.type === "folder") {
            icon.innerHTML = `
                <div class="icon">/dir</div>
                <span>${name}</span>
            `;
            icon.ondblclick = () => openfolder(name, item);
        }
        if (item.type === "app") {
            icon.innerHTML = `
                <div class="icon">~$</div>
                <span>${name}</span>
            `;
            icon.ondblclick = () => openapp(name);
        }
        container.appendChild(icon);
    }
}
function createwindow(title, content) {
    const win = document.createElement("div");
    win.className = "window";
    win.style.left = "100px";
    win.style.top = "100px";
    win.style.zIndex = highestZ++;
    win.innerHTML = `
        <div class="titlebar">
            <span>${title}</span>
            <div class="titlebuttons">
                <button class="minbtn">_</button>
                <button class="maxbtn">□</button>
                <button class="closebtn">X</button>
            </div>
        </div>
        <div class="windowcontent">${content}</div>
    `;
    document.getElementById("desktop").appendChild(win);
    draggable(win);
    addtaskbarbtn(title, win);
    win.addEventListener("mousedown", () => {
        win.style.zIndex = highestZ++;
    });
    const taskbtn = win.taskbtn;
    win.querySelector(".closebtn").onclick = () => {
        taskbtn.remove();
        win.remove();
    };
    win.querySelector(".minbtn").onclick = () => {
        win.style.display = "none";
    };
    let maximized = false;
    win.querySelector(".maxbtn").onclick = () => {
        if(!maximized) {
            win.dataset.left = win.style.left;
            win.dataset.top = win.style.top;
            win.dataset.width = win.style.width;
            win.dataset.height = win.style.height;
            win.style.left = "0";
            win.style.top = "0";
            win.style.width = "100%";
            win.style.height = "calc(100% - 40px)";
            maximized = true;
        }
        else {
            win.style.left = win.dataset.left;
            win.style.top = win.dataset.top;
            win.style.width = win.dataset.width;
            win.style.height = win.dataset.height;
            maximized = false;
        }
    };
    return win;
}

function openfolder(name, folder) {
    let html = `<div class="folderview">`;
    for (const childname in folder.children) {
        const child = folder.children[childname];
        let icon = "~$";
        if(child.type === "folder"){
            icon = "/dir";
        }
        if(child.type === "app"){
            icon = "~$";
        }
        html += `
            <div
                class="foldericon"
                data-name="${childname}">
                <div class="icon">${icon}</div>
                <span>${childname}</span>
            </div>
        `;
    }
    html += `</div>`;
    const win = createwindow(name, html);
    win.querySelectorAll(".foldericon").forEach(element => {
        element.ondblclick = () => {
            const child = folder.children[element.dataset.name];
            if (child.type === "folder") {
                openfolder(element.dataset.name, child);
            }
            else if (child.type === "app") {
                openapp(element.dataset.name);
            }
            else {
                alert("Opening " + element.dataset.name);
            }
        };
    });
}
function openapp(name) {
    createwindow(name,
        `
        <h2>${name}</h2>
        <p>Coming Soon...</p>
        `
    );
}

function draggable(win) {
    const titlebar = win.querySelector(".titlebar");
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    titlebar.addEventListener("mousedown", e => {
        dragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
    });
    document.addEventListener("mousemove", e => {
        if(!dragging) return;
        win.style.left = e.clientX - offsetX + "px";
        win.style.top = e.clientY - offsetY + "px";
    });
    document.addEventListener("mouseup", () => {
        dragging = false;
    });
}

function addtaskbarbtn(title, win) {
    const btn = document.createElement("button");
    btn.className = "taskbtn";
    btn.textContent = title;
    btn.onclick = () => {
        if (win.style.display === "none") {
            win.style.display  = "block";
            win.style.zIndex = highestZ++;
        }
        else {
            win.style.display = "none";
        }
    };
    document.getElementById("taskapps").appendChild(btn);
    win.taskbtn = btn;
}
function startclock() {
    const clock = document.getElementById("clock");
    function update(){
        clock.textContent = new Date().toUTCString().split(" ")[4] + " UTC";
    }
    update();
    setInterval(update, 1000);
}
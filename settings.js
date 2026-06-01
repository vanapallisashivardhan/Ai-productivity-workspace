// Grabbing the input interactive toggle switches from the layout
const darkModeToggle = document.getElementById('darkModeToggle');
const notifyToggle = document.getElementById('notifyToggle');

/* THEME FUNCTIONS */
const darkTheme = function() {
    document.querySelector("body").style.backgroundColor = "#0f172a";
    document.querySelector("body").style.color = "#f8fafc";
    localStorage.setItem('theme', 'dark');

    // These lines ONLY run if we are currently looking at the settings page
    if (darkModeToggle) {
        document.querySelector("#themeCard").style.backgroundColor = "#1e293b";
        document.querySelector("#notifyCard").style.backgroundColor = "#1e293b";
        document.querySelector("#darkModeStatus").textContent = "Dark Mode";
    }
}

const lightTheme = function() {
    document.querySelector("body").style.backgroundColor = "#f8fafc";
    document.querySelector("body").style.color = "#0f172a";
    localStorage.setItem('theme', 'light');

    // These lines ONLY run if we are currently looking at the settings page
    if (darkModeToggle) {
        document.querySelector("#themeCard").style.backgroundColor = "white";
        document.querySelector("#notifyCard").style.backgroundColor = "white";
        document.querySelector("#darkModeStatus").textContent = "Light Mode";
    }
}

/* NOTIFICATION FUNCTIONS */
const enableNotifications = function() {
    localStorage.setItem('notifications', 'enabled');
    if (notifyToggle) {
        document.querySelector("#notifyStatus").textContent = "ON";
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }
}

const disableNotifications = function() {
    localStorage.setItem('notifications', 'disabled');
    if (notifyToggle) {
        document.querySelector("#notifyStatus").textContent = "OFF";
    }
}

/*  INITIAL LOAD SYSTEM LOGIC*/
const savedTheme = localStorage.getItem('theme');
const savedNotifications = localStorage.getItem('notifications');

if (savedTheme === 'dark') {
    if (darkModeToggle) darkModeToggle.checked = true;
    darkTheme(); 
} else {
    if (darkModeToggle) darkModeToggle.checked = false;
    lightTheme(); 
}

if (savedNotifications === 'enabled') {
    if (notifyToggle) notifyToggle.checked = true;
    enableNotifications();
} else {
    if (notifyToggle) notifyToggle.checked = false;
    disableNotifications();
}

/*  CLICK LISTENERS */
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
        if (darkModeToggle.checked === true) {
            darkTheme();
        } else {
            lightTheme();
        }
    });
}

if (notifyToggle) {
    notifyToggle.addEventListener('change', function() {
        if (notifyToggle.checked === true) {
            enableNotifications();
        } else {
            disableNotifications();
        }
    });
}
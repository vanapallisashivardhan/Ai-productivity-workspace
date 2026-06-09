<!DOCTYPE html>
<html>
<head>
    <title>Settings</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        .setting-row { display: flex; justify-content: space-between; align-items: center; }
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .3s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: #8b5cf6; }
        input:checked + .slider:before { transform: translateX(24px); }
        body, .card, .sidebar { transition: background-color 0.3s, color 0.3s; }
    </style>
</head>
<body>
<div class="container">
    <div class="sidebar">
        <h2>AI Workspace</h2>
        <a href="index.html"><i class="fa fa-home"></i> Dashboard</a>
        <a href="tasks.html"><i class="fa fa-list"></i> Tasks</a>
        <a href="meetings.html"><i class="fa fa-calendar"></i> Meetings</a>
        <a href="analytics.html"><i class="fa fa-chart-bar"></i> Analytics</a>
        <a href="settings.html"><i class="fa fa-gear"></i> Settings</a>
    </div>
    <div class="main">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h1>System Settings</h1>
            <button id="voiceBtn" style="background-color: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <i class="fa fa-microphone"></i> Start Voice Command
            </button>
        </div>

        <div class="card setting-row" id="themeCard">
            <div>
                <h3>Mode Options</h3>
                <p id="darkModeStatus">Light Mode</p>
            </div>
            <label class="switch">
                <input type="checkbox" id="darkModeToggle">
                <span class="slider"></span>
            </label>
        </div>
        <br>
        <div class="card setting-row" id="notifyCard">
            <div>
                <h3>Notifications</h3>
                <p id="notifyStatus">OFF</p>
            </div>
            <label class="switch">
                <input type="checkbox" id="notifyToggle">
                <span class="slider"></span>
            </label>
        </div>
    </div>
</div>
<script src="settings.js"></script>
<script src="voice.js"></script>
</body>
</html>
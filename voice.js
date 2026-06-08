const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;  
recognition.interimResults = false; 
recognition.lang = 'en-IN';

let isListening = false;
const voiceBtn = document.getElementById('voiceBtn');

function updateMicButtonUI(active) {
    if (!voiceBtn) return;
    if (active) {
        voiceBtn.style.backgroundColor = "red";
        voiceBtn.innerHTML = '<i class="fa fa-microphone"></i> Mic ON (Continuous)';
    } else {
        voiceBtn.style.backgroundColor = "#8b5cf6";
        voiceBtn.innerHTML = '<i class="fa fa-microphone"></i> Start Voice Command';
    }
}

if (voiceBtn) {
    voiceBtn.addEventListener('click', function() {
        if (!isListening) {
            try {
                recognition.start();
                isListening = true;
                localStorage.setItem('micActiveState', 'true');
                updateMicButtonUI(true);
            } catch(e) { console.log("Mic already active"); }
        } else {
            recognition.stop();
            isListening = false;
            localStorage.setItem('micActiveState', 'false');
            updateMicButtonUI(false);
        }
    });
}

// Helper function to sync total calculations for dashboard/analytics calculation views
function syncGlobalWorkspaceMetrics() {
    const tasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
    const meetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
    
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const incompleteMeetings = meetings.filter(m => !m.completed).length;
    
    const totalItems = tasks.length + meetings.length;
    const completedItems = tasks.filter(t => t.completed).length + meetings.filter(m => m.completed).length;
    const rate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const historyDb = JSON.parse(localStorage.getItem('analyticsHistory')) || {};
    historyDb[todayStr] = {
        incompleteTasks: incompleteTasks,
        incompleteMeetings: incompleteMeetings,
        rate: rate
    };
    localStorage.setItem('analyticsHistory', JSON.stringify(historyDb));
}

// MAIN COMMAND ROUTING AND PARSING CORE
function executeVoiceCommand(commandText) {
    const cleanCommand = commandText.trim().toLowerCase();
    console.log("AI Engine Processing Item: " + cleanCommand);

    // 1. CROSS-PAGE REDIRECT CAPTURES
    if (cleanCommand.includes("go to tasks")) {
        if (cleanCommand.includes("add task")) {
            localStorage.setItem('pendingVoiceTask', cleanCommand.split("add task")[1].trim());
        } else if (cleanCommand.includes("delete task")) {
            localStorage.setItem('pendingVoiceDeleteTask', cleanCommand.split("delete task")[1].trim());
        }
        window.location.href = "tasks.html";
        return;
    } 
    else if (cleanCommand.includes("go to meetings")) {
        if (cleanCommand.includes("add meeting")) {
            localStorage.setItem('pendingVoiceMeeting', cleanCommand.split("add meeting")[1].trim());
        } else if (cleanCommand.includes("delete meeting")) {
            localStorage.setItem('pendingVoiceDeleteMeeting', cleanCommand.split("delete meeting")[1].trim());
        }
        window.location.href = "meetings.html";
        return;
    } 
    else if (cleanCommand.includes("go to analytics")) {
        window.location.href = "analytics.html";
        return;
    } 
    else if (cleanCommand.includes("go to settings")) {
        window.location.href = "settings.html";
        return;
    } 
    else if (cleanCommand.includes("go to dashboard") || cleanCommand.includes("go home")) {
        window.location.href = "index.html";
        return;
    }

    // 2. THEME UTILITIES
    if (cleanCommand.includes("dark mode")) {
        localStorage.setItem('theme', 'dark');
        document.body.style.backgroundColor = "#0f172a";
        document.body.style.color = "#f8fafc";
        if(typeof darkTheme === "function") darkTheme();
    } 
    else if (cleanCommand.includes("light mode")) {
        localStorage.setItem('theme', 'light');
        document.body.style.backgroundColor = "#f8fafc";
        document.body.style.color = "#0f172a";
        if(typeof lightTheme === "function") lightTheme();
    }

    // 3. TASK UTILITIES
    if (cleanCommand.includes("add task")) {
        const taskBox = document.getElementById('taskinput');
        const addBtn = document.getElementById('addtaskbutton');
        let taskText = cleanCommand.split("add task")[1].trim();
        
        if (taskBox && addBtn) {
            taskBox.value = taskText;
            addBtn.click();
        } else {
            let currentTasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
            currentTasks.push({ name: taskText, completed: false });
            localStorage.setItem('globalTasks', JSON.stringify(currentTasks));
            syncGlobalWorkspaceMetrics();
        }
    }
    else if (cleanCommand.includes("delete task")) {
        const targetName = cleanCommand.split("delete task")[1].trim();
        let currentTasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
        
        const updatedTasks = currentTasks.filter(function(task) {
            return !task.name.toLowerCase().includes(targetName) && !targetName.includes(task.name.toLowerCase());
        });

        localStorage.setItem('globalTasks', JSON.stringify(updatedTasks));
        syncGlobalWorkspaceMetrics();
        if (typeof saveAndRenderTasks === 'function') {
            saveAndRenderTasks();
        }
    }
    
    // 4. MEETING UTILITIES
    else if (cleanCommand.includes("add meeting")) {
        let meetingPayload = cleanCommand.split("add meeting")[1].trim();
        let meetingName = meetingPayload;
        let meetingTime = "";

        if (meetingPayload.includes(" at ")) {
            let parts = meetingPayload.split(" at ");
            meetingName = parts[0].trim();
            meetingTime = parts[1].trim();
        }

        if (!meetingTime) {
            meetingTime = prompt("🕒 What time is the meeting '" + meetingName + "' scheduled for?");
            if (!meetingTime || meetingTime.trim() === "") {
                meetingTime = "Not Specified";
            }
        }

        const meetBox = document.getElementById('meetinginput');
        const meetTimeBox = document.getElementById('meetingtime');
        const addMeetBtn = document.getElementById('addmeetingbutton');

        if (meetBox && meetTimeBox && addMeetBtn) {
            meetBox.value = meetingName;
            meetTimeBox.value = meetingTime;
            addMeetBtn.click();
        } else {
            let currentMeetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
            currentMeetings.push({ name: meetingName, time: meetingTime, completed: false });
            localStorage.setItem('globalMeetings', JSON.stringify(currentMeetings));
            syncGlobalWorkspaceMetrics();
        }
    }
    else if (cleanCommand.includes("delete meeting")) {
        const targetMeetingName = cleanCommand.split("delete meeting")[1].trim();
        let currentMeetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];

        const updatedMeetings = currentMeetings.filter(function(meet) {
            return !meet.name.toLowerCase().includes(targetMeetingName) && !targetMeetingName.includes(meet.name.toLowerCase());
        });

        localStorage.setItem('globalMeetings', JSON.stringify(updatedMeetings));
        syncGlobalWorkspaceMetrics();
        if (typeof saveAndRenderMeetings === 'function') {
            saveAndRenderMeetings();
        }
    }
}

recognition.onresult = function(event) {
    const currentResultIndex = event.resultIndex;
    const spokenText = event.results[currentResultIndex][0].transcript.toLowerCase().trim();
    console.log("Raw Text Input Received: " + spokenText);

    // END-USER REQUIREMENTS LOOKAHEAD FIX: 
    // Splits on " and " ONLY if followed by system action keywords to keep items like "apples and milk" unified.
    const commandSplitRegex = /\s+and\s+(?=go to|add task|delete task|add meeting|delete meeting|dark mode|light mode)/gi;
    const commandsArray = spokenText.split(commandSplitRegex);
    
    commandsArray.forEach(function(cmd) {
        executeVoiceCommand(cmd);
    });
};

window.addEventListener('load', function() {
    const pendingTask = localStorage.getItem('pendingVoiceTask');
    if (pendingTask) {
        localStorage.removeItem('pendingVoiceTask');
        executeVoiceCommand("add task " + pendingTask);
    }

    const pendingMeeting = localStorage.getItem('pendingVoiceMeeting');
    if (pendingMeeting) {
        localStorage.removeItem('pendingVoiceMeeting');
        executeVoiceCommand("add meeting " + pendingMeeting);
    }

    const pendingDeleteTask = localStorage.getItem('pendingVoiceDeleteTask');
    if (pendingDeleteTask) {
        localStorage.removeItem('pendingVoiceDeleteTask');
        executeVoiceCommand("delete task " + pendingDeleteTask);
    }

    const pendingDeleteMeeting = localStorage.getItem('pendingVoiceDeleteMeeting');
    if (pendingDeleteMeeting) {
        localStorage.removeItem('pendingVoiceDeleteMeeting');
        executeVoiceCommand("delete meeting " + pendingDeleteMeeting);
    }

    const micShouldBeActive = localStorage.getItem('micActiveState');
    if (micShouldBeActive === 'true') {
        setTimeout(function() {
            try {
                recognition.start();
                isListening = true;
                updateMicButtonUI(true);
            } catch(e) {}
        }, 400);
    }
});

recognition.onend = function() {
    if (localStorage.getItem('micActiveState') !== 'true') {
        updateMicButtonUI(false);
        isListening = false;
    } else {
        try { recognition.start(); } catch(e) {}
    }
};
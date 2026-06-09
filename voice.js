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

function syncGlobalWorkspaceMetrics() {
    const tasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
    const meetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
    
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const incompleteMeetings = meetings.filter(m => !m.completed).length;
    
    const totalItems = tasks.length + meetings.length;
    const completedItems = tasks.filter(t => t.completed).length + meetings.filter(m => m.completed).length;
    const rate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const historyDb = JSON.parse(localStorage.getItem('analysisHistory')) || {};
    historyDb[todayStr] = {
        incompleteTasks: incompleteTasks,
        incompleteMeetings: incompleteMeetings,
        rate: rate
    };
    localStorage.setItem('analysisHistory', JSON.stringify(historyDb));
}

function executeVoiceCommand(commandText) {
    const cleanCommand = commandText.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    console.log("AI Engine Processing Input Token: " + cleanCommand);

    // 1. ROUTING ENGINE
    if (cleanCommand.includes("go to task") || cleanCommand.includes("go to tasks")) {
        if (cleanCommand.includes("add task")) {
            localStorage.setItem('pendingVoiceTask', cleanCommand.split("add task")[1].trim());
        } else if (cleanCommand.includes("complete task")) {
            localStorage.setItem('pendingCompleteTask', cleanCommand.split("complete task")[1].trim());
        } else if (cleanCommand.includes("tick task")) {
            localStorage.setItem('pendingCompleteTask', cleanCommand.split("tick task")[1].trim());
        } else if (cleanCommand.includes("mark task")) {
            localStorage.setItem('pendingCompleteTask', cleanCommand.split("mark task")[1].trim());
        }
        window.location.href = "tasks.html";
        return;
    } 
    else if (cleanCommand.includes("go to meetings")) {
        if (cleanCommand.includes("add meeting")) {
            localStorage.setItem('pendingVoiceMeeting', cleanCommand.split("add meeting")[1].trim());
        } else if (cleanCommand.includes("complete meeting")) {
            localStorage.setItem('pendingCompleteMeeting', cleanCommand.split("complete meeting")[1].trim());
        } else if (cleanCommand.includes("tick meeting")) {
            localStorage.setItem('pendingCompleteMeeting', cleanCommand.split("tick meeting")[1].trim());
        } else if (cleanCommand.includes("mark meeting")) {
            localStorage.setItem('pendingCompleteMeeting', cleanCommand.split("mark meeting")[1].trim());
        }
        window.location.href = "meetings.html";
        return;
    } 
    else if (cleanCommand.includes("go to analysis")) {
        window.location.href = "analysis.html";
        return;
    } 
    else if (cleanCommand.includes("go to dashboard") || cleanCommand.includes("go home")) {
        window.location.href = "index.html";
        return;
    }

    // 2. DATA MUTATION OPERATIONS
    if (cleanCommand.includes("complete task") || cleanCommand.includes("tick task") || cleanCommand.includes("mark task")) {
        let keyword = "complete task";
        if (cleanCommand.includes("tick task")) keyword = "tick task";
        if (cleanCommand.includes("mark task")) keyword = "mark task";

        const splitParts = cleanCommand.split(keyword);
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            let targetName = splitParts[1].trim();
            targetName = targetName.replace("as completed", "").replace("as complete", "").trim();

            let currentTasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
            
            currentTasks.forEach(task => {
                let normalizedTask = task.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
                if (normalizedTask.includes(targetName) || targetName.includes(normalizedTask)) {
                    task.completed = true;
                }
            });
            
            localStorage.setItem('globalTasks', JSON.stringify(currentTasks));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderTasks === 'function') saveAndRenderTasks();
            if (typeof renderLiveAnalysis === 'function') renderLiveAnalysis();
        }
    }
    else if (cleanCommand.includes("complete meeting") || cleanCommand.includes("tick meeting") || cleanCommand.includes("mark meeting")) {
        let keyword = "complete meeting";
        if (cleanCommand.includes("tick meeting")) keyword = "tick meeting";
        if (cleanCommand.includes("mark meeting")) keyword = "mark meeting";

        const splitParts = cleanCommand.split(keyword);
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            let targetMeetingName = splitParts[1].trim();
            targetMeetingName = targetMeetingName.replace("as completed", "").replace("as complete", "").trim();

            let currentMeetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
            
            currentMeetings.forEach(meet => {
                let normalizedMeeting = meet.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
                if (normalizedMeeting.includes(targetMeetingName) || targetMeetingName.includes(normalizedMeeting)) {
                    meet.completed = true;
                }
            });
            
            localStorage.setItem('globalMeetings', JSON.stringify(currentMeetings));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderMeetings === 'function') saveAndRenderMeetings();
            if (typeof renderLiveAnalysis === 'function') renderLiveAnalysis();
        }
    }
    else if (cleanCommand.includes("add task")) {
        const splitParts = cleanCommand.split("add task");
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            let taskText = splitParts[1].trim();
            let currentTasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
            currentTasks.push({ name: taskText, completed: false });
            localStorage.setItem('globalTasks', JSON.stringify(currentTasks));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderTasks === 'function') saveAndRenderTasks();
        }
    }
    else if (cleanCommand.includes("delete task")) {
        const splitParts = cleanCommand.split("delete task");
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            const targetName = splitParts[1].trim();
            let currentTasks = JSON.parse(localStorage.getItem('globalTasks')) || [];
            const updatedTasks = currentTasks.filter(task => {
                let normalizedTask = task.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
                return !normalizedTask.includes(targetName) && !targetName.includes(normalizedTask);
            });
            localStorage.setItem('globalTasks', JSON.stringify(updatedTasks));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderTasks === 'function') saveAndRenderTasks();
        }
    }
    else if (cleanCommand.includes("add meeting")) {
        const splitParts = cleanCommand.split("add meeting");
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            let meetingPayload = splitParts[1].trim();
            let meetingName = meetingPayload;
            let meetingTime = "";

            if (meetingPayload.includes(" at ")) {
                let parts = meetingPayload.split(" at ");
                meetingName = parts[0].trim();
                meetingTime = parts[1].trim();
            }

            if (!meetingTime) {
                meetingTime = prompt("🕒 What time is the meeting '" + meetingName + "' scheduled for?");
                if (!meetingTime || meetingTime.trim() === "") meetingTime = "Not Specified";
            }

            let currentMeetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
            currentMeetings.push({ name: meetingName, time: meetingTime, completed: false });
            localStorage.setItem('globalMeetings', JSON.stringify(currentMeetings));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderMeetings === 'function') saveAndRenderMeetings();
        }
    }
    else if (cleanCommand.includes("delete meeting")) {
        const splitParts = cleanCommand.split("delete meeting");
        if (splitParts.length > 1 && splitParts[1].trim() !== "") {
            const targetMeetingName = splitParts[1].trim();
            let currentMeetings = JSON.parse(localStorage.getItem('globalMeetings')) || [];
            const updatedMeetings = currentMeetings.filter(meet => {
                let normalizedMeeting = meet.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
                return !normalizedMeeting.includes(targetMeetingName) && !targetMeetingName.includes(normalizedMeeting);
            });
            localStorage.setItem('globalMeetings', JSON.stringify(updatedMeetings));
            syncGlobalWorkspaceMetrics();
            if (typeof saveAndRenderMeetings === 'function') saveAndRenderMeetings();
        }
    }
}

recognition.onresult = function(event) {
    const currentResultIndex = event.resultIndex;
    const spokenText = event.results[currentResultIndex][0].transcript;
    
    const commandSplitRegex = /\s+and\s+(?=go to task|go to tasks|add task|delete task|complete task|mark task|tick task|add meeting|delete meeting|complete meeting|mark meeting|tick meeting)/gi;
    const commandsArray = spokenText.split(commandSplitRegex);
    
    commandsArray.forEach(cmd => executeVoiceCommand(cmd));
};

window.addEventListener('load', function() {
    const pendingTask = localStorage.getItem('pendingVoiceTask');
    if (pendingTask) { localStorage.removeItem('pendingVoiceTask'); executeVoiceCommand("add task " + pendingTask); }
    
    const pendingMeeting = localStorage.getItem('pendingVoiceMeeting');
    if (pendingMeeting) { localStorage.removeItem('pendingVoiceMeeting'); executeVoiceCommand("add meeting " + pendingMeeting); }
    
    const pendingCompTask = localStorage.getItem('pendingCompleteTask');
    if (pendingCompTask) { localStorage.removeItem('pendingCompleteTask'); executeVoiceCommand("complete task " + pendingCompTask); }
    
    const pendingCompMeet = localStorage.getItem('pendingCompleteMeeting');
    if (pendingCompMeet) { localStorage.removeItem('pendingCompleteMeeting'); executeVoiceCommand("complete meeting " + pendingCompMeet); }

    if (localStorage.getItem('micActiveState') === 'true') {
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
        setTimeout(function() {
            try { recognition.start(); } catch(e) {}
        }, 300);
    }
};
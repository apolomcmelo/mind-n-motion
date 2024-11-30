const app = {
    dom: {
        pages: Array.from(document.querySelectorAll('.page')),
        settingsPageButton: document.getElementById("settings-page-button"),
        startStopButton: document.getElementById('start-stop-button'),
        startStopButtonIcon: document.getElementById('start-stop-button-icon'),
        reportPageButton: document.getElementById("report-page-button")
    },
    isRecording: false
}

// #### UI
function toggleStartStop() {
    app.dom.startStopButtonIcon.classList.toggle("ri-play-fill");
    app.dom.startStopButtonIcon.classList.toggle("ri-stop-fill");

    app.isRecording = !app.isRecording
}

function loadRecordingPage() {
    app.dom.startStopButtonIcon.classList.add("active");
    app.dom.settingsPageButton.classList.remove("active");
    app.dom.reportPageButton.classList.remove("active");

    showPage(1)
}

function loadSettingsPage() {
    app.dom.settingsPageButton.classList.add("active");
    app.dom.startStopButtonIcon.classList.remove("active");
    app.dom.reportPageButton.classList.remove("active");

    showPage(0)
}

function loadReportPage() {
    app.dom.reportPageButton.classList.add("active");
    app.dom.startStopButtonIcon.classList.remove("active");
    app.dom.settingsPageButton.classList.remove("active");

    showPage(2)
}

function showPage(index) {
    app.dom.pages.forEach((page, i) => {
        if (i === index) {
            page.classList.add('active');
            page.classList.remove('out-left', 'out-right');
        } else {
            page.classList.remove('active');
            page.classList.add(i < index ? 'out-left' : 'out-right');
        }
    });
}

function registerButtonListeners() {
    app.dom.startStopButton.addEventListener('click', (event) => {
        loadRecordingPage();

        if (app.isRecording) {
            stopRecording();
        } else {
            startRecording();

        }
        toggleStartStop();
    });
    app.dom.settingsPageButton.addEventListener('click', (event) => loadSettingsPage())
    app.dom.reportPageButton.addEventListener('click', (event) => loadReportPage())
}

// #### PWA Utils
function startServiceWorker() {
    navigator.serviceWorker.register('./service-worker.js', {
        scope: './'
    });
}

window.onload = () => {
    registerButtonListeners()
    loadRecordingPage() // This is the initial page

    metrics.forEach(metric => updateMetricsScore(metric))
    getCurrentLocation()
    initSpeedChart()
    startServiceWorker()

    // Simulate adding new data points every 5 seconds
    setInterval(() => {
        simulateMetricsChange();
        simulateSpeedChange();
    }, 2000);
}
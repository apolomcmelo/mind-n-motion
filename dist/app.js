import {Pages} from "./enums/pages.js";
import {RecordingService} from "./recording-service.js";
import {ReportService} from "./report-service.js";
export class App {
  constructor() {
    this.isRecording = false;
    this.pages = Array.from(document.querySelectorAll(".page"));
    this.settingsButton = document.getElementById("settings-page-button");
    this.startStopButton = document.getElementById("start-stop-button");
    this.startStopButtonIcon = document.getElementById("start-stop-button-icon");
    this.reportButton = document.getElementById("report-page-button");
    this.recordingService = new RecordingService();
    this.reportService = new ReportService();
    this.registerButtonListeners();
    this.loadRecordingPage();
  }
  registerButtonListeners() {
    this.settingsButton.addEventListener("click", (event) => this.loadSettingsPage());
    this.reportButton.addEventListener("click", (event) => this.loadReportPage());
    this.startStopButton.addEventListener("click", (event) => {
      this.loadRecordingPage();
      if (this.isRecording) {
        this.recordingService.stopRecording();
      } else {
        this.recordingService.startRecording();
      }
      this.toggleStartStopIcon();
      this.isRecording = !this.isRecording;
    });
  }
  toggleStartStopIcon() {
    this.startStopButtonIcon.classList.toggle("ri-play-fill");
    this.startStopButtonIcon.classList.toggle("ri-stop-fill");
  }
  loadSettingsPage() {
    this.settingsButton.classList.add("active");
    this.startStopButtonIcon.classList.remove("active");
    this.reportButton.classList.remove("active");
    this.showPage(Pages.SETTINGS);
  }
  loadRecordingPage() {
    this.startStopButtonIcon.classList.add("active");
    this.settingsButton.classList.remove("active");
    this.reportButton.classList.remove("active");
    this.showPage(Pages.RECORDING);
  }
  loadReportPage() {
    this.reportButton.classList.add("active");
    this.startStopButtonIcon.classList.remove("active");
    this.settingsButton.classList.remove("active");
    this.reportService.generateReport();
    this.showPage(Pages.REPORT);
  }
  showPage(index) {
    this.pages.forEach((page, i) => {
      if (i === index) {
        page.classList.add("active");
        page.classList.remove("out-left", "out-right");
      } else {
        page.classList.remove("active");
        page.classList.add(i < index ? "out-left" : "out-right");
      }
    });
  }
  startServiceWorker() {
    navigator.serviceWorker.register("./service-worker.js", {
      scope: "./"
    });
  }
  startSimulation() {
    setInterval(() => {
      let now = Date.now();
      this.recordingService.simulateMetricsChange(now);
      this.recordingService.simulateSpeedChange(now);
    }, 2e3);
  }
}

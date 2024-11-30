// #### Helper Functions
function getAverage(array) {
    return Math.round(array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length);
}

function getMax(array) {
    return Math.max(...array)
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {hour12: false});
}

function createChartHorizontalGradient(chartElement) {
    const gradient = chartElement.createLinearGradient(0, 0, chartElement.canvas.width, 0);

    gradient.addColorStop(0, '#9D00FF');
    gradient.addColorStop(0.25, '#00F0FF');

    return gradient;
}

function createChartVerticalGradient(chartElement) {
    const gradient = chartElement.createLinearGradient(0, 0, 0, chartElement.canvas.height);

    gradient.addColorStop(0, '#00F0FF');
    gradient.addColorStop(1, '#9D00FF');

    return gradient;
}

function updateChartWith(chart, chartElement, timestamp, value) {
    chart.data.labels.push(formatTimestamp(timestamp));

    chart.data.datasets[0].data.push(value);
    chart.data.datasets[0].borderColor = createChartHorizontalGradient(chartElement);

    chart.update();
}

function updateInfo(data, reportInfo, infoSuffix) {
    reportInfo.max.innerText = `Max: ${getMax(data)}${infoSuffix}`
    reportInfo.avg.innerText = `Avg: ${getAverage(data)}${infoSuffix}`
}
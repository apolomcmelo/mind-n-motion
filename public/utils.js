// #### Helper Functions
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {hour12: false});
}

function createChartGradient(chartElement) {
    // Create the gradient for the line
    const gradient = chartElement.createLinearGradient(0, 0, chartElement.canvas.width, 0);
    gradient.addColorStop(0, '#9D00FF');
    gradient.addColorStop(0.25, '#00F0FF');

    return gradient;
}

function updateChartWith(chart, chartElement, newDataPoint) {
    chart.data.labels.push(formatTimestamp(newDataPoint.timestamp));

    chart.data.datasets[0].data.push(newDataPoint.speed);
    chart.data.datasets[0].borderColor = createChartGradient(chartElement);

    chart.update();
}
// Market holiday data
const publicHolidays = {
    NY: [ 
        "2025-01-01","2025-01-20","2025-02-17","2025-04-18","2025-05-26","2025-06-19","2025-07-04",
        "2025-09-01","2025-11-27","2025-12-25","2026-01-01","2026-01-19","2026-02-16","2026-04-03",
        "2026-05-25","2026-06-19","2026-07-03","2026-09-07","2026-11-26","2026-12-25"
    ],
    BIST: [ 
        "2025-01-01","2025-04-23","2025-05-01","2025-05-19","2025-07-15","2025-08-30","2025-10-29",
        "2026-01-01","2026-04-23","2026-05-01","2026-05-19","2026-07-15","2026-08-30","2026-10-29"
    ]
};

function isWorkingDay(market) {
    const now = new Date();
    const day = now.getDay();
    const todayStr = now.toISOString().split("T")[0];
    const isHoliday = publicHolidays[market]?.includes(todayStr);
    return day !== 0 && day !== 6 && !isHoliday;
}

function displayLocalTime() {
    const now = new Date();
    const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('local-time').textContent = `Your local time: ${localTime} (${timeZone})`;
    updateLocalTimeLine(now, localTime);
}

function displayMarketHours() {
    const nyOpenUTC = new Date();
    nyOpenUTC.setUTCHours(14, 30, 0, 0);
    const nyCloseUTC = new Date();
    nyCloseUTC.setUTCHours(21, 0, 0, 0);
    const bistOpenUTC = new Date();
    bistOpenUTC.setUTCHours(7, 30, 0, 0);
    const bistCloseUTC = new Date();
    bistCloseUTC.setUTCHours(14, 0, 0, 0);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localNYOpen = new Date(nyOpenUTC.toLocaleString('en-US', { timeZone }));
    const localNYClose = new Date(nyCloseUTC.toLocaleString('en-US', { timeZone }));
    const localBISTOpen = new Date(bistOpenUTC.toLocaleString('en-US', { timeZone }));
    const localBISTClose = new Date(bistCloseUTC.toLocaleString('en-US', { timeZone }));

    updateMarketTimeLines(localNYOpen, localNYClose, 'market', 'New York');
    updateMarketTimeLines(localBISTOpen, localBISTClose, 'bist', 'BIST');
}

function updateLocalTimeLine(now, localTime) {
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const percentage = (totalMinutes / (24 * 60)) * 100;

    const localTimeLine = document.getElementById('local-time-line');
    localTimeLine.style.left = `${percentage}%`;
    localTimeLine.style.height = '180px';

    const localTimeLabel = document.getElementById('local-time-label');
    localTimeLabel.style.left = `${percentage + 1}%`;
    localTimeLabel.style.top = '160px';
    localTimeLabel.textContent = 'Local Time';

    const localTimeBelowLabel = document.createElement('div');
    localTimeBelowLabel.classList.add('time-label');
    localTimeBelowLabel.style.left = `${percentage + 1}%`;
    localTimeBelowLabel.textContent = localTime;
    localTimeBelowLabel.style.top = '180px';
    localTimeLine.parentNode.appendChild(localTimeBelowLabel);
}

function updateMarketTimeLines(openTime, closeTime, prefix, marketName) {
    const openMinutes = openTime.getHours() * 60 + openTime.getMinutes();
    const closeMinutes = closeTime.getHours() * 60 + closeTime.getMinutes();
    
    const openPercentage = (openMinutes / (24 * 60)) * 100;
    const closePercentage = (closeMinutes / (24 * 60)) * 100;

    const isCrossDay = closeMinutes < openMinutes;
    
    updateTimeLines(prefix, openPercentage, closePercentage, isCrossDay);
    updateLabels(prefix, openPercentage, closePercentage, marketName, isCrossDay);
    updateTimeLabels(prefix, openPercentage, closePercentage, openTime, closeTime);
}

function updateTimeLines(prefix, openPercentage, closePercentage, isCrossDay) {
    const openLine = document.getElementById(`${prefix}-open-line`);
    const closeLine = document.getElementById(`${prefix}-close-line`);
    const highlight = document.getElementById(`${prefix}-highlight`);
    const highlightNext = document.getElementById(`${prefix}-highlight-next`);

    openLine.style.left = `${openPercentage}%`;
    closeLine.style.left = `${closePercentage}%`;

    if (isCrossDay) {
        highlight.style.left = `${openPercentage}%`;
        highlight.style.width = `${100 - openPercentage}%`;
        highlightNext.style.left = '0%';
        highlightNext.style.width = `${closePercentage}%`;
        highlightNext.style.display = 'block';
    } else {
        highlight.style.left = `${openPercentage}%`;
        highlight.style.width = `${closePercentage - openPercentage}%`;
        highlightNext.style.display = 'none';
    }
}

function updateLabels(prefix, openPercentage, closePercentage, marketName, isCrossDay) {
    const openLabel = document.getElementById(`${prefix}-open-label`);
    const closeLabel = document.getElementById(`${prefix}-close-label`);
    
    openLabel.style.left = `${openPercentage + 1}%`;
    closeLabel.style.left = `${closePercentage + 1}%`;

    if (isCrossDay && !closeLabel.textContent.includes('(Next Day)')) {
        closeLabel.textContent = `${marketName} Closes (Next Day)`;
    }
}

function updateTimeLabels(prefix, openPercentage, closePercentage, openTime, closeTime) {
    const openTimeLabel = document.getElementById(`${prefix}-open-time`);
    const closeTimeLabel = document.getElementById(`${prefix}-close-time`);
    
    openTimeLabel.style.left = `${openPercentage + 1}%`;
    closeTimeLabel.style.left = `${closePercentage + 1}%`;
    
    openTimeLabel.textContent = formatTime(openTime);
    closeTimeLabel.textContent = formatTime(closeTime);
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function updateMarketClosedStatus() {
    updateMarketStatus("BIST", "bist");
    updateMarketStatus("NY", "market", "NYSE");
}

function updateMarketStatus(marketKey, prefix, displayName = "BIST") {
    if (!isWorkingDay(marketKey)) {
        const elements = {
            lines: [`${prefix}-open-line`, `${prefix}-close-line`],
            labels: [`${prefix}-close-label`],
            times: [`${prefix}-open-time`, `${prefix}-close-time`],
            highlights: [`${prefix}-highlight`, `${prefix}-highlight-next`]
        };

        [...elements.lines, ...elements.labels, ...elements.times, ...elements.highlights]
            .forEach(id => {
                const element = document.getElementById(id);
                if (element) element.style.display = 'none';
            });

        const marketLabel = document.getElementById(`${prefix}-open-label`);
        if (marketLabel) {
            marketLabel.innerHTML = `${displayName} Closed Today`;
            marketLabel.classList.add(`${prefix}-closed-label`);
        }
    }
}

// Initialize display
displayLocalTime();
displayMarketHours();
updateMarketClosedStatus();

// Refresh every minute
setInterval(() => {
    location.reload();
}, 60000);

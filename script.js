const searchBtn = document.getElementById('searchBtn');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const weatherResult = document.getElementById('weatherResult');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentTemp = document.getElementById('currentTemp');
const hourlyList = document.getElementById('hourlyList');
const coordinates = document.getElementById('coordinates');

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

function getDateRange() {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 14);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDate(today),
        end: formatDate(endDate)
    };
}

async function getWeather() {
    const latitude = latitudeInput.value.trim();
    const longitude = longitudeInput.value.trim();

    if (!latitude || !longitude) {
        showError('Please enter both latitude and longitude');
        return;
    }

    if (isNaN(latitude) || isNaN(longitude)) {
        showError('Please enter valid numbers for coordinates');
        return;
    }

    if (latitude < -90 || latitude > 90) {
        showError('Latitude must be between -90 and 90');
        return;
    }

    if (longitude < -180 || longitude > 180) {
        showError('Longitude must be between -180 and 180');
        return;
    }

    weatherResult.classList.remove('show');
    error.classList.remove('show');
    loading.classList.add('show');
    searchBtn.disabled = true;

    try {
        const dateRange = getDateRange();
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&start_date=${dateRange.start}&end_date=${dateRange.end}`;

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        displayWeather(data, latitude, longitude);

    } catch (err) {
        showError('Error fetching weather data. Please check your coordinates and try again.');
        console.error(err);
    } finally {
        loading.classList.remove('show');
        searchBtn.disabled = false;
    }
}

function displayWeather(data, lat, lon) {
    coordinates.textContent = `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°`;

    const currentTemperature = data.hourly.temperature_2m[0];
    currentTemp.textContent = `${currentTemperature.toFixed(1)}°C`;

    hourlyList.innerHTML = '';
    const hours = Math.min(24, data.hourly.time.length);
    
    for (let i = 0; i < hours; i++) {
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'hour-time';
        timeDiv.textContent = formatDateTime(data.hourly.time[i]);
        
        const tempDiv = document.createElement('div');
        tempDiv.className = 'hour-temp';
        tempDiv.textContent = `${data.hourly.temperature_2m[i].toFixed(1)}°C`;
        
        hourItem.appendChild(timeDiv);
        hourItem.appendChild(tempDiv);
        hourlyList.appendChild(hourItem);
    }

    weatherResult.classList.add('show');
}

function showError(message) {
    error.textContent = message;
    error.classList.add('show');
    setTimeout(() => {
        error.classList.remove('show');
    }, 5000);
}

searchBtn.addEventListener('click', getWeather);

[latitudeInput, longitudeInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
});

window.addEventListener('load', () => {
    getWeather();
});

const searchBtn = document.getElementById('searchBtn');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const weatherResult = document.getElementById('weatherResult');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentTemp = document.getElementById('currentTemp');
const hourlyList = document.getElementById('hourlyList');
const coordinates = document.getElementById('coordinates');
const locationName = document.getElementById('locationName');

// ⭐ ADD YOUR API KEY HERE ⭐
const API_KEY = 'e2f753071aed43fd99b140302252110';

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
        // WeatherAPI.com accepts coordinates as "lat,lon" format
        const query = `${latitude},${longitude}`;
        
        // Fetch current weather
        const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=yes`;
        const currentResponse = await fetch(currentUrl);
        
        if (!currentResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const currentData = await currentResponse.json();
        
        // Fetch forecast (for hourly data)
        const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=2&aqi=yes&alerts=no`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const forecastData = await forecastResponse.json();

        displayWeather(currentData, forecastData, latitude, longitude);

    } catch (err) {
        showError('Error fetching weather data. Please check your coordinates and try again.');
        console.error(err);
    } finally {
        loading.classList.remove('show');
        searchBtn.disabled = false;
    }
}

function displayWeather(currentData, forecastData, lat, lon) {
    // Update location name
    locationName.textContent = `${currentData.location.name}, ${currentData.location.country}`;
    
    // Update coordinates
    coordinates.textContent = `${parseFloat(lat).toFixed(2)}°, ${parseFloat(lon).toFixed(2)}°`;

    // Display current temperature
    const currentTemperature = currentData.current.temp_c;
    currentTemp.textContent = `${currentTemperature.toFixed(1)}°C`;

    // Display hourly forecast
    hourlyList.innerHTML = '';
    
    // Get all hourly data from today and tomorrow
    const allHours = [];
    forecastData.forecast.forecastday.forEach(day => {
        allHours.push(...day.hour);
    });
    
    // Filter to show only upcoming hours (next 24 hours from now)
    const now = new Date();
    const upcomingHours = allHours.filter(hour => {
        const hourTime = new Date(hour.time);
        return hourTime >= now;
    }).slice(0, 24);
    
    upcomingHours.forEach(hour => {
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'hour-time';
        timeDiv.textContent = formatDateTime(hour.time);
        
        const tempDiv = document.createElement('div');
        tempDiv.className = 'hour-temp';
        tempDiv.innerHTML = `
            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">
            ${hour.temp_c.toFixed(1)}°C
        `;
        
        hourItem.appendChild(timeDiv);
        hourItem.appendChild(tempDiv);
        hourlyList.appendChild(hourItem);
    });

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

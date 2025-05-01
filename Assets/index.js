const apiUrl = 'https://api.open-meteo.com/v1/forecast';
const geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const cityNameElem = document.querySelector('.city-name');
const temperatureElem = document.querySelector('.temperature');
const descriptionElem = document.querySelector('.description');
const humidityElem = document.querySelector('.humidity-value');
const windElem = document.querySelector('.wind-value');
const weatherIcon = document.getElementById('weatherIcon');
const loader = document.getElementById('loader');

async function fetchWeather(city) {
  loader.style.display = 'flex';

  try {
    const geoResponse = await fetch(`${geocodingUrl}?name=${city}&count=1`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherResponse = await fetch(
      `${apiUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weathercode,relative_humidity_2m&timezone=auto`
    );
    const data = await weatherResponse.json();

    updateWeather(data, name);
  } catch (error) {
    showError(error.message);
  } finally {
    loader.style.display = 'none';
  }
}

function updateWeather(data, cityName) {
  const temperature = data.current.temperature_2m;
  const windSpeed = data.current.wind_speed_10m;
  const humidity = data.current.relative_humidity_2m; 
  const weatherCode = data.current.weathercode;

  cityNameElem.textContent = cityName;
  temperatureElem.textContent = `${Math.round(temperature)} °C`;
  descriptionElem.textContent = getWeatherDescription(weatherCode);
  humidityElem.textContent = `Humidity: ${humidity}%`; 
  windElem.textContent = `Wind: ${windSpeed} m/s`;

  const description = getWeatherDescription(weatherCode).toLowerCase();

  if (description.includes('cloud')) {
    weatherIcon.src = 'images/cloudy.png';
  } else if (description.includes('rain')) {
    weatherIcon.src = 'images/rain.png';
  } else if (description.includes('clear')) {
    weatherIcon.src = 'images/clear.png';
  } else if (description.includes('snow')) {
    weatherIcon.src = 'images/snow.png';
  } else {
    weatherIcon.src = 'images/Weather.jpg';
  }

  setWeatherBackground(description);

  weatherDisplay.classList.add('fade-in');
  setTimeout(() => weatherDisplay.classList.remove('fade-in'), 1000);
}

function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
  };
  return codes[code] || 'Unknown';
}

function showError(message) {
  cityNameElem.textContent = 'Oops!';
  temperatureElem.textContent = '-- °C';
  descriptionElem.textContent = message;
  humidityElem.textContent = 'Humidity: --%';
  windElem.textContent = 'Wind: -- m/s';
  weatherIcon.src = 'images/Weather.jpg';
  setWeatherBackground('default');
}

function setWeatherBackground(description) {
  if (description.includes('cloud')) {
    document.body.style.backgroundImage = "url('images/clouds.jpg')";
  } else if (description.includes('rain')) {
    document.body.style.backgroundImage = "url('images/rain.jpg')";
  } else if (description.includes('clear')) {
    document.body.style.backgroundImage = "url('images/clear.jpg')";
  } else if (description.includes('snow')) {
    document.body.style.backgroundImage = "url('images/snow.jpg')";
  } else {
    document.body.style.backgroundImage = "url('images/default.jpg')";
  }

  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    cityInput.value = '';
  }
});

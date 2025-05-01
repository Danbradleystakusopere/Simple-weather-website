// API URLs for weather and geocoding services
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
    // Requesting geocoding API to get the latitude and longitude for the city
    const geoResponse = await fetch(`${geocodingUrl}?name=${city}&count=1`);
    const geoData = await geoResponse.json(); // Parse the JSON response

    // If the city is not found, throw an error
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    // Destructure the latitude, longitude, and city name from the response
    const { latitude, longitude, name } = geoData.results[0];

    // Requesting weather data from the weather API using the latitude and longitude
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

// Function to update the weather data in the HTML elements
function updateWeather(data, cityName) {
  const temperature = data.current.temperature_2m; 
  const windSpeed = data.current.wind_speed_10m; 
  const humidity = data.current.relative_humidity_2m; 
  const weatherCode = data.current.weathercode; 

  // Update the city name, temperature, and weather details in the HTML
  cityNameElem.textContent = cityName;
  temperatureElem.textContent = `${Math.round(temperature)} °C`; 
  descriptionElem.textContent = getWeatherDescription(weatherCode); 
  humidityElem.textContent = `Humidity: ${humidity}%`; 
  windElem.textContent = `Wind: ${windSpeed} m/s`; 

  // Set the weather icon based on the weather description
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

  // Set the background based on the weather description
  setWeatherBackground(description);

  // Add a fade-in animation for the weather display
  weatherDisplay.classList.add('fade-in');
  setTimeout(() => weatherDisplay.classList.remove('fade-in'), 1000); 
}

// Function to map weather codes to human-readable descriptions
function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow', 73: 'Moderate snow',
    75: 'Heavy snow', 80: 'Rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm',
  };
  return codes[code] || 'Unknown'; 
}

// Function to show an error message when something goes wrong
function showError(message) {
  
  cityNameElem.textContent = 'Oops!';
  temperatureElem.textContent = '-- °C';
  descriptionElem.textContent = message;
  humidityElem.textContent = 'Humidity: --%';
  windElem.textContent = 'Wind: -- m/s';
  weatherIcon.src = 'images/Weather.jpg';
  setWeatherBackground('default'); 
}

// Function to change the background image based on weather conditions
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

  // Ensure the background image covers the screen and is centered
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}

// Event listener for form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault(); 
  const city = cityInput.value.trim(); 
  if (city) {
    fetchWeather(city); 
    cityInput.value = ''; 
  }
});

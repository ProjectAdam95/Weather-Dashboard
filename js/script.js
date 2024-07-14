document.addEventListener('DOMContentLoaded', () => {
    // // Set the API key and obtain references to necessary DOM elements
    const apiKey = 'ac16efb0546041fb80c15c39d23b4692';
    const cityForm = document.getElementById('city-form');
    const cityInput = document.getElementById('city-input');
    const searchHistory = document.getElementById('search-history');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');

    // Add event listener to the form to search for a city
    cityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cityName = cityInput.value.trim();
        if (cityName) fetchCoordinates(cityName);
    });

    //Fetch the coordinates(latitude and longitude).
    const fetchCoordinates = (city) => {
        fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => data.length ? fetchWeather(data[0].lat, data[0].lon, city) : alert('City not found'))
            .catch(console.error);
    };

    // Fetch the weather data for the given coordinates
    const fetchWeather = (lat, lon, city) => {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => {
                displayWeather(data, city);
                updateHistory(city);
            })
            .catch(console.error);
    };

    // Display the current weather and 5-day forecast
    const displayWeather = (data, city) => {
        const weather = data.list[0];
        // Update the current weather section
        currentWeather.innerHTML = `
            <div class="weather-card">
                <h2>${city}</h2>
                <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
                <p><img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="Weather icon"></p>
                <p>Temperature: ${weather.main.temp}°C</p>
                <p>Humidity: ${weather.main.humidity}%</p>
                <p>Wind Speed: ${weather.wind.speed} m/s</p>
            </div>
        `;

        // Clear previous forecast
        forecast.innerHTML = '';
        const dailyForecasts = {};
        
        // Collect daily forecasts
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = item;
            }
        });

        // Display 5-day forecast
        Object.values(dailyForecasts).slice(0, 5).forEach(weather => {
            forecast.innerHTML += `
                <div class="weather-card">
                    <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
                    <p><img src="http://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="Weather icon"></p>
                    <p>Temperature: ${weather.main.temp}°C</p>
                    <p>Humidity: ${weather.main.humidity}%</p>
                    <p>Wind Speed: ${weather.wind.speed} m/s</p>
                </div>
            `;
        });
    };

    // Update the search history in localStorage
    // Get the cities from localStorage
    const updateHistory = (city) => {
        let cities = JSON.parse(localStorage.getItem('cities')) || []; 
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem('cities', JSON.stringify(cities)); // Save the updated list to localStorage
        }
        displayHistory();
    };

    // Display the search history from localStorage
    const displayHistory = () => {
        let cities = JSON.parse(localStorage.getItem('cities')) || [];
        searchHistory.innerHTML = cities.map(city => `<button>${city}</button>`).join('');
        searchHistory.querySelectorAll('button').forEach(button => 
            button.addEventListener('click', () => fetchCoordinates(button.textContent))
        );
    };

    // Display search history on page load
    displayHistory();
});



document.addEventListener('DOMContentLoaded', () => {
    // // Set the API key and obtain references to necessary DOM elements.
    const apiKey = 'ac16efb0546041fb80c15c39d23b4692';
    const cityForm = document.getElementById('city-form');
    const cityInput = document.getElementById('city-input');
    const searchHistory = document.getElementById('search-history');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');

    // Add event listener to the form to search for a city.
    // The event listener handles the city search, prevents the default submission.
    // Calls the fetchCoordinates function with the city name you have entered.
    cityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cityName = cityInput.value.trim();
        if (cityName) fetchCoordinates(cityName);
    });

    // Fetch the coordinates(latitude and longitude).
    // Takes city name as an argument, makes a GET request from the Open Weather API.
    // If the response is succesful converts it to JSON. If the city is found, 
    // Calls the fetchWeather function with the coordinates of the city. If the city is not found, displays an alert. Logs errors to the console
    const fetchCoordinates = (city) => {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => data.length ? fetchWeather(data[0].lat, data[0].lon, city) : alert('City not found'))
            .catch(console.error);
    };

    // Fetch the weather data for the given coordinates
    // Takes the coordinates and city name as arguments, makes a GET request from the Open Weather API.
    // If the response is succesful converts it to JSON.
    // Calls the displayWeather function and the updateHistory function.
    // Logs any errors to console.
    const fetchWeather = (lat, lon, city) => {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => {
                displayWeather(data, city);
                updateHistory(city);
            })
            .catch(console.error);
    };

    // Display the current weather and 5-day forecast.
    // Takes the weather data and city name as arguments.
    // Updates current weather section, clears previous forecast to prepare new 5 day forecast.
    // Updates forecast section with the 5-day forecast data. (Date, Weather icon, Temperature, Humidity, Wind Speed).
    const displayWeather = (data, city) => {
        const weather = data.list[0];
        // Update the current weather section
        currentWeather.innerHTML = `
            <div class="weather-card">
                <h2>${city}</h2>
                <p>Date: ${new Date(weather.dt * 1000).toLocaleDateString()}</p>
                <p><img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="Weather icon"></p>
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
                    <p><img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png" alt="Weather icon"></p>
                    <p>Temperature: ${weather.main.temp}°C</p>
                    <p>Humidity: ${weather.main.humidity}%</p>
                    <p>Wind Speed: ${weather.wind.speed} m/s</p>
                </div>
            `;
        });
    };

    // Takes city name as argument, gets search history from local storage.
    // Adds the city to the search history if its not already there.
    // Saves the updated search history to localStorage and calls the displayHistory function
    const updateHistory = (city) => {
        let cities = JSON.parse(localStorage.getItem('cities')) || []; 
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem('cities', JSON.stringify(cities)); // Save the updated list to localStorage
        }
        displayHistory();
    };

    // Display the search history from localStorage
    // Retrieves search history from localStorage, creates a button for each city.
    // Adds an event listener to each button to dethc and display weather data for the corresponding city when clicked.
    const displayHistory = () => {
        let cities = JSON.parse(localStorage.getItem('cities')) || []; // Get the cities from localStorage
        searchHistory.innerHTML = cities.map(city => `<button>${city}</button>`).join(''); // Create buttons for each city
        // Add click event listeners to the buttons
        searchHistory.querySelectorAll('button').forEach(button => 
            button.addEventListener('click', () => fetchCoordinates(button.textContent))
        );
    };

    // Display the search history when the page loads
    displayHistory();
});



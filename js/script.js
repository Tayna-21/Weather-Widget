"use strict"

const showWeather = () => {
    const searchField = document.getElementById('search_field');

    async function loadWeather(lat,lon) {
        const apiKey = '21bbb2a01858dbd33c462b69bbe58159';
        const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric'
        const api = (`${apiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);

        fetch(api)
          .then(response => response.json())
          .then(data => {
            document.getElementById('cancel_btn').classList.remove('inactive');
            document.getElementById('cancel_btn').addEventListener('click', () => {
                searchField.value = '';
                document.getElementById('cancel_btn').classList.add('inactive');
                document.getElementById('search_btn').classList.remove('inactive');
            });

            searchField.value = `${data.city.name}, ${data.city.country}`;
            const selectedLocation = document.querySelector('.selected_location');
            selectedLocation.innerHTML = (`Selected: <span>${searchField.value}</span>`);

            const weekdays = [];
            const dates = [];
            const allWeatherStates = []
            const weatherState = [];
            let tempMinValues = [];
            let tempMaxValues = [];

            data.list.forEach((item) => {
                const dayFullDate = new Date(item.dt * 1000);
                const dayName = dayFullDate.toString().slice(0, 3);
                weekdays.push(dayName);
            });
            const uniqueWeekdays = [...new Set(weekdays)];

            data.list.forEach((item) => {
                dates.push(item.dt_txt.slice(0, 10))
            });
            const uniqueDates = [...new Set(dates)];

            uniqueDates.forEach((date) => {
                data.list.forEach((item) => {
                    const dayShortDate = item.dt_txt.slice(0, 10);

                    if (date !== uniqueDates[0] && date === dayShortDate) {
                        allWeatherStates.push(item.weather[0].main);
                    };
                });
            });

            for (let i = 4; i < allWeatherStates.length; i+=8) {
                weatherState.push(allWeatherStates[i]);
            }

            const findMinTemperature = (i) => {
                data.list.forEach((item) => {
                    const dayDate = item.dt_txt.slice(0, 10);

                      if (uniqueDates[i] === dayDate) {
                          tempMinValues.push(item.main.temp_min);
                      };
                });
                const resultMin = Math.floor(Math.min(...tempMinValues));
                tempMinValues = [];
                return resultMin;
            };

            const findMaxTemperature = (i) => {
                data.list.forEach((item) => {
                    const dayDate = item.dt_txt.slice(0, 10);

                      if (uniqueDates[i] === dayDate) {
                          tempMaxValues.push(item.main.temp_max);
                      };
                });
                const resultMax = Math.ceil(Math.max(...tempMaxValues));
                tempMaxValues = [];
                return resultMax;
            };

            const weather = document.getElementById('weather');
            const currentWeather = {
                getShortCityName: () => {
                    const nameOfCity = data.city.name;
                      if (nameOfCity.length > 8) {
                        const shortCityName = nameOfCity.slice(0, 8).concat('...');
                        return shortCityName;
                      };
                    return nameOfCity;
                },
                current_temperature: Math.round(data.list[0].main.temp),
                current_weather_state: data.list[0].weather[0].main.toLowerCase(),
                future_temperature: Math.round(data.list[4].main.temp),
                future_weather_state: data.list[4].weather[0].main,
            };

            const currentWeatherTemplate = `
              <div class="current_weather">
                <div class="first_column">
                  <p class="current_temperature light_font_color">${currentWeather.current_temperature}&degC</p>
                  <p class="later_forecast blue_font_color">${currentWeather.future_weather_state} ${currentWeather.future_temperature}&degC</p>
                </div>
                <div class="second_column">
                  <p class="current_weather_state light_font_color">${currentWeather.current_weather_state}</p>
                  <p class="current_location red_font_color">${currentWeather.getShortCityName()}</p>
                </div>
                <div class="current_weather_state_img"><img src="./icons/${currentWeather.current_weather_state}.svg"></div>
              </div>
              `;

            const renderItem = (i) => {
                const dailyWeatherTemplate = `
                  <div class="daily_weather">
                    <p class="day_name red_font_color">${uniqueWeekdays[i]}</p>
                    <img class="daily_weather_icon" src="./icons/${weatherState[i - 1].toLowerCase()}.svg">
                    <p class="daily_weather_state blue_font_color">${weatherState[i - 1]}</p>
                    <div class="last_column">
                      <p class="day blue_font_color">Day</p>
                      <p class="day_temperature blue_font_color">${findMaxTemperature(i)}&deg;</p>
                      <p class="night_temperature blue_font_color">${findMinTemperature(i)}&deg;</p>
                      <p class="night blue_font_color">Night</p>
                    </div>
                    </div>
                    `;
                return dailyWeatherTemplate;
              };

            weather.insertAdjacentHTML('afterbegin', currentWeatherTemplate);

            for (let i = 1; i < 5; i++) {
              weather.insertAdjacentHTML('beforeend', renderItem(i));
            };

          })
          .catch(error => console.log(error.message));
    };

    window.addEventListener('load', () => {
        document.getElementById('search_btn').classList.add('inactive');
        document.getElementById('cancel_btn').classList.add('inactive');
        const success = (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            loadWeather(lat, lon);
        };
        navigator.geolocation.getCurrentPosition(success);
    });

    searchField.addEventListener('input', () => {
        document.getElementById('cancel_btn').classList.add('inactive');
        document.getElementById('search_btn').classList.remove('inactive');
    });

    document.getElementById('search_btn').addEventListener('click', () => {
        document.getElementById('cancel_btn').classList.remove('inactive');
        document.getElementById('search_btn').classList.add('inactive');

        const weather = document.getElementById('weather');
        weather.innerHTML = '';
        const regex = /[A-Za-z\s,-.]+[A-Za-z]/;
        const cityName = searchField.value;
        const selectedLocation = document.querySelector('.selected_location');

        async function findLocation(cityName) {
            const apiKey = '21bbb2a01858dbd33c462b69bbe58159';
            const api = (`http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`);

            fetch(api)
              .then(response => response.json())
              .then(data => {
                const lat = data.city.coord.lat;
                const lon = data.city.coord.lon;

                loadWeather(lat, lon);
              })
              .catch(error => console.log(error.message));
        };

        if (searchField.checkValidity() === true) {
            findLocation(cityName);
        } else if (!cityName.match(regex)) {
            selectedLocation.innerHTML = ('Wrong input');
            return false;
        };
    });
};
document.addEventListener('DOMContentLoaded', showWeather);

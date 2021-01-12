const APIkey = '00b082df0016aa2437da0914031b7598';
// Current date using moment.js
const $currentDate = moment().format("L");

// Grabbing recentCities from localStorage and displaying under city input
$(document).ready(function () {
  if (localStorage.getItem("recentCities") !== null) {
    let citiesArr = JSON.parse(localStorage.getItem("recentCities"));
    citiesArr.forEach((city) => {
      let $recentCityDiv = $("<div>");
      $recentCityDiv.text(city);
      $(".recentCitiesList").append($recentCityDiv);
    });
  }
});

// Eventlistener for search button
$("#citySearchBtn").on("click", function (event) {
  event.preventDefault();
  const cityInput = $("#cityInput").val();
  let queryURL =
    `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}
    &appid=${APIkey}&units=imperial`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).done(function (response) {
    $("#ajaxError").empty();
    let citiesArr = JSON.parse(localStorage.getItem("recentCities")) || [];
    let cityName = response.name;
    citiesArr.unshift(cityName);
    // Adding city input to localStorage
    localStorage.setItem("recentCities", JSON.stringify(citiesArr));
    // Clear and regenerate recent cities list on every search
    $(".recentCitiesList").empty();
    citiesArr.forEach((city) => {
      let $recentCityDiv = $("<div>");
      $recentCityDiv.text(city);
      $(".recentCitiesList").append($recentCityDiv);
    });
    weatherStats(response);
  }).fail(function(xhr) {
    // Error handling when requests returns 404 error
      if(xhr.status === 404) {
        $("#ajaxError").text('Unable to find city, please confirm spelling and try again.')
      }
  })
});

function weatherStats(city) {
  // Adding weather stats to object
  let $cityInfo = {
    name: city.name,
    temp: `${Math.round(city.main.temp)}°F`,
    humidity: `${city.main.humidity}%`,
    wind: `${Math.round(city.wind.speed)} mph`,
    conditionsIcon: `https:///openweathermap.org/img/w/${city.weather[0].icon}.png`,
  };

  // Adding an img element and src attribute to get weather icon
  let $weatherIcon = $("<img>").attr("src", $cityInfo.conditionsIcon);

  // Add text to div elements in
  $(".weatherStats").addClass('weatherStatsStyle');
  $("#cityHeader").text(`${$cityInfo.name} ${$currentDate}`);
  $("#cityHeader").append($weatherIcon);
  $("#cityTemp").text(`Temperature:  ${$cityInfo.temp}`);
  $("#cityHumidity").text(`Humidity: ${$cityInfo.humidity}`);
  $("#cityWind").text(`Wind Speed: ${$cityInfo.wind}`);

  // Request to get UV Index value using longitude and latitiude
  let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${APIkey}&units=imperial`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    // Adding uvIndex to cityInfo object
    $cityInfo.uvIndex = response.value;

    // Adding UV index to page
    let $indexNumSpan = $("<span id='indexNumber'>");
    $indexNumSpan.text($cityInfo.uvIndex);
    $("#cityUvIndex").text("UV Index: ");
    $("#cityUvIndex").append($indexNumSpan);
    // Adding background color to UV index based on value
    if ($cityInfo.uvIndex < 4) {
      $("#indexNumber").addClass("favorable");
    } else if ($cityInfo.uvIndex > 4 && $cityInfo.uvIndex < 8) {
      $("#indexNumber").addClass("moderate");
    } else {
      $("#indexNumber").addClass("severe");
    }
  });
  fiveDayForecast($cityInfo)
}

function fiveDayForecast(cityInfo) {
  $("#forecastHeader").text("5 Day Forecast:")
  let queryURL = `https://api.openweathermap.org/data/2.5/forecast/?q=${cityInfo.name}&appid=${APIkey}&units=imperial`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    // Filter for weather at noon of each day
    let $forecast = response.list.filter(city => city.dt_txt.includes("12:00"));
    $(".fiveDayForecast").empty();
      // Dynamically creating a weather card for each day in forecast
      $.each($forecast, function(i, forecast) {
        const $dailyForecastDiv = $("<div class='dailyForecastDiv'>");
        // Adding content to each element
          let $forecastDate = $("<h5 class='forecastDate'>").text(moment(forecast.dt_txt).format('L'));
          let $forecastIcon = $("<img class='forecastIcon'>").attr("src", `https:///openweathermap.org/img/w/${forecast.weather[0].icon}.png`);
          let $forecastTemp = $("<div class='forecastTemp'>").text(`Temp: ${Math.round(forecast.main.temp)}°F`)
          let $forecastHumidity = $("<div class='forecastHumidity'>").text(`Humidity: ${forecast.main.humidity}%`)

        // Building and adding forecast cards to page
          $dailyForecastDiv.append($forecastDate)
          $forecastDate.append($forecastIcon)
          $forecastDate.append($forecastTemp)
          $forecastTemp.append($forecastHumidity)
          $(".fiveDayForecast").append($dailyForecastDiv);
        })
  })
}

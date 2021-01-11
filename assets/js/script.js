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
  }).then(function (response) {
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
  });
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
}

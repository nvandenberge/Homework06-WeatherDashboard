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
  });
});

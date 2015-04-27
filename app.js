//Current Weather API is giving weather per day or per month per year
//Current Electricty APIs for SF, LA and CHI are per year
//
//1st Need to know the number of hours of sunlight for a city over an entire year. Actually let's start with a day and the known energy needs for a specific zip.
//2nd Need to know the electricity or energy total usage for that city for an entire year
//3rd Need to calculate how many solar panels would be needed to meet the power needs for the hours of sunlight
//3rd Need to know the sqft of that neighborhood to determine if the solar panels would fit
//
//1. Get the sunlight time per month for all of the zip codes in a city. Or alternatively get it for one geolocation.
//2. 
//
//
//

//
//
//AJAX request
//

//Inspired by http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
//http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Inspired by http://eloquentjavascript.net/17_http.html
var laZipElectricity = new XMLHttpRequest();
laZipElectricity.open('GET', 'https://data.lacity.org/api/views/rijp-9dwj/rows.json', true);
laZipElectricity.send(null);

var zipWeather = new XMLHttpRequest();
zipWeather.open('GET', '//api.worldweatheronline.com/premium/v1/past-weather.ashx?q=San+Francisco&format=json&date=2009-12-23&key=5362d7ee160aa329b22c87b89aae8', true);
zipWeather.send(null);

var ghi = new XMLHttpRequest();
ghi.open('GET', 'http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=DPx3KUp9krBKyHIiDqd1axWqETim9pYy3BwT6f5z&address=Los+Angeles', true);
ghi.send(null);


zipWeather.addEventListener('load', function() {
  var zipWeatherObj = JSON.parse(zipWeather.responseText);
  var zipWeatherDate = zipWeatherObj['data']['weather'][0]['date']; 
  var zipSunRise = zipWeatherObj['data']['weather'][0]['astronomy'][0]['sunrise']; 
  var zipSunSet = zipWeatherObj['data']['weather'][0]['astronomy'][0]['sunset']; 
  var sunRiseDateTime = new Date(zipWeatherDate + ' ' + zipSunRise);
  var sunSetDateTime = new Date(zipWeatherDate + ' ' + zipSunSet);
  var sunRiseDateHours = sunRiseDateTime.getHours(); 
  var sunRiseDateMinutes = sunRiseDateTime.getMinutes(); 
  var sunSetDateHours = sunSetDateTime.getHours(); 
  var sunSetDateMinutes = sunSetDateTime.getMinutes(); 
  var sunSetDateTime = new Date(zipWeatherDate + ' ' + zipSunSet);

//ghIrradiance data object
  var ghIrradianceObj = JSON.parse(ghi.responseText);
  var ghIrradianceDailyAvg = ghIrradianceObj['outputs']['avg_ghi']['annual'];
  document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

//Los Angeles Electricity
  var laElectricityObj = JSON.parse(laZipElectricity.responseText);
  var laElectricityAnnualAvg = thousandCommaSeparator(Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000) / 365.24));

  document.getElementById('laElectricityUsage').innerHTML = laElectricityAnnualAvg;

//Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
//71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
//Solar Panels Needed
  var numSolarPanelsRaw = Number.parseInt(Number.parseInt(laElectricityAnnualAvg.replace(/\,/g, "")) / (Number.parseFloat(ghIrradianceDailyAvg) * 0.390 * 0.711)); 
  var numSolarPanels = thousandCommaSeparator(numSolarPanelsRaw); 
  document.getElementById('numSolarPanelsNeeded').innerHTML = numSolarPanels;


  var grapeSolarPanelLengthIn = 77.2;
  var grapeSolarPanelWidthIn = 51.5;
  var grapeSolarPanelPrice = 585;
  var grapeSolarPanelsSqft = (grapeSolarPanelLengthIn/12) * (grapeSolarPanelWidthIn/12); 
  var laAreaForSolarSqftNum = Number.parseInt(Number.parseFloat(grapeSolarPanelsSqft) * Number.parseInt(numSolarPanelsRaw)); 
  var laAreaForSolarSqftString = thousandCommaSeparator(laAreaForSolarSqftNum );


  document.getElementById('solarPanelsSqft').innerHTML = thousandCommaSeparator(laAreaForSolarSqftNum); 



//Los Angeles City sqft source wikipedia. This only includes the land area. 
  var laAreaSqft =  Number.parseInt(1.307e+10);
  document.getElementById('laSqft').innerHTML = thousandCommaSeparator(laAreaSqft);
  console.log(typeof laAreaSqft + 'laAreaSqft' + laAreaSqft);
  console.log(typeof laAreaForSolarSqftNum + 'laAreaForSolarSqftNum' + laAreaForSolarSqftNum );

  var laAreaPercentForSolar = ((laAreaForSolarSqftNum / laAreaSqft) * 100).toFixed(2); 
  console.log(laAreaPercentForSolar);
  document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar + '%';

});




//Calculation Ideas: Grape Solar has a 390w panel with 15.21% efficiency and is made in the US.
//http://www.livescience.com/41747-best-solar-panels.html
//



    


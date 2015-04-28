//Current Weather API is giving weather per day or per month per year
//Current Electricty APIs for SF, LA and CHI are per year
//AJAX request

//Inspired by http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var zipWeather = new XMLHttpRequest();
zipWeather.open('GET', 'http://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=Los+Angeles&format=json&date=2009-12-23&key=5362d7ee160aa329b22c87b89aae8', true);
zipWeather.send(null);

zipWeather.addEventListener('load', function() {
//Hours Sun Visible ***NOT YET SHOWING SUN VISIBLE TIME FOR TODAY() AND CITY CHOSEN***
  var zipWeatherObj = JSON.parse(zipWeather.responseText);
  var zipWeatherDate = zipWeatherObj['data']['weather'][0]['date']; 
  var zipSunRise = zipWeatherObj['data']['weather'][0]['astronomy'][0]['sunrise']; 
  var zipSunSet = zipWeatherObj['data']['weather'][0]['astronomy'][0]['sunset']; 
  var sunriseDateTime = new Date(zipWeatherDate + ' ' + zipSunRise);
  var sunsetDateTime = new Date(zipWeatherDate + ' ' + zipSunSet);
  var sunriseDateHours = sunriseDateTime.getHours(); 
  var sunriseDateMinutes = sunriseDateTime.getMinutes(); 
  var sunsetDateHours = sunsetDateTime.getHours(); 
  var sunsetDateMinutes = sunsetDateTime.getMinutes(); 
  var sunVisibleTimeHours = (sunsetDateHours - sunriseDateHours);
  var sunVisibleTimeMinutes = (sunsetDateMinutes - sunriseDateMinutes);
  var sunVisibleTime = function() { 
    if(sunVisibleTimeMinutes < 0) {
      return ((sunVisibleTimeHours - 1).toString() + ' hours ' + (60 + sunVisibleTimeMinutes).toString() + ' minutes');
    } else {
      return  sunVisibleTimeHours.toString() + ' hours ' + sunVisibleTimeMinutes.toString() + ' minutes';
      }
   };
  document.getElementById('sunVisible').innerHTML = sunVisibleTime();
});


//GHI Data for Los Angeles
var ghi = new XMLHttpRequest();
ghi.open('GET', 'http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=DPx3KUp9krBKyHIiDqd1axWqETim9pYy3BwT6f5z&address=Los+Angeles', true);
ghi.send(null);

//Inspired by http://eloquentjavascript.net/17_http.html
var laZipElectricity = new XMLHttpRequest();
laZipElectricity.open('GET', 'https://data.lacity.org/api/views/rijp-9dwj/rows.json', true);
laZipElectricity.send(null);

ghi.addEventListener('load',  function() {
//ghIrradiance data object
  var ghIrradianceObj = JSON.parse(ghi.responseText);
  var ghIrradianceDailyAvg = ghIrradianceObj['outputs']['avg_ghi']['annual'];
  document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

//Los Angeles Electricity
  var laElectricityObj = JSON.parse(laZipElectricity.responseText);
  var laElectricityAnnualAvg = Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000) / 365.24);
  document.getElementById('laElectricityUsage').innerHTML = thousandCommaSeparator(laElectricityAnnualAvg);

//Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
//71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
//Solar Panels Needed
  var numSolarPanelsRaw = Number.parseInt(laElectricityAnnualAvg / (Number.parseFloat(ghIrradianceDailyAvg) * 0.390 * 0.711)); 
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

  var laAreaPercentForSolar = ((laAreaForSolarSqftNum / laAreaSqft) * 100).toFixed(2); 
  document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar + '%';

  var solarPanelsCost = 585 * numSolarPanelsRaw;
  document.getElementById('solarPanelTotalCost').innerHTML = '$' + thousandCommaSeparator(solarPanelsCost);

//Los Angeles average cost per kWh http://www.bls.gov/regions/west/news-release/averageenergyprices_losangeles.htm ***API DOES EXIST - CHECK IT OUT***
  var electricityCost = (0.215 * laElectricityAnnualAvg);
  document.getElementById('cityElectricityCost').innerHTML = '$' + thousandCommaSeparator(electricityCost);


//Number of years before you pay off Solar Panels
  var roiYearsPayOffSolar = (solarPanelsCost / (electricityCost * 365.24));
  document.getElementById('roiDays').innerHTML = (roiYearsPayOffSolar).toFixed(2);

//Population of City
  var laCityPop = 3884300;
  document.getElementById('cityPopulation').innerHTML = thousandCommaSeparator(laCityPop);

//Contribution per Citizen
  var perResidentContribution = (solarPanelsCost / laCityPop);
  document.getElementById('perResidentContribution').innerHTML = '$' + thousandCommaSeparator(perResidentContribution.toFixed(2)); 
});



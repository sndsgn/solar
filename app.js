//Current Weather API is giving weather per day or per month per year
//Current Electricty APIs for SF, LA and CHI are per year
//AJAX request

//Inspired by http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
var ghi = new XMLHttpRequest();

function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//GHI Data for Los Angeles
ghi.open('GET', 'http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=DPx3KUp9krBKyHIiDqd1axWqETim9pYy3BwT6f5z&address=Los+Angeles', true);
ghi.send();

//Inspired by http://eloquentjavascript.net/17_http.html
ghi.addEventListener('load',  function() {
  var laElectricityAnnual = new XMLHttpRequest();
  laElectricityAnnual.open('GET', 'https://data.lacity.org/api/views/rijp-9dwj/rows.json', true);
  laElectricityAnnual.send();
  laElectricityAnnual.addEventListener('load', function() {
    //ghIrradiance data object
    var ghIrradianceObj = JSON.parse(ghi.responseText);
    var ghIrradianceDailyAvg = ghIrradianceObj['outputs']['avg_ghi']['annual'];
    document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

    //Los Angeles Electricity
    var laElectricityObj = JSON.parse(laElectricityAnnual.responseText);
    var laElectricityAnnualAvg = Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000) / 365.24);
    document.getElementById('laElectricityUsage').innerHTML = thousandCommaSeparator(laElectricityAnnualAvg);

    //Solar Panels Needed
    //Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
    //71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
    var numSolarPanels= (laElectricityAnnualAvg / (ghIrradianceDailyAvg * 0.390 * 0.711)).toFixed(0); 
    document.getElementById('numSolarPanelsNeeded').innerHTML = thousandCommaSeparator(numSolarPanels); 

    //Area Need for Solar Panels in Sqft
    var grapeSolarPanelLengthIn = 77.2;
    var grapeSolarPanelWidthIn = 51.5;
    var grapeSolarPanelPrice = 585;
    var grapeSolarPanelsSqft = (grapeSolarPanelLengthIn/12) * (grapeSolarPanelWidthIn/12); 
    var laAreaForSolarSqftNum = (grapeSolarPanelsSqft * numSolarPanels); 
    document.getElementById('solarPanelsSqft').innerHTML = thousandCommaSeparator((laAreaForSolarSqftNum).toFixed(0)); 


    //Los Angeles City sqft source wikipedia. This only includes the land area. 
    var laAreaSqft =  Number(1.307e+10);
    document.getElementById('laSqft').innerHTML = thousandCommaSeparator(laAreaSqft);

    var laAreaPercentForSolar = ((laAreaForSolarSqftNum / laAreaSqft) * 100).toFixed(2); 
    document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar + '%';

    var solarPanelsCost = 585 * numSolarPanels;
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
  })
});



//Source: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//XHR Request for GHI Data for Los Angeles
//Source: http://developer.nrel.gov/docs/solar/solar-resource-v1/
//Data: The values returned are kWh/m2/day (kilowatt hours per square meter per day). Annual Average Daily. 
//Data source: http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=DPx3KUp9krBKyHIiDqd1axWqETim9pYy3BwT6f5z&address=Los    +Angeles ******************REMOVE KEY********
var ghi = new XMLHttpRequest();
ghi.open('GET', 'ghiLA.json', true);
ghi.send();

//Event listener for ghi XHR Request load and then proceeds with XHR request for LA Electricity Requirements.
//Help from http://eloquentjavascript.net/17_http.html
//Data source: https://data.lacity.org/api/views/rijp-9dwj/rows.json
ghi.addEventListener('load',  function() {
  var laElectricityAnnual = new XMLHttpRequest();
  laElectricityAnnual.open('GET', 'lacityelectricitydata.json', true);
  laElectricityAnnual.send();
  laElectricityAnnual.addEventListener('load', function() {
    //ghIrradiance JSON object
    
    var ghIrradianceObj = JSON.parse(ghi.responseText);

    //Annual daily average of GHI kWh
    var ghIrradianceDailyAvg = ghIrradianceObj['outputs']['avg_ghi']['annual'];
    document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

    //Los Angeles Electricity
    var laElectricityObj = JSON.parse(laElectricityAnnual.responseText);
    var laElectricityAnnualAvg = Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000) / 365.24);
    document.getElementById('laElectricityUsage').innerHTML = thousandCommaSeparator(laElectricityAnnualAvg);

    //Solar Panels Needed based on Grape Solar Panel 390 watt
    //Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
    //71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
    var numSolarPanels= (laElectricityAnnualAvg / (ghIrradianceDailyAvg * 0.390 * 0.711)).toFixed(0); 
    document.getElementById('numSolarPanelsNeeded').innerHTML = thousandCommaSeparator(numSolarPanels); 

    //Area needed for solar panels in sqft based on Grape Solar Panel 390 watt
    var grapeSolarPanelLengthIn = 77.2;
    var grapeSolarPanelWidthIn = 51.5;
    var grapeSolarPanelPrice = 585;
    var grapeSolarPanelsSqft = (grapeSolarPanelLengthIn/12) * (grapeSolarPanelWidthIn/12); 
    var laAreaForSolarSqftNum = (grapeSolarPanelsSqft * numSolarPanels); 
    document.getElementById('solarPanelsSqft').innerHTML = thousandCommaSeparator((laAreaForSolarSqftNum).toFixed(0)); 

    //Los Angeles City sqft source wikipedia. This only includes the land area of the city according to Wikipedia. 
    //http://en.wikipedia.org/wiki/Los_Angeles (469 land square miles)
    //Sqare miles to square feet conversion source: http://www.selectscg.com/customers/conversions/ConversionFormula.aspx (27889333.33333)
    var laAreaSqft = Math.round(469*27889333.33333);
    console.log(laAreaSqft);
    document.getElementById('laSqft').innerHTML = thousandCommaSeparator(laAreaSqft);

    //Percent of city area covered in solar panels
    var laAreaPercentForSolar = ((laAreaForSolarSqftNum / laAreaSqft) * 100).toFixed(2); 
    document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar + '%';

   //Gallons of water saved per year based on stats here for nuclear energy being 600 gallons per mWh http://cleantechnica.com/2014/03/22/solar-power-water-use-infographic/
    var waterSavedPerKwh = (600/1000) * laElectricityAnnualAvg;
    document.getElementById('waterSaved').innerHTML = thousandCommaSeparator(Math.round(waterSavedPerKwh));

    //Cost of solar panels needed to make the city sustainable
    var solarPanelsCost = 585 * numSolarPanels;
    document.getElementById('solarPanelTotalCost').innerHTML = '$' + thousandCommaSeparator(solarPanelsCost);

    //Los Angeles average cost per kWh http://www.bls.gov/regions/west/news-release/averageenergyprices_losangeles.htm ***API DOES EXIST - CHECK IT OUT***
    var electricityCostDaily = (0.215 * laElectricityAnnualAvg);
    document.getElementById('cityElectricityCostDaily').innerHTML = '$' + thousandCommaSeparator(electricityCostDaily);

    //Return on investment - Number of years before you pay off Solar Panels
    var roiYearsPayOffSolar = (solarPanelsCost / (electricityCostDaily * 365.24));
    document.getElementById('roiDays').innerHTML = (roiYearsPayOffSolar).toFixed(2);

    //Twenty year savings including degradation of panel output
    //Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
    var solarPanelDepreciation =  (Math.pow(1.0004, 20));
    var twentyNetYearSavings = ((((electricityCostDaily * 20) * (1 - (solarPanelDepreciation - 1))) * 365.24) - solarPanelsCost);

    document.getElementById('twentyNetYearSavings').innerHTML = '$' + thousandCommaSeparator(Math.round(twentyNetYearSavings));

    //Population of City
    var laCityPop = 3884300;
    document.getElementById('cityPopulation').innerHTML = thousandCommaSeparator(laCityPop);

    //Contribution per Citizen
    var perResidentContribution = (solarPanelsCost / laCityPop);
    document.getElementById('perResidentContribution').innerHTML = '$' + thousandCommaSeparator(perResidentContribution.toFixed(2)); 
  })
});



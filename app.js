//Source: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//XHR Request for GHI Data for Los Angeles
//Source: http://developer.nrel.gov/docs/solar/solar-resource-v1/
//Data: The values returned are kWh/m2/day (kilowatt hours per square meter per day). Annual Average Daily. 
//Data source: http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=DPx3KUp9krBKyHIiDqd1axWqETim9pYy3BwT6f5z&address=Los    +Angeles ******************REMOVE KEY********
var ghi = new XMLHttpRequest();
ghi.open('GET', 'data/kwh-ghi/2009_1998avgGHILA.json', true);
ghi.send();

//Event listener for ghi XHR Request load and then proceeds with XHR request for LA Electricity Requirements.
//Help from http://eloquentjavascript.net/17_http.html
//Data source: https://data.lacity.org/api/views/rijp-9dwj/rows.json
ghi.addEventListener('load',  function() {
  var laElectricityAnnual = new XMLHttpRequest();
  laElectricityAnnual.open('GET', 'data/kwh-consumption/2015_2003lacityelectricitydata.json', true);
  laElectricityAnnual.send();
  laElectricityAnnual.addEventListener('load', function() {
    //ghIrradiance JSON object
    
    var ghIrradianceObj = JSON.parse(ghi.responseText);

    //Annual daily average of GHI kWh
    var ghIrradianceDailyAvg = ghIrradianceObj['outputs']['avg_ghi']['annual'];
    document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

    //Days in a year
    var daysInYear = 365.24;

    //Los Angeles Electricity for 2012-2013 broken to into daily use
    var laElectricityObj = JSON.parse(laElectricityAnnual.responseText);
    var laElectricityYearlyAvg = Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000));
    var laElectricityDailyAvg = Math.round(laElectricityYearlyAvg / daysInYear);
    document.getElementById('laElectricityDailyUsage').innerHTML = thousandCommaSeparator(laElectricityDailyAvg);

    //Solar Panels Needed based on Grape Solar Panel 390 watt
    //Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
    //71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
    var numSolarPanels= (laElectricityDailyAvg / (ghIrradianceDailyAvg * 0.390 * 0.711)).toFixed(0); 
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
    document.getElementById('laSqft').innerHTML = thousandCommaSeparator(laAreaSqft);

    //Percent format function
    var percentFormat = function(num) {
      return ((num * 100).toFixed(2)) + '%';
    };

    //Percent of city area covered in solar panels
    var laAreaPercentForSolar = percentFormat(laAreaForSolarSqftNum / laAreaSqft); 
    document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar;

    //co2 production reduced per kWh
    //Source: http://www.eia.gov/tools/faqs/faq.cfm?id=74&t=11
    var lbsCo2PerKwh = 2.07;
    var tonsCo2PerKwh = lbsCo2PerKwh / 2000;
    var tonsCo2Reduced =  ((laElectricityYearlyAvg  * tonsCo2PerKwh).toFixed(0));
    document.getElementById('co2Reduced').innerHTML = thousandCommaSeparator(tonsCo2Reduced);

    //CO2 reduction as percent of California emmissions
    //Source: http://www.arb.ca.gov/cc/inventory/data/misc/ghg_inventory_trends_00-12_2014-05-13.pdf
    //Data from 2012 which since there is a small reduction every year this number is probably higher than today's annual emmissions
    var californiaCo2 = 458.7 * 1000000;
    var percentCo2OfCalifornia = tonsCo2Reduced / californiaCo2; 
    document.getElementById('percentCo2California').innerHTML = percentFormat(percentCo2OfCalifornia);  


   //Gallons of water saved per year based on stats here for nuclear energy being 600 gallons per mWh http://cleantechnica.com/2014/03/22/solar-power-water-use-infographic/
    var waterSavedPerKwh = (600/1000) * laElectricityYearlyAvg  ;
    document.getElementById('waterSaved').innerHTML = thousandCommaSeparator(Math.round(waterSavedPerKwh));

    //Cost of solar panels needed to make the city sustainable
    //Source for price per Grape Solar 390 watt panel: http://www.freecleansolar.com/390W-solar-panel-Grape-GS-S-390-TS-mono-p/gs-s-390-ts.htm?gclid=Cj0KEQjwyIyqBRD4janGs5e67IsBEiQAoF8DGtxLzucEC_zw3ED8ARPd3pIyd8wjR5V0w9Cj8bWJBq4aAtwI8P8HAQ
    var solarPanelsCost = grapeSolarPanelPrice * numSolarPanels;
    document.getElementById('solarPanelTotalCost').innerHTML = '$' + thousandCommaSeparator(solarPanelsCost);

    //Los Angeles average cost per kWh http://www.bls.gov/regions/west/news-release/averageenergyprices_losangeles.htm ***API DOES EXIST - CHECK IT OUT***
      var laElectricityCost = 0.215; 
      var laElectricityCostDaily = (laElectricityCost * laElectricityDailyAvg);
      document.getElementById('cityElectricityCostDaily').innerHTML = '$' + thousandCommaSeparator(laElectricityCostDaily);

      //Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
      //****pow function turning 1.0004 into 0.00039999999999995595 ****
      var solarDepreciationAvg =  function(years) {
          var i;
          var accumulator = 0;
          for(i = 1; i <= years; i +=1) {
            accumulator += ((Math.pow((1 + 0.004), i)) - 1);
          }
          return accumulator / years;
      };

      //Return on investment - Number of years before you pay off Solar Panels
      var roiYearsPayOffSolar = (solarPanelsCost / (laElectricityCostDaily * daysInYear) / (1 - solarDepreciationAvg(1)));
      document.getElementById('roiDays').innerHTML = (roiYearsPayOffSolar).toFixed(2);

      //Twenty year savings including degradation of panel output
      //Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
      var twentyNetYearSavings = ((((laElectricityCostDaily * 20) * (1 - solarDepreciationAvg(20))) * daysInYear) - solarPanelsCost);
      document.getElementById('twentyNetYearSavings').innerHTML = '$' + thousandCommaSeparator(Math.round(twentyNetYearSavings));

    //Population of City
    var laCityPop = 3884300;
    document.getElementById('cityPopulation').innerHTML = thousandCommaSeparator(laCityPop);

    //Contribution per Citizen
    var perResidentContribution = (solarPanelsCost / laCityPop);
    document.getElementById('perResidentContribution').innerHTML = '$' + thousandCommaSeparator(perResidentContribution.toFixed(2)); 


  });
});




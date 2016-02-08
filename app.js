//SOLAR
//@sndsgns
//Could Los Angeles generate its energy needs from solar panels?
//Extracting external data and calculating whether LA can run off of solar energy

//Function which formats numbers with thousand, milion, billion, etc. comma separators 
//Reference: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
var numCommaSep = function (num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

//Function declaration that creates an XHR Request
var createXHR = function (method, url) {
  var xhr  = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.send();
  return xhr; 
};

//Percent format function declaration
var percentFormat = function (num) {
  return ((num * 100).toFixed(2)) + '%';
};

//Days in a year
var daysInYear = 365.24;

//Function declaration that applies a function to a specific range of items in a list(object or array).
//The last two parameters allow you to specify a start and stop index within the list.
//If no start or stop are specified, the function will iterate over the entire list.
//This is similar to forEach or _.each functions with an option to specify the start and stop index
var forRange = function (list, func, start, stop) {
  var i;
  var key;
  var keySet = Object.keys(list);
  if(start === undefined) {
    start = 0;
  }
  if(stop === undefined) {
    stop = (list.length - 1);
  }
  if(Array.isArray(list)) {
    for(i = start; i <= stop; i += 1) {
      func(list[i]);
    }
  } else {
    for(key = start; key < keySet.length; key += 1) {
      func(list[keySet[key]]);
    }
  } 
};

//Pie chart data array declaration and assigment
var pieData = [];

//Initiates XHR Request for GHI Data for Los Angeles
//Data: The values returned are kWh/m2/day (kilowatt hours per square meter per day). Annual Average Daily 
//Data source: http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=KEY=Los+Angeles 
var ghi = createXHR('GET', 'data/kwh-ghi/2009_1998avgGHILA.json');

//Event listener for ghi XHR request load and then proceeds with XHR request for LA kWh use data
ghi.addEventListener('load', function() {
  //Create JSON formatted object from XHR request for LA's average GHI
  var ghiObj = JSON.parse(ghi.responseText);

  //Initiates XHR request for Los Angeles kWh usage data by zip code and year
  //Data source: https://data.lacity.org/api/views/rijp-9dwj/rows.json
  var laKwhAnnual = createXHR('GET', 'data/kwh-consumption/2015_2003lacityelectricitydata.json');
  laKwhAnnual.addEventListener('load', function() {

    //Declaration of and assignment to variable of annual daily average of GHI kWh for Los Angeles to variable
    var ghiDailyAvg = ghiObj['outputs']['avg_ghi']['annual'];
    document.getElementById('ghIrradiance').innerHTML = ghiDailyAvg;

    //Los Angeles electricity use for 2003-2010 (monthly average for the year) in million kWh
    //Declaration and assignment of JSON object from LA kWh use XHR request
    var laKwhObj = JSON.parse(laKwhAnnual.responseText);

    //Declaration of and assignment to variable with the yearly average kWh use value
    var laKwhYearlyAvg = Math.round((laKwhObj.meta.view.columns[15].cachedContents.sum * 1000000));
    //Declaration of and assignment to variable with daily Los Angeles kWh avearge use
    var laKwhDailyAvg = Math.round(laKwhYearlyAvg / daysInYear);
    document.getElementById('laKwhDailyUsage').innerHTML = numCommaSep(laKwhDailyAvg);

    //Cleans source JSON object with LA kWh use data, declares and assigns new object with each zip having its kWh usage organized by year and adds a property 'average' of all years for that zip.
    var laDataArr = laKwhObj.data;
    var laDataKwhExtractObj = function (arr) {
      var zipKwhObj = {};
      forRange(arr, function(item) {
        var subObj = JSON.parse(item[16][0]); 
        var subObjZip = subObj['zip'];
        zipKwhObj[subObjZip] = {};
        var startYear = 2003;
        var sum = 0;
        forRange(item, function(element) {
          zipKwhObj[subObjZip][startYear] = (element*1000000);
          startYear += 1;
          sum += Number(element);
        }, 8, 15);
        var keyCount = (Object.keys(zipKwhObj[subObjZip])).length;
        zipKwhObj[subObjZip]['average'] = ((Math.round(sum / keyCount)*1000000));  
      }, 0, 124);
      return zipKwhObj;
    };

    //Declares and assigns cleaned LA kWh data with kWh usage per year per zip code to a new object
    var laZipKwhObjClean = laDataKwhExtractObj(laDataArr);

    //Function declaration that returns an array with the cleaned object data sortedLaKwhArr in descending order by average kWh instead of by zip 
    //Referenced: http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value

    var sortKwhAvg = function (obj) {
      var sortedArr = [];
      var item;
      for(item in obj) {
        sortedArr.push([item, obj[item]['average']]);
      }
      sortedArr.sort(function(a,b) { return b[1] - a[1];});
      return sortedArr;
    };

    var sortedLaKwhArr = sortKwhAvg(laZipKwhObjClean);

    //Function declaration that populates pieData with the zip and  average zip kWh consumption
    var pushDataPie = function (arr, chartArr) {
      var i = 35;
      forRange(arr, function(item) {
        var formattedKwh = ((item[1])/1000000000); 
        i = i + 0.25;
        chartArr.push({
          value: formattedKwh,
          color: 'hsla(' + (i) + ',100%,38%,0.94)',
          highlight: 'hsla(219,100%,26%,0.97)',
          label: 'Zip / Postal Code - ' + item[0] + ' Annual Electricity Consumption (GWh)'  
        });
      });
    };
    pushDataPie(sortedLaKwhArr, pieData);

    //Solar Panels Needed based on Grape Solar Panel 390 watt
    //Grape Solar Panel (GSP) 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
    var gspKwhOutput = (390 / 1000);
    //71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
    var solarPanelEfficiency = 0.711;
    var numSolarPanels= Math.round(laKwhDailyAvg / (ghiDailyAvg * gspKwhOutput * solarPanelEfficiency)); 
    document.getElementById('numSolarPanelsNeeded').innerHTML = numCommaSep(numSolarPanels); 

    //Area needed for solar panels in sqft based on Grape Solar Panel(GSP) 390 watt
    //GSP dimensions in inches
    var gspLengthIn = 77.2;
    var gspWidthIn = 51.5;
    //GSP price in USD ($)
    var gspPrice = 585;
    //GSP dimensions converted to sqft
    var gspSqft = (gspLengthIn/12) * (gspWidthIn/12); 
    //Number of solar panels needs multiplied by the GSP area to determine total area needed for solar panels in LA city
    var laAreaForSolarSqftNum = (gspSqft * numSolarPanels); 
    document.getElementById('solarPanelsSqft').innerHTML = numCommaSep((laAreaForSolarSqftNum).toFixed(0)); 

    //Cost of solar panels needed to make the city sustainable
    //Source for price per Grape Solar 390 watt panel: http://www.freecleansolar.com/390W-solar-panel-Grape-GS-S-390-TS-mono-p/gs-s-390-ts.htm?gclid=Cj0KEQjwyIyqBRD4janGs5e67IsBEiQAoF8DGtxLzucEC_zw3ED8ARPd3pIyd8wjR5V0w9Cj8bWJBq4aAtwI8P8HAQ
    var solarPanelsCost = gspPrice * numSolarPanels;
    document.getElementById('solarPanelTotalCost').innerHTML = '$' + numCommaSep(solarPanelsCost);

    //Los Angeles City area converted to sqft. This only includes the land area of the city according to Wikipedia. 
    //Data Source: http://en.wikipedia.org/wiki/Los_Angeles (469 land square miles)
    //Sqare miles to square feet conversion source: http://www.selectscg.com/customers/conversions/ConversionFormula.aspx (27889333.33333)
    var laAreaSqft = Math.round(469*27889333.33333);
    document.getElementById('laSqft').innerHTML = numCommaSep(laAreaSqft);

    //Percent of city area covered in solar panels
    var laAreaPercentForSolar = percentFormat(laAreaForSolarSqftNum / laAreaSqft); 
    document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar;

    //CO2 production reduced per kWh
    //Data Source: http://www.eia.gov/tools/faqs/faq.cfm?id=74&t=11
    var lbsCo2PerKwh = 2.07;
    //Conversion of CO2 per lbs to per ton
    var tonsCo2PerKwh = lbsCo2PerKwh / 2000;
    //Calculation of how much CO2 is reduced from the solar panels use opposed to coal
    //This does not take into account that a portion of California's energy is from Nuclear, Solar and other means
    //***REVISE ?? FOR PORTION OF ENERGY PRODUCED FROM COAL???***
    var tonsCo2Reduced =  Math.round((laKwhYearlyAvg  * tonsCo2PerKwh));
    document.getElementById('co2Reduced').innerHTML = numCommaSep(tonsCo2Reduced);

    //CO2 reduction as percent of total California CO2 emmissions
    //Data Source: http://www.arb.ca.gov/cc/inventory/data/misc/ghg_inventory_trends_00-12_2014-05-13.pdf
    //CO2 Data from 2012 in millions of tons - since there is a small CO2 reduction every year the number used is probably higher than today's annual emmissions
    var californiaCo2 = 458.7 * 1000000;
    var percentCo2OfCalifornia = tonsCo2Reduced / californiaCo2; 
    document.getElementById('percentCo2California').innerHTML = percentFormat(percentCo2OfCalifornia);  

    //Gallons of water saved per year based on stats here for nuclear and coal energy being ~600 gallons per MWh http://cleantechnica.com/2014/03/22/solar-power-water-use-infographic/
    //Conversion and calculation of gallons saved per kWh for Los Angeles
    //***IS THIS ALL FRESH WATER??? CONFIRM ***//
    var waterSavedTotal = (600/1000) * laKwhYearlyAvg;
    document.getElementById('waterSaved').innerHTML = numCommaSep(Math.round(waterSavedTotal));

    //Los Angeles average daily cost for kWh used http://www.bls.gov/regions/west/news-release/averageenergyprices_losangeles.htm ***API DOES EXIST - CHECK IT OUT AND USE IT WHEN MAKING SITE MODULAR FOR ANY CITY, COUNTY OR ZIP***
    var laKwhCost = 0.215; 
    var laKwhCostDaily = (laKwhCost * laKwhDailyAvg);
    document.getElementById('cityKwhCostDaily').innerHTML = '$' + numCommaSep(laKwhCostDaily);

    //Function declaration that returns the depreciation of solar panels over the number years provided
    //Data Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx 
    var solarDepreciationAvg = function (years) {
      var i;
      var accumulator = 0;
      for(i = 1; i <= years; i +=1) {
        accumulator += ((Math.pow((1 + 0.004), i)) - 1);
      }
      return accumulator / years;
    };

    //Return on investment - Number of years before you pay off Solar Panels
    var roiYearsPayOffSolar = (solarPanelsCost / (laKwhCostDaily * daysInYear) / (1 - solarDepreciationAvg(1)));
    document.getElementById('roiDays').innerHTML = (roiYearsPayOffSolar).toFixed(2);

    //Twenty year savings including degradation of panel output
    //Data Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
    var twentyNetYearSavings = ((((laKwhCostDaily * 20) * (1 - solarDepreciationAvg(20))) * daysInYear) - solarPanelsCost);
    document.getElementById('twentyNetYearSavings').innerHTML = '$' + numCommaSep(Math.round(twentyNetYearSavings));

    //Population of Los Angeles City
    //Data Source: http://en.wikipedia.org/wiki/Los_Angeles
    var laCityPop = 3884307;
    document.getElementById('cityPopulation').innerHTML = numCommaSep(laCityPop);

    //Average contribution per LA resident needed to cover the cost of the solar panels
    var perResContrib = (solarPanelsCost / laCityPop);
    document.getElementById('perResContrib').innerHTML = '$' + numCommaSep(perResContrib.toFixed(2)); 

    //California Electricity Consumption 2014
    //Data Source: http://www.eia.gov/electricity/state/
    var caKwhAnnualUse = 259538038*1000;
    //Los Angeles' Percent of California electricity use
    var percentCAKwhCalc = (laKwhYearlyAvg/caKwhAnnualUse);  
//    document.getElementById('percentCAKwh').innerHTML = percentFormat(percentCAKwhCalc);

    //Water savings percent based on daily consumption in 2014 of average daily resident in Los Angeles http://www.latimes.com/local/california/la-me-adv-water-use-compared-20150413-story.html 131 gallons per day per capita
    var waterSavingsPercent = (waterSavedTotal / (131* laCityPop * 365));
    /*!
     * Chart.js
     * http://chartjs.org/
     *
     * Copyright 2013 Nick Downie
     * Released under the MIT license
     * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
     */

    //Pie chart with all Los Angeles zip code kWh usage
    //The below code generates the pie chart visualization using the Chart.js library
    window.onload = function(){
      var ctx = document.getElementById('chart-area').getContext('2d');
      window.myPie = new Chart(ctx).Pie(pieData, {
        responsive : true,
        animationSteps: 90,
        animateScale: true,
        percentageInnerCutout : 0,
        segmentShowStroke : true,
        segmentStrokeColor : '#fff',
        segmentStrokeWidth : 2,
        animation : true,
        animationEasing : 'easeOutBounce',
        animateRotate : true,
        animateScale : false,
        labelFontFamily : 'Arial',
        labelFontStyle : 'normal',
        labelFontSize : 84,
        labelFontColor : '#666' 
      });
    };
  });
});


//Using AirBNB JS Style Guidlines
//Source: https://github.com/airbnb/javascript
"use strict";
//Source: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function thousandCommaSeparator(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Create XHR Request
function createXHR(method, url) {
  const xhr  = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.send();
    return xhr; 
};

//California Electricity Consumption 2014
//
const caKwhAnnualUse = 259538038*1000;

//A function that applies a function to a specific range of items in a list
function forRange(list, func, start, stop) {
  let i;
  let key;
  const keySet = Object.keys(list);
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
    for(key = start; key <= keySet.length; key += 1) {
      func(list[keySet[key]]);
    }
  } 
}

//Reduce function
function reduce(list, func, initial) {
  let current = initial;
  let i;
  let key;
  if(Array.isArray(list)) {
    for(i = start; i < list.length; i += 1) {
      current = func(current, list[i]);
    }
  } else {
    for(key in list) {
      current = func(current, list[key]);
    }
  } 
  return current;
};

//XHR Request for GHI Data for Los Angeles
//Source: http://developer.nrel.gov/docs/solar/solar-resource-v1/
//Data: The values returned are kWh/m2/day (kilowatt hours per square meter per day). Annual Average Daily. 
//Data source: http://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=KEY???=Los+Angeles 

//Creation of doughnut chart data array
const doughnutData = [];

  const ghi = createXHR('GET', 'data/kwh-ghi/2009_1998avgGHILA.json');
  ghi.addEventListener('load', function() {
    const ghiObj = JSON.parse(ghi.responseText);

  //Event listener for ghi XHR Request load and then proceeds with XHR request for LA Electricity Requirements.
  //Help from http://eloquentjavascript.net/17_http.html
  //Data source: https://data.lacity.org/api/views/rijp-9dwj/rows.json
  const laElectricityAnnual = createXHR('GET', 'data/kwh-consumption/2015_2003lacityelectricitydata.json');
  laElectricityAnnual.addEventListener('load', function() {

    //Annual daily average of GHI kWh
    const ghIrradianceDailyAvg = ghiObj['outputs']['avg_ghi']['annual'];
    document.getElementById('ghIrradiance').innerHTML = ghIrradianceDailyAvg;

    //Percent format function
    function percentFormat(num) {
      return ((num * 100).toFixed(2)) + '%';
    };

    //Days in a year
    const daysInYear = 365.24;

    //Los Angeles Electricity for 2012-2013 broken to into daily use
    const laElectricityObj = JSON.parse(laElectricityAnnual.responseText);
    const laElectricityYearlyAvg = Math.round((laElectricityObj.meta.view.columns[15].cachedContents.sum * 1000000));
    const percentCAKwhCalc = (laElectricityYearlyAvg/caKwhAnnualUse);  
    document.getElementById('percentCAKwh').innerHTML = percentFormat(percentCAKwhCalc);
    const laElectricityDailyAvg = Math.round(laElectricityYearlyAvg / daysInYear);
    document.getElementById('laElectricityDailyUsage').innerHTML = thousandCommaSeparator(laElectricityDailyAvg);

    //Populate the chart with the different zip code's energy daily consumption
    const laDataArr = laElectricityObj.data;
    function laDataKwhExtractObj(arr) {
      const zipKwhObj = {};
      forRange(arr, function(item) {
        const subObj = JSON.parse(item[16][0]); 
        const subObjZip = subObj["zip"];
        zipKwhObj[subObjZip] = {};
        let startYear = 2003;
        let sum = 0;
        forRange(item, function(element) {
          zipKwhObj[subObjZip][startYear] = (element*1000000);
          startYear += 1;
          sum += Number(element);
        }, 8, 15);
        const keyCount = (Object.keys(zipKwhObj[subObjZip])).length;
        zipKwhObj[subObjZip]["average"] = ((Math.round(sum / keyCount)*1000000));  
      }, 0, 124);
      return zipKwhObj;

      //Original Chart Populate Function
      /*var zipKwhObj = {};
        var i;
        var j;
        for(i = 0; i <= 124; i += 1) {
        var subObj = JSON.parse(arr[i][16][0]); 
        var subObjZip = subObj["zip"];
        zipKwhObj[subObjZip] = {};
        var startYear = 2003;
        var sum = 0;
        for(j = 8; j <= 15; j += 1, startYear += 1) {
        zipKwhObj[subObjZip][startYear] = ((arr[i][j])*1000000);
        sum += Number(arr[i][j]);
        }
        var keyCount = (Object.keys(zipKwhObj[subObjZip])).length;
        zipKwhObj[subObjZip]["average"] = ((Math.round(sum / keyCount)*1000000));  
        }
        return zipKwhObj;
        */
    };

    //Assign cleaned LA kWh data to new object
    const laZipKwhObjClean = laDataKwhExtractObj(laDataArr);

    //Sorts cleaned data by average kWh instead of zip
    //Referenced: http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
    function sortKwhAvg(obj) {
      let i;
      let sortedArr = [];
      for(i in obj) {
        sortedArr.push([i,obj[i]['average']]);
      }
      sortedArr.sort(function(a,b) { return b[1] - a[1];});
      return sortedArr;
    };
    const sorted = sortKwhAvg(laZipKwhObjClean);


    //Function that populate doughnutData with average zip kWh consumption

    function pushDataDoughnut(arr, chartArr) {
      let arrInd;
      let i = 35;
      for(arrInd in arr) {
        const formattedKwh = ((arr[arrInd][1])/1000000000); 
        i = i + 0.25;
        chartArr.push({
          value: formattedKwh,
          color: 'hsla(' + (i) + ',100%,38%,0.94)',
          highlight: "hsla(219,100%,26%,0.97)",
          label: 'Zip / Postal Code - ' + arr[arrInd][0] + ' Annual Electricity Consumption (GWh)'  
        });
      }
    };
    pushDataDoughnut(sorted, doughnutData);
     
    //Solar Panels Needed based on Grape Solar Panel 390 watt
    //Grape Solar Panel 390w 15.21% Efficiency http://solar-panels-review.toptenreviews.com/grape-solar-390w-review.html?cmpid=ttr-ls
    //71.1% efficiency for fixed position solar panels: http://www.solarpaneltilt.com/
    const numSolarPanels= (laElectricityDailyAvg / (ghIrradianceDailyAvg * 0.390 * 0.711)).toFixed(0); 
    document.getElementById('numSolarPanelsNeeded').innerHTML = thousandCommaSeparator(numSolarPanels); 

    //Area needed for solar panels in sqft based on Grape Solar Panel 390 watt
    const grapeSolarPanelLengthIn = 77.2;
    const grapeSolarPanelWidthIn = 51.5;
    const grapeSolarPanelPrice = 585;
    const grapeSolarPanelsSqft = (grapeSolarPanelLengthIn/12) * (grapeSolarPanelWidthIn/12); 
    const laAreaForSolarSqftNum = (grapeSolarPanelsSqft * numSolarPanels); 
    document.getElementById('solarPanelsSqft').innerHTML = thousandCommaSeparator((laAreaForSolarSqftNum).toFixed(0)); 

    //Los Angeles City sqft source wikipedia. This only includes the land area of the city according to Wikipedia. 
    //http://en.wikipedia.org/wiki/Los_Angeles (469 land square miles)
    //Sqare miles to square feet conversion source: http://www.selectscg.com/customers/conversions/ConversionFormula.aspx (27889333.33333)
    const laAreaSqft = Math.round(469*27889333.33333);
    document.getElementById('laSqft').innerHTML = thousandCommaSeparator(laAreaSqft);

    //Percent of city area covered in solar panels
    const laAreaPercentForSolar = percentFormat(laAreaForSolarSqftNum / laAreaSqft); 
    document.getElementById('laAreaPercentForSolar').innerHTML = laAreaPercentForSolar;

    //co2 production reduced per kWh
    //Source: http://www.eia.gov/tools/faqs/faq.cfm?id=74&t=11
    const lbsCo2PerKwh = 2.07;
    const tonsCo2PerKwh = lbsCo2PerKwh / 2000;
    const tonsCo2Reduced =  ((laElectricityYearlyAvg  * tonsCo2PerKwh).toFixed(0));
    document.getElementById('co2Reduced').innerHTML = thousandCommaSeparator(tonsCo2Reduced);

    //CO2 reduction as percent of California emmissions
    //Source: http://www.arb.ca.gov/cc/inventory/data/misc/ghg_inventory_trends_00-12_2014-05-13.pdf
    //Data from 2012 which since there is a small reduction every year this number is probably higher than today's annual emmissions
    const californiaCo2 = 458.7 * 1000000;
    const percentCo2OfCalifornia = tonsCo2Reduced / californiaCo2; 
    document.getElementById('percentCo2California').innerHTML = percentFormat(percentCo2OfCalifornia);  


    //Gallons of water saved per year based on stats here for nuclear energy being 600 gallons per mWh http://cleantechnica.com/2014/03/22/solar-power-water-use-infographic/
    const waterSavedPerKwh = (600/1000) * laElectricityYearlyAvg  ;
    document.getElementById('waterSaved').innerHTML = thousandCommaSeparator(Math.round(waterSavedPerKwh));

    //Cost of solar panels needed to make the city sustainable
    //Source for price per Grape Solar 390 watt panel: http://www.freecleansolar.com/390W-solar-panel-Grape-GS-S-390-TS-mono-p/gs-s-390-ts.htm?gclid=Cj0KEQjwyIyqBRD4janGs5e67IsBEiQAoF8DGtxLzucEC_zw3ED8ARPd3pIyd8wjR5V0w9Cj8bWJBq4aAtwI8P8HAQ
    const solarPanelsCost = grapeSolarPanelPrice * numSolarPanels;
    document.getElementById('solarPanelTotalCost').innerHTML = '$' + thousandCommaSeparator(solarPanelsCost);

    //Los Angeles average cost per kWh http://www.bls.gov/regions/west/news-release/averageenergyprices_losangeles.htm ***API DOES EXIST - CHECK IT OUT***
    const laElectricityCost = 0.215; 
    const laElectricityCostDaily = (laElectricityCost * laElectricityDailyAvg);
    document.getElementById('cityElectricityCostDaily').innerHTML = '$' + thousandCommaSeparator(laElectricityCostDaily);

    //Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
    //****pow function turning 1.0004 into 0.00039999999999995595 ****
    function solarDepreciationAvg(years) {
      let i;
      let accumulator = 0;
      for(i = 1; i <= years; i +=1) {
        accumulator += ((Math.pow((1 + 0.004), i)) - 1);
      }
      return accumulator / years;
    };

    //Return on investment - Number of years before you pay off Solar Panels
    const roiYearsPayOffSolar = (solarPanelsCost / (laElectricityCostDaily * daysInYear) / (1 - solarDepreciationAvg(1)));
    document.getElementById('roiDays').innerHTML = (roiYearsPayOffSolar).toFixed(2);

    //Twenty year savings including degradation of panel output
    //Source: http://www.engineering.com/ElectronicsDesign/ElectronicsDesignArticles/ArticleID/7475/What-Is-the-Lifespan-of-a-Solar-Panel.aspx
    const twentyNetYearSavings = ((((laElectricityCostDaily * 20) * (1 - solarDepreciationAvg(20))) * daysInYear) - solarPanelsCost);
    document.getElementById('twentyNetYearSavings').innerHTML = '$' + thousandCommaSeparator(Math.round(twentyNetYearSavings));

    //Population of City
    const laCityPop = 3884300;
    document.getElementById('cityPopulation').innerHTML = thousandCommaSeparator(laCityPop);

    //Contribution per Citizen
    const perResidentContribution = (solarPanelsCost / laCityPop);
    document.getElementById('perResidentContribution').innerHTML = '$' + thousandCommaSeparator(perResidentContribution.toFixed(2)); 
  });
});

/*!
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

window.onload = function(){
  const ctx = document.getElementById("chart-area").getContext("2d");
  window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {
    responsive : true,
    animationSteps: 90,
    animateScale: true,
    percentageInnerCutout : 70,
    segmentShowStroke : true,
    segmentStrokeColor : "#fff",
    segmentStrokeWidth : 2,
    animation : true,
    animationEasing : "easeOutBounce",
    animateRotate : true,
    animateScale : false,
    labelFontFamily : "Arial",
    labelFontStyle : "normal",
    labelFontSize : 84,
    labelFontColor : "#666" 
});
};



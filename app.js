
var request = require('request')
var sortJSONArray = require('sort-json-array')
var fs = require('fs')
var jsonFile = require('jsonfile')

//Delete the result.json file if it pre-exists
if(fs.existsSync('result.json'))
    fs.unlinkSync('result.json');

var result;             //used to hold the main url results
var sortedResult;       //used to hold the sorted results

var constructedJSON = {
        "date": null,
        "price": null,
        "priceChange": null,
        "change": null,
        "dayOfWeek": null,
        "highSinceStart": null,
        "lowSinceStart": null
}

var getURL = {
    method: 'GET',
    url: 'https://www.bitmex.com/api/v1/instrument/compositeIndex?symbol=.XBT&filter=%7B%22timestamp.time%22%3A%2210%3A55%3A00%22%2C%22reference%22%3A%22BSTP%22%7D&count=100&reverse=true',
    headers: {
        Accept: 'application/json'
    },
    json: true
};

var getWeekDay = function(timestamp){
    var d = new Date(timestamp);
    var dayNumber = d.getDay();

    if (dayNumber == 0) return "Sunday";
    if (dayNumber == 1) return "Monday";
    if (dayNumber == 2) return "Tuesday";
    if (dayNumber == 3) return "Wednesday";
    if (dayNumber == 4) return "Thursday";
    if (dayNumber == 5) return "Friday";
    if (dayNumber == 6) return "Saturday";

}

var isHighSinceStart = function(index){
    var count = index-1;
    while( count >= 1){
        if( sortedResult[count].lastPrice > sortedResult[index].lastPrice )
            return false;
        count--;
    }

    return true;
}

var isLowSinceStart = function(index){
    var count = index-1;
    while( count >= 1){
        if( sortedResult[count].lastPrice < sortedResult[index].lastPrice )
            return false;
        count--;
    }

    return true;
}

request(getURL, function(error,response,body){
    if (error) throw new Error(error);

    resultBody = response.body;
    sortedResult = sortJSONArray(resultBody,'timestamp');
    
        constructedJSON.date = sortedResult[0].timestamp;
        constructedJSON.price = sortedResult[0].lastPrice;
        constructedJSON.priceChange = 'na';
        constructedJSON.change = 'na';
        constructedJSON.dayOfWeek = getWeekDay(sortedResult[0].timestamp);
        constructedJSON.highSinceStart = 'na';
        constructedJSON.lowSinceStart = 'na';
        jsonFile.writeFileSync('result.json',constructedJSON,{spaces: 2, EOL: '\r\n',flag: 'a'})

        for( var i = 0 , j = 1; i < sortedResult.length - 1 , j < sortedResult.length ; i++,j++ ){
            if( sortedResult[i].lastPrice < sortedResult[j].lastPrice )
            {
                constructedJSON.date = sortedResult[j].timestamp;
                constructedJSON.price = sortedResult[j].lastPrice;
                constructedJSON.priceChange = 'up';
                constructedJSON.change = sortedResult[j].lastPrice - sortedResult[i].lastPrice;
                constructedJSON.dayOfWeek = getWeekDay(sortedResult[j].timestamp);
                constructedJSON.highSinceStart = isHighSinceStart(j);
                constructedJSON.lowSinceStart = isLowSinceStart(j);
                jsonFile.writeFileSync('result.json',constructedJSON,{spaces: 2, EOL: '\r\n',flag: 'a'})

            }
            
            if( sortedResult[i].lastPrice > sortedResult[j].lastPrice )
            {
                constructedJSON.date = sortedResult[j].timestamp;
                constructedJSON.price = sortedResult[j].lastPrice;
                constructedJSON.priceChange = 'down';
                constructedJSON.change = sortedResult[i].lastPrice - sortedResult[j].lastPrice;
                constructedJSON.dayOfWeek = getWeekDay(sortedResult[j].timestamp);
                constructedJSON.highSinceStart = isHighSinceStart(j);
                constructedJSON.lowSinceStart = isLowSinceStart(j);
                jsonFile.writeFileSync('result.json',constructedJSON,{spaces: 2, EOL: '\r\n',flag: 'a'})

            }
            
            if( sortedResult[i].lastPrice == sortedResult[j].lastPrice )
            {
                constructedJSON.date = sortedResult[j].timestamp;
                constructedJSON.price = sortedResult[j].lastPrice;
                constructedJSON.priceChange = 'same';
                constructedJSON.change = 0;
                constructedJSON.dayOfWeek = getWeekDay(sortedResult[j].timestamp);
                constructedJSON.highSinceStart = isHighSinceStart(j);
                constructedJSON.lowSinceStart = isLowSinceStart(j);
                jsonFile.writeFileSync('result.json',constructedJSON,{spaces: 2, EOL: '\r\n',flag: 'a'})

            }
        }

      console.log('Result written to result.json file');
});



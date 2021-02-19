
var request = require('request')
var sortJSONArray = require('sort-json-array')
var fs = require('fs')
var jsonFile = require('jsonfile')

//Delete the result.json file if it pre-exists
if (fs.existsSync('result.json'))
    fs.unlinkSync('result.json');

var sortedResult;       //used to hold the sorted results

var constructedJSON = {
    "date": null,
    "price": null,
    "priceChange": null,
    "changeDelta": null,
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

var getWeekDay = function (timestamp) {
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

var isHighSinceStart = function (index) {
    var count = index - 1;
    while (count >= 1) {
        if (sortedResult[count].lastPrice > sortedResult[index].lastPrice)
            return false;
        count--;
    }

    return true;
}

var isLowSinceStart = function (index) {
    var count = index - 1;
    while (count >= 1) {
        if (sortedResult[count].lastPrice < sortedResult[index].lastPrice)
            return false;
        count--;
    }

    return true;
}

var buildEntity = function (previousObject, currentObject, priceChange, isHighSinceStart, isLowSinceStart) {
    constructedJSON.date = currentObject.timestamp;
    constructedJSON.price = currentObject.lastPrice;
    constructedJSON.priceChange = priceChange;
    var changeDelta = currentObject.lastPrice - previousObject.lastPrice;
    if (changeDelta > 0) {
        priceChange = "up";
    }
    if (changeDelta < 0) {
        priceChange = "down";
    }
    if (changeDelta == 0) {
        priceChange = "same";
    }
    constructedJSON.changeDelta = changeDelta;
    constructedJSON.priceChange = priceChange;
    constructedJSON.dayOfWeek = getWeekDay(currentObject.timestamp);
    jsonFile.writeFileSync('result.json', constructedJSON, { spaces: 2, EOL: '\r\n', flag: 'a' })
}

request(getURL, function (error, response, body) {
    if (error) throw new Error(error);

    resultBody = response.body;
    // Sorting the json based on the timestamp
    sortedResult = sortJSONArray(resultBody, 'timestamp');

    for (var prev = 0, curr = 1; prev < sortedResult.length - 1, curr < sortedResult.length; prev++, curr++) {
        buildEntity(
            sortedResult[prev],
            sortedResult[curr],
            isHighSinceStart(curr),
            isLowSinceStart(curr)
        );
    }

    console.log('Result written to result.json file');
});





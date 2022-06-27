import SunCalc from "./suncalc.js"

export function calcAzimuth(date, lat, lng, month, hour) {
    let date2 = new Date(date)
    date2.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    date2.setMonth(month - 1)
    let pos = SunCalc.getPosition(date2, lat, lng)
    return pos.azimuth + Math.PI
}

// https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone
export function changeTimezone(date, ianatz) {
    // suppose the date is 12:00 UTC
    var invdate = new Date(
        date.toLocaleString("en-US", {
            timeZone: ianatz,
        }),
    )

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime()

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff) // needs to substract
}

export function timezoneDiff(ianatz) {
    var date = new Date()
    var invdate = new Date(
        date.toLocaleString("en-US", {
            timeZone: ianatz,
        }),
    )

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    return (date.getTime() - invdate.getTime()) / 60 / 60 / 1000
}

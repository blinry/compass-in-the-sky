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

export async function newQuiz(lat, lng) {
    let size = 0.01
    let lat1 = Number(lat - size).toFixed(3)
    let lng1 = Number(lng - size).toFixed(3)
    let lat2 = Number(lat + size).toFixed(3)
    let lng2 = Number(lng + size).toFixed(3)

    console.log(lat1)

    let response = await fetch(
        `https://graph.mapillary.com/images?access_token=MLY|7569500839758282|7b3b3eced40c887cc2867488d6a50220&fields=id,captured_at,compass_angle,computed_compass_angle,geometry,computed_geometry,thumb_1024_url&bbox=${lng1},${lat1},${lng2},${lat2}&limit=1`,
    )
    let json = response.json()

    console.log(json)

    let entry = json.data[0]

    let quiz = {}

    quiz.date = new Date(parseInt(entry["captured_at"]))
    quiz.lat = entry["computed_geometry"]["coordinates"][1]
    quiz.lng = entry["computed_geometry"]["coordinates"][0]

    quiz.image = entry["thumb_1024_url"]
    quiz.northAngle = (-entry["computed_compass_angle"] / 360.0) * 2 * Math.PI

    //date = new Date()
    //date.toLocaleString("en-US", {timeZone: timezoneString})
    //date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    //date.setMonth(month - 1)

    quiz.sunAngle = SunCalc.getPosition(quiz.date, lat, lng).azimuth

    console.log(quiz)

    return quiz
}

export const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]

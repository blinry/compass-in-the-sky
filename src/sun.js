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
        })
    )

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    var diff = date.getTime() - invdate.getTime()

    // so 12:00 in Toronto is 17:00 UTC
    return new Date(date.getTime() - diff) // needs to substract
}

export function timezoneDiff(ianatz, date) {
    var invdate = new Date(
        date.toLocaleString("en-US", {
            timeZone: ianatz,
        })
    )

    // then invdate will be 07:00 in Toronto
    // and the diff is 5 hours
    return (date.getTime() - invdate.getTime()) / 60.0 / 60.0 / 1000.0
}

let lastLat = 0
let lastLng = 0
let lastDate = 0
let cachedEntries = []
export async function newQuiz(lat, lng, date = undefined) {
    if (
        lat !== lastLat ||
        lng !== lastLng ||
        date !== lastDate ||
        cachedEntries.length == 0
    ) {
        // We need to send a new query.
        lastLat = lat
        lastLng = lng
        lastDate = date

        let jitter = 0
        lat += jitter * (Math.random() - 0.5)
        lng += jitter * (Math.random() - 0.5)
        let size = 0.5
        let lat1 = Number(lat - size).toFixed(3)
        let lng1 = Number(lng - size).toFixed(3)
        let lat2 = Number(lat + size).toFixed(3)
        let lng2 = Number(lng + size).toFixed(3)

        const url = `https://graph.mapillary.com/images?access_token=MLY|7569500839758282|7b3b3eced40c887cc2867488d6a50220&fields=id,captured_at,compass_angle,computed_compass_angle,geometry,computed_geometry,thumb_1024_url,camera_type&bbox=${lng1},${lat1},${lng2},${lat2}&limit=30`

        try {
            var response = await fetch(url)
        } catch (e) {
            alert(e)
        }
        let json = await response.json()

        if (json.data.length == 0) {
            alert(
                "We couldn't find any Mapillary photos for your location. Please pick another area. Sorry about that!"
            )
            cachedEntries = []
            return undefined
        }

        // Remove 360 degree photos.
        cachedEntries = json.data.filter((entry) => {
            return entry.camera_type === "perspective"
        })

        if (typeof date === "undefined") {
            // We can pick a random one, leave as-is.
        } else {
            cachedEntries = cachedEntries.filter((entry) => {
                // Make sure that captured_at is no more than a specified number days away from date.
                const maxDayDiff = 45
                let diff = Math.abs(
                    new Date(entry.captured_at).getTime() - date.getTime()
                )
                let dayDiff = diff / 1000 / 60 / 60 / 24
                return dayDiff % 365 < maxDayDiff
            })
            if (cachedEntries.length == 0) {
                alert(
                    "We couldn't find any Mapillary photos for your location. Please pick another area. Sorry about that!"
                )
                cachedEntries = []
                return undefined
            }
        }
    }

    let entry = cachedEntries[Math.floor(Math.random() * cachedEntries.length)]
    cachedEntries = cachedEntries.filter((e) => e != entry)

    let quiz = {}

    quiz.date = new Date(parseInt(entry["captured_at"]))
    quiz.lat = entry["computed_geometry"]["coordinates"][1]
    quiz.lng = entry["computed_geometry"]["coordinates"][0]

    quiz.image = entry["thumb_1024_url"]
    quiz.northAngle = (-entry["computed_compass_angle"] / 360.0) * 2 * Math.PI
    quiz.otherNorthAngle = (-entry["compass_angle"] / 360.0) * 2 * Math.PI

    //date = new Date()
    //date.toLocaleString("en-US", {timeZone: timezoneString})
    //date.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    //date.setMonth(month - 1)

    quiz.sunAngle =
        SunCalc.getPosition(quiz.date, lat, lng).azimuth +
        Math.PI +
        quiz.northAngle

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

export function yearPercentageToDate(yearPercentage) {
    const currentYear = new Date().getFullYear()
    const secondsInCurrentYear =
        (new Date(currentYear + 1, 0, 1) - new Date(currentYear, 0, 1)) / 1000
    let seconds = yearPercentage * secondsInCurrentYear
    let newDate = new Date(currentYear, 0, 1)
    newDate.setSeconds(seconds)
    return newDate
}

export function dateToYearPercentage(date) {
    const year = date.getFullYear()
    const secondsInYear =
        (new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / 1000
    let seconds = (date - new Date(year, 0, 1)) / 1000
    return seconds / secondsInYear
}

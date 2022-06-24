import SunCalc from "suncalc"

export function calcAzimuth(date, lat, lng, month, hour) {
    let date2 = new Date(date)
    date2.setHours(Math.floor(hour), (hour % 1) * 60, 0)
    date2.setMonth(month - 1)
    let pos = SunCalc.getPosition(date2, lat, lng)
    return pos.azimuth + Math.PI
}

const global={
    //app di agile
    app: null,

    // Italiano:1, Inglese:2, Spagnolo:3
    language: null,

    sleep : time => new Promise(r => setTimeout(r, time))
}
module.exports = {global};
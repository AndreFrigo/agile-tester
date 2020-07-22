const {utils} = require("../utils.js");
const { expect } = require("chai");
const { Application } = require("spectron");
const {info} = require("../set-before-test")
var robot = null

describe("Test agile mode", function(){
    const preview = new Application({
        path: "C:\\Program Files (x86)\\Praim\\Agile\\Agile\\Agile.exe",
        args: ["windowed"]
    });

    this.timeout(100000)

    beforeEach(async function(){
        await preview.start()
        if(info.os == "w"){
            robot = require("robotjs")
            await utils.sleep(1000)
            // minimizza il terminale vuoto
            await robot.keyToggle("space", "down", ["alt"])
            await robot.keyTap("n")
            await utils.sleep(500)
            await robot.keyToggle("space", "up", ["alt"])
        }
    }) 

    afterEach(async function(){
        await preview.stop()
    })

    it("tests", async () => {
        
    })

    
})
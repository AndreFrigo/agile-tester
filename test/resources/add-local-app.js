const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Add a local resource tests", function(){

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("connections", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"URL\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":true,\"server\":false,\"options\":{\"url\":\"https://prova.it\",\"kiosk\":false,\"fullscreen\":false,\"browser\":\"iexplore\"},\"id\":\"afe39343-6643-49a5-a684-572ead42d3ee\"}]")
        await utils.start()
    }) 
    
    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    //Array di String che rappresentano applicazioni nella stessa cartella di Agile 
    const rightValues = ["AgileRad"]
    rightValues.forEach(element => {
        it("should return true if a local resource has been added", async () => {
            expect(await utils.resources.addLocal(element)).to.be.true
        })

        it("should return true if the resource has been added and success notification appeared", async () => {
            var add = null
            var notification = null
            add = await utils.resources.addLocal(element)
            await utils.sleep(500)
            notification = await utils.checkSuccessNotification()
            expect(add && notification).to.be.true
        })
        
    });

    const wrongValues = ["wrong"]
    wrongValues.forEach(element => {
        it("should return null if there is not any app with the given name", async () => {
            expect(await utils.resources.addLocal(element)).to.be.null
        })
    })
})
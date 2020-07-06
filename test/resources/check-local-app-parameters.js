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
        db.conn.set("connections", "[]")
        await utils.start()
    }) 
    
    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    //Array di String che rappresentano applicazioni nella stessa cartella di Agile 
    const rightValues = [
        {name: "AgileRad", info: "AgileRad"}
    ]
    rightValues.forEach(element => {
        // it("should return true if a local application has been added", async () => {
        //     expect(await utils.resources.addLocalApplication(element.name, element.info)).to.be.true
        // })

        // it("should return true if the application has been added and success notification appeared", async () => {
        //     var add = null
        //     var notification = null
        //     add = await utils.resources.addLocalApplication(element.name, element.info)
        //     await utils.sleep(500)
        //     notification = await utils.checkSuccessNotification()
        //     expect(add && notification).to.be.true
        // })

        it("should return true if the application has been added and is now in the Agile list, and success notification appeared", async () => {
            var add = null
            var notification = null
            var check = null
            add = await utils.resources.addLocalApplication(element.name, element.info)
            await utils.sleep(500)
            notification = await utils.checkSuccessNotification()
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(5, element.name)
            console.log("add: "+add+", check: "+check+", notification: "+notification)
            expect(add && notification && check).to.be.true
        })
        
    });

    const wrongValues = [
        {name: "any", info: "wrong"}
    ]
    wrongValues.forEach(element => {
        it("should return false if there is not any application to add with the given name", async () => {
            expect(await utils.resources.addLocalApplication(element.name, element.info)).to.be.false
        })
    })
})
const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("add microsoft resource parameters test", function(){

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

    const rightValues = [
        {name: "test", info: "xxx"}
    ]

    rightValues.forEach(elem => {
        it("should return true if the resource has been added", async () => {
            expect(await utils.resources.addMicrosoft(elem.name, elem.info)).to.be.true
        })

        it("should return true if the resource has been added and is now in the Agile list", async () => {
            var add = null
            var check = null
            add = await utils.resources.addMicrosoft(elem.name, elem.info)
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(2, elem.name, elem.info)
            expect(add && check).to.be.true
        })

        it("should return true if the resource has been added and success notification appeared", async () => {
            var add = null
            var notification = null
            add = await utils.resources.addMicrosoft(elem.name, elem.info)
            await utils.sleep(500)
            notification = await utils.checkSuccessNotification()
            expect(add && notification).to.be.true
        })

        it("should return true if the resource has been added and is now in the Agile list, and success notification appeared", async () => {
            var add = null
            var notification = null
            var check = null
            add = await utils.resources.addMicrosoft(elem.name, elem.info)
            await utils.sleep(500)
            notification = await utils.checkSuccessNotification()
            await utils.sleep(500)
            check = await utils.resources.isInAgileList(2, elem.name, elem.info)
            expect(add && notification && check).to.be.true
        })
    })

    const wrongValues = [
        {name: "test", info: "wrong_info"}
    ]

    wrongValues.forEach(elem => {
        it("should return false if some data are not correct", async () => {
            expect(await utils.resources.addMicrosoft(elem.name, elem.info)).to.be.false
        })
    })

})
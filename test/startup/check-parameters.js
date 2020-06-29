const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check startup parameters", function () {

    this.timeout(30000)

    before(async function(){
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_autorun", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
    })

    beforeEach(async function(){
        //cambia database locale
        db.conn.select(1)
        db.conn.set("config_autorun","[]")
        db.conn.select(0)
        db.conn.set("info_autorun", "[]")
        await global.app.start()
    }) 

    afterEach(async function(){
        db.conn.select(0)
        db.conn.set("info_autorun", localDB)
        db.conn.select(1)
        db.conn.set("config_autorun", localDB)
        await global.app.stop()
    })



    const wrongValues = [
        {name: "", command: ""},
        {name: "aaaa", command: ""},
        {name: "", command: "aaaa"}
    ]

    wrongValues.forEach(elem => {
        it("should return null if some parameters were wrong", async () => {
            expect(await utils.addStartup(elem.name, elem.command)).to.be.null
        })
    })

    const rightValues = [
        {name: "test_startup", command: "command_startup"}
    ]

    rightValues.forEach(elem => {
        it("should return not null if the startup was added successfully", async () => {
            expect(await utils.addStartup(elem.name, elem.command)).to.be.not.null
        })
        

        it("should return true if the startup was added and the notification appeared", async () => {
            var notification = null
            const res = await utils.addStartup(elem.name, elem.command)
            await utils.sleep(1000)
            if(res == null) console.log("res null")
            try{
                //titolo del pop-up
                notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
            }catch{
                notification = null
            }
            //aggiorna lingua
            global.language = await db.dbLanguage()
            var succ = null
            switch(global.language){
                case 1: {
                    succ = "Successo"
                    break
                }
                case 2: {
                    succ = "Success"
                    break
                }
                case 3: {
                    succ = "Exito"
                    break
                }
            }
            expect(res != null && notification == succ).to.be.true
        })
    })

})
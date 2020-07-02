const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check startup database", function(){

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
        db.conn.set("config_autorun","[{\"name\":\"test_startup\",\"command\":\"test_startup_cmd\",\"status\":true,\"statusagilemode\":false}]")
        db.conn.select(0)
        db.conn.set("info_autorun", "[{\"name\":\"test_startup\",\"command\":\"test_startup_cmd\",\"status\":true,\"statusagilemode\":false}]")
        await utils.start()
    }) 

    afterEach(async function(){
        db.conn.select(0)
        db.conn.set("info_autorun", localDB)
        db.conn.select(1)
        db.conn.set("config_autorun", localDB)
        await global.app.stop()
    })

    it("should return true if the startup is in the database", async () => {
        var found = false
        const startup = await db.getStartup("test_startup")
        if(startup && startup.command == "test_startup_cmd"){
            found = true
        }
        expect(found).to.be.true
    })

    it("should return false if it tries to add a startup with the same name", async () => {
        expect(await utils.startup.addStartup("test_startup", "anything")).to.be.false
    })

    it("should return true if the startup is in the Agile list", async() => {
        //va in startup
        const menu = global.app.client.$("#menu-link-7");
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        const length = await db.getStartupListLength();
        var found = false;
        var n = null;
        var c = null;
        for(i = 0; i < length; i++){
            const base = "#connection"+i+" > div > div.autorun-item-properties > div.autorun-item-properties-wrapper";
            try{
                n = await global.app.client.$(base + " > div").getText();
                c = await global.app.client.$(base + " > p > span").getText();
            }catch{
            } 
            if(n == "test_startup" && c == "test_startup_cmd"){
                found = true;
            }
        }
        expect(found).to.be.true
    })
})
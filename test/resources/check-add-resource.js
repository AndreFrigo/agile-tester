const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check if a resource created is available", function(){

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
        await global.app.start()
        //cambia database locale
        db.conn.set("connections", "[{\"name\":\"test\",\"type\":\"URL\",\"autostart\":false,\"onExitAction\":\"\",\"passthrough\":false,\"local\":true,\"server\":false,\"options\":{\"url\":\"https://prova.it\",\"kiosk\":false,\"fullscreen\":false,\"browser\":\"iexplore\"},\"id\":\"afe39343-6643-49a5-a684-572ead42d3ee\"}]")
    }) 

    afterEach(async function(){
        db.conn.set("connections", localDB)
        await global.app.stop()
    })

    it("should return true if the resource is in the database", async () => {
        var found = false
        const resource = await db.getResourceFromName("test");
        if(resource && resource.options.url == "https://prova.it"){
            found = true
        }
        expect(found).to.be.true
    })


    it("should return false if it tries to add a resource with the same name", async () => {
        expect(await utils.resources.addResource("test", "https://prova.it")).to.be.false
    })


    it("should return true if the resource is in the Agile list", async() => {
        //va in risorse
        const menu = global.app.client.$("#menu-link-6");
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        const length = await db.getResourceListLength();
        var found = false;
        var n = null;
        var u = null;
        for(i = 0; i < length; i++){
            const base = "#connection"+i+" > div > div.connection-item-properties > div";
            try{
                n = await global.app.client.$(base + " > div").getText();
                u = await global.app.client.$(base + " > p > span").getText();
            }catch{
            } 
            if(n == "agile_local "+ "test" && u == "subdirectory_arrow_right" + "https://prova.it"){
                found = true;
            }
        }
        expect(found).to.be.true
    })


})
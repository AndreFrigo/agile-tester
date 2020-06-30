const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null


describe("Delete resource tests", function(){

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

    it("should return true if a resource is deleted", async () => {
        expect(await utils.resources.deleteResource("test")).to.be.true
    })

    it("should return null if it tries to delete a resource that does not exists", async () => {
        expect(await utils.resources.deleteResource("wrong_name")).to.be.null
    })

    it("should return true if a resource is deleted and is not in the database anymore", async () => {
        var del = null
        var check = null
        del = await utils.resources.deleteResource("test")
        await utils.sleep(1000)
        check = await db.getResourceFromName("test")
        expect(del && check == null).to.be.true
    })

    it("should return true if a resource is deleted and is not in the list anymore", async () => {
        var del = null
        var found = false;
        del = await utils.resources.deleteResource("test")
        await utils.sleep(1000)
        //va in risorse
        const menu = global.app.client.$("#menu-link-6");
        var click = null;
        try{
            click = await menu.click();
        }catch{
            found = null
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        const length = await db.getResourceListLength();
        var n = null;
        for(i = 0; i < length; i++){
            const base = "#connection"+i+" > div > div.connection-item-properties > div";
            try{
                n = await global.app.client.$(base + " > div").getText();
            }catch{
                found = null
            } 
            if(n == "agile_local "+ "test"){
                found = true;
            }
        }
        expect(del && found == false).to.be.true
    })

    it("should return true if a resource is deleted and the success notification appeared", async () => {
        var del = null
        var notification = null;

        del = await utils.resources.deleteResource("test")
        
        await utils.sleep(1000)

        notification = await utils.checkSuccessNotification()
        expect(del && notification).to.be.true
    })
})
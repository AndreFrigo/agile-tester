const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")


var localDB = null

describe("Test delete local browser", function(){

    this.timeout(100000)

    before(async function(){
        //salva database locale
        localDB = await new Promise(function(resolve, reject){
            agileService.getConnections(null, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
    })

    beforeEach(async function(){
        //cambia database locale
        await new Promise(function(resolve, reject){
            agileService.setConnections([
                {
                  name: 'test',
                  type: 'URL',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: true,
                  server: false,
                  options: {
                    url: 'https://prova.it',
                    kiosk: false,
                    fullscreen: false,
                    browser: 'iexplore'
                  },
                  id: 'afe39343-6643-49a5-a684-572ead42d3ee'
                }
              ]
              , (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await utils.start()
    }) 

    afterEach(async function(){
        await new Promise(function(resolve, reject){
            agileService.setConnections(localDB, (err,res) => {
                if (err) reject(err)
                resolve(res)
            })
        })
        await global.app.stop()
    })

    it("should return true if a resource is deleted", async () => {
        expect(await utils.resources.deleteResource("test")).to.be.true
    })

    it("should return false if it tries to delete a resource that does not exist", async () => {
        expect(await utils.resources.deleteResource("wrong_name")).to.be.false
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
        await utils.sleep(500)
        found = await utils.resources.isInAgileList(4, "test")
        expect(del && found == false).to.be.true
    })

    if(info.os == "w"){
        it("should return true if a resource is deleted and the success notification appeared", async () => {
            var del = null
            var notification = null;
    
            del = await utils.resources.deleteResource("test")
            
            await utils.sleep(1000)
    
            notification = await utils.checkNotification("success")
            expect(del && notification).to.be.true
        })
    }
})
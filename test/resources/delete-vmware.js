const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
const { info } = require("../set-before-test.js");
const agileService = require("agile-os-interface")

var localDB = null

describe("delete VMware resource tests", function(){

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
                  type: 'VMWARE',
                  autostart: false,
                  onExitAction: '',
                  passthrough: false,
                  local: false,
                  server: true,
                  options: {
                    url: 'test.com',
                    allow_unauthorized: false,
                    domain: '',
                    hideDomain: false,
                    exclude: [Object]
                  },
                  id: '066366b2-804c-4eb5-b0f5-699c8ef66a4d'
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
        found = await utils.resources.isInAgileList(3, "test")
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
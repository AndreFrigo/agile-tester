const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check if a device saved is available", function () {
    
    this.timeout(30000)

    before(async function(){
        await global.app.start()
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_usb_lock", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
        //cambia database locale
        db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[{\"vid\":\"9999\",\"pid\":\"9999\"}]}")
    }) 

    after(async function(){
        db.conn.set("config_usb_lock", localDB)
        await global.app.stop()
    })

    it("should return not null if the device is already in the db list", async () => {
        var device = null;
        device = await db.getDeviceLock(9999,9999)
        expect(device).to.not.be.null;
    })

    it("should return true if the device is in the agile list", async () => {
        //apre device lock menu
        const menu = global.app.client.$('#menu-link-11');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1500);


        const length = await db.getDeviceLockListLength();
        const base = "#main-div > div.main-content > main > section > div.section-wrapper.with-header.scrollable > div > div"
        var found = false;
        var vidPid = null;
        for(i = 1; i <= length; i++){
            try{
                vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
            }catch{
                
            }
            if(vidPid == "Vid: " + 9999 + ", Pid: " + 9999){
                found = true;
            }
        }
        expect(found).to.be.true
    })

    it("should return null if it tries to add a device with same vid and pid", async () => {
        expect(await utils.addRule(9999,9999)).to.be.null
    })
})
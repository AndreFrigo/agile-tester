const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");
var localDB = null

describe("Check add usb redirection rule", function(){

    this.timeout(30000)

    before(async function(){
        await global.app.start()
        //salva database locale
        db.conn.select(1)
        localDB = await new Promise(function (resolve, reject){
            db.conn.get("config_citrix", function(err, res){
                if(err) reject(err)
                resolve(res)
            });
        })
        //cambia database locale
        db.conn.set("config_citrix", "{\"usb_redirection\":{\"auto_redirect_on_start\":true,\"auto_redirect_on_plug\":false,\"rules\":[{\"type\":\"ALLOW\",\"vid\":\"1234\",\"pid\":\"1234\",\"class\":\"\",\"subclass\":\"\",\"prot\":\"\",\"description\":\"prova_usb\",\"split\":false,\"interfaces\":[]}],\"default\":\"ALLOW\"}}")
    }) 

    after(async function(){
        db.conn.set("config_citrix", localDB)
        await global.app.stop()
    })

    it("should return true if the rule is in the database", async () => {
        const usb = await db.getUSBFromVidPid(1234,1234)
        expect(usb != null && usb.description == "prova_usb").to.be.true
    })

    it("should return true if the rule is in the Agile list", async () => {

        //apre menu usb redirection
        const menu = global.app.client.$('#menu-link-10');
        var click = null;
        try{
            click = await menu.click();
        }catch{
            assert.ok(false, "Impossible to find the usb redirection menù")
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //numero di address agile 
        const length = await db.getUSBRedirectionListLength();

        //indica se ho trovato un'address con quell'hostname
        var found = null;
        var d = null;
        var vidPid = null;

        for(i = 1; i <= length; i++){
            try{
                d = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                vidPid = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
            }catch{
            }
            if(d == "prova_usb" && vidPid == "Vid: "+ 1234 + ", Pid: " + 1234){
                found = true;
            }
        } 
        expect(found).to.be.true
    })

    it("should return false if it tries to add a rule with same vid and pid of another rule", async () => {
        expect(await utils.usbRedirection.addRule("any", 1234, 1234)).to.be.false
    })

})
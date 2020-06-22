const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');

function addRule(vid, pid){
    //Aggiunge una nuova regola per il blocco di un device
    describe("Add a device lock new rule", function(){

        //controlla che non ci sia già il device nella lista dal db
        it("Check if the device is already in the list of locked devices", async () => {
            const device = await db.getDeviceLock(vid,pid);
            assert.ok(device==null, "The device is already in the db list!")
        })

        //va nella sezione device lock
        it("Navigates to Device Lock", async () => {
            const click = await global.app.client.click('#menu-link-11');
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the device lock menù");
        })

        //Preme sul link add rule
        it("Click on add rule", async () => {
            const click = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a").click();
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while clicking on add rule");
        })

        //inserisce il vid 
        it("Insert vid", async () => {
            const v = global.app.client.$("#vid");
            v.click();
            v.setValue(vid);
            v.getValue().then(function(val){
                assert.equal(val, vid, "error while inserting vid");
            })
        })
    
        //inserisce il pid 
        it("Insert pid", async () => {
            const p = global.app.client.$("#pid");
            p.click();
            p.setValue(pid);
            p.getValue().then(function(v){
                assert.equal(v, pid, "error while inserting pid");
            })
        })

        //Conferma premendo su ok 
        it("Create the new rule", async () => {
            const click = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)").click();
            assert.ok(click, "Error while clicking to ok to confirm the creation of the role");
        })


        //Controlla che sia presente nel db
        it("Check if the device is in the db", async () => {
            const device = await db.getDeviceLock(vid, pid);
            assert.ok(device, "The device with the given vid and pid is not in the db")
        })

        //Controlla che sia nella lista di agile
        it("Check if the device is in the agile list", async () => {
            const length = await db.getDeviceLockListLength();
            const base = "#main-div > div.main-content > main > section > div.section-wrapper.with-header.scrollable > div > div"
            var found = false;
            for(i = 1; i <= length; i++){
                const vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                if(vidPid == "Vid: " + vid + ", Pid: " + pid){
                    found = true;
                }
            }
            assert.ok(found, "The resource is not in the agile list")
        })

    })
}

module.exports = {
    addRule: addRule
}
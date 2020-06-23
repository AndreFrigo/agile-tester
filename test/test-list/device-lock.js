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
            const menu = global.app.client.$('#menu-link-11');
            var click = null;
            try{
                click = await menu.click();
            }catch{
                assert.ok(false, "Impossible to find the device lock link")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while opening the device lock menù");
        })

        //Preme sul link add rule
        it("Click on add rule", async () => {
            const button = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
            var click = null;
            try{
                click = await button.click();
            }catch{
                assert.ok(false, "Impossible to find the add rule link")
            }
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while clicking on add rule");
        })

        //inserisce il vid 
        it("Insert vid", async () => {
            const v = global.app.client.$("#vid");
            try{
                v.click();
                var x = await v.setValue(vid);
                while(!x){
                    
                }
            }catch{
                assert.ok(false, "Impossible to find vid field")
            }
            v.getValue().then(function(val){
                assert.equal(val, vid, "error while inserting vid");
            })
        })
    
        //inserisce il pid 
        it("Insert pid", async () => {
            const v = global.app.client.$("#pid");
            try{
                v.click();
                var x = await v.setValue(pid);
                while(!x){
                    
                }
            }catch{
                assert.ok(false, "Impossible to find pid field")
            }
            v.getValue().then(function(val){
                assert.equal(val, vid, "error while inserting vid");
            })
        })

        //Conferma premendo su ok 
        it("Create the new rule", async () => {
            const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)");
            var click = null;
            try{
                click = await ok.click();
            }catch{
                assert.ok(false, "Impossible to find ok button")
            }
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
            var vidPid = null;
            for(i = 1; i <= length; i++){
                try{
                    vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                }catch{
                    assert.ok(false, "Impossible to find the list elements")
                }
                if(vidPid == "Vid: " + vid + ", Pid: " + pid){
                    found = true;
                }
            }
            assert.ok(found, "The resource is not in the agile list")
        })

    })
}

module.exports = {
    addRule
}
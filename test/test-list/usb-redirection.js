const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');


//TODO: da decidere come valutare errori, per esempio input vid e pid devono essere numeri di 4 cifre

function addUsbRedirection(description, vid, pid){
    describe("Add USB redirection rule", function(){

        //Controlla che non ci sia già una regola con vid e pid stabiliti
        it("Check if there is already a rule with the given vid and pid in the db", async () => {
            const usb = await db.getUSBFromVidPid(vid, pid);
            assert.ok(usb == null, "there is already a rule with the given vid and pid");
        })
    
        //Apre menù USB Redirection
        it("Navigates to USB Redirection ", async () => {
            const click = await global.app.client.click('#menu-link-10');
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "Error while opening the usb redirection menù");
        })
    
        //Clicca nel link Add redirection rule
        it("Click on Add redirection rule", async () => {
            const click = await global.app.client.click("#citrix > div > div > div > a");
            global.app.client.waitUntilWindowLoaded();
            assert.ok(click, "error while clicking the botton");
        })
    
        //inserisce la descrizione da agileUSB
        it("Insert description", async () => {
            const d = global.app.client.$("#description");
            d.click();
            d.setValue(description);
            d.getValue().then(function(v){
                assert.equal(v, description, "error while inserting the description");
            })
        })
    
        //inserisce il vid da agileUSB
        it("Insert vid", async () => {
            const v = global.app.client.$("#vid");
            v.click();
            v.setValue(vid);
            v.getValue().then(function(val){
                assert.equal(val, vid, "error while inserting vid");
            })
        })
    
        //inserisce il pid da agileUSB
        it("Insert pid", async () => {
            const p = global.app.client.$("#pid");
            p.click();
            p.setValue(pid);
            p.getValue().then(function(v){
                assert.equal(v, pid, "error while inserting pid");
            })
        })
    
        //preme ok creando così la nuova regola
        it("Create the rule", async () => {
            const ok = global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
            const click = await ok.click();
            assert.ok(click, "error while clicking the button");
        })
    
        //controlla che la regola sia ora presente nel db
        it("Check if the rule with the given data is now in the db", async () => {
            const usb = await db.getUSBFromVidPid(vid, pid);
            if(usb.description == description){
                assert.ok(true);
            }else assert.ok(false, "the new rule is not been inserted in the db");
        })
    
        //controlla che la regola sia presente nella lista di agile 
        it("Check if the new rule is in the list of agile", async () => {
            //numero di address agile 
            const length = await db.getUSBRedirectionListLength();
    
            //indica se ho trovato un'address con quell'hostname
            var found = null;
            var d = null;
            var vidPid = null;
    
            for(i = 1; i <= length; i++){
                d = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
                vidPid = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
                if(d == description && vidPid == "Vid: "+ vid + ", Pid: " + pid){
                    found = true;
                }
            } 
            assert.ok(found, "the element is not in the list")
        })
    })    
}

module.exports = {
    addUsbRedirection: addUsbRedirection
}

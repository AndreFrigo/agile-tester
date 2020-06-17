const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');


//TODO: da decidere come valutare errori, per esempio input vid e pid devono essere numeri di 4 cifre

describe("Add USB redirection rule", function(){

    //Controlla che non ci sia già una regola con vid e pid stabiliti
    it("Check if there is already a rule with the given vid and pid in the db", async () => {
        const usb = await db.getUSBFromVidPid(global.agileUSB.vid, global.agileUSB.pid);
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
        const description = global.app.client.$("#description");
        description.click();
        description.setValue(global.agileUSB.description);
        description.getValue().then(function(v){
            assert.equal(v, global.agileUSB.description, "error while inserting the description");
        })
    })

    //inserisce il vid da agileUSB
    it("Insert vid", async () => {
        const vid = global.app.client.$("#vid");
        vid.click();
        vid.setValue(global.agileUSB.vid);
        vid.getValue().then(function(v){
            assert.equal(v, global.agileUSB.vid, "error while inserting vid");
        })
    })

    //inserisce il pid da agileUSB
    it("Insert pid", async () => {
        const pid = global.app.client.$("#pid");
        pid.click();
        pid.setValue(global.agileUSB.pid);
        pid.getValue().then(function(v){
            assert.equal(v, global.agileUSB.pid, "error while inserting pid");
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
        const usb = await db.getUSBFromVidPid(global.agileUSB.vid, global.agileUSB.pid);
        if(usb.description == global.agileUSB.description){
            assert.ok(true);
        }else assert.ok(false, "the new rule is not been inserted in the db");
    })

    //controlla che la regola sia presente nella lista di agile 
    it("Check if the new rule is in the list of agile", async () => {
        //numero di address agile 
        const length = await db.getUSBRedirectionListLength();

        //indica se ho trovato un'address con quell'hostname
        var found = null;
        var description = null;
        var vidPid = null;

        for(i = 1; i <= length; i++){
            description = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
            vidPid = await global.app.client.$("#citrix > div > div.usbredir-list > div > div:nth-child("+i+") > div > div.usbredir-item-properties > div > p > span").getText();
            if(description == global.agileUSB.description && vidPid == "Vid: "+global.agileUSB.vid+", Pid: "+global.agileUSB.pid){
                found = true;
            }
        } 
        assert.ok(found, "the element is not in the list")
    })

})

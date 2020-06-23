const {db} = require ("../db.js");
const {global} = require ("../global.js");
var assert = require('assert');
const should = require('should');
const { expect } = require("chai");

//funzione per testare 
const addrule = async function (vid, pid, control){
    const text = (control == "to.be.null") ? "should return null if the rule can't be confirmed" : "should return not null if the rule has been confirmed"
    it(text, async () => {
        const menu = global.app.client.$('#menu-link-11');
        var click = null;
        try{
            click = await menu.click();
            while(!click){
                
            }
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await global.sleep(1500);
        

        click = null;                    
        const button = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();

        await global.sleep(1000)
        

        var v = global.app.client.$("#vid");
        try{
            v.click();
            var x = await v.setValue(vid);
            while(!x){
                
            }
        }catch{
        }

        await global.sleep(1000)

        v = global.app.client.$("#pid");
        try{
            v.click();
            var x = await v.setValue(pid);
            while(!x){
                
            }
        }catch{
        }

        await global.sleep(1000)

        const ok = global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(1)")
        click = null;
        try{
            click = await ok.click()
        }catch{
            click = null;
        }
        if(click == null){
            //premi su annulla
            try{
                await global.app.client.$("#add-usb-rule-modal > div > div.modal-footer > div > a:nth-child(2)").click()
            }catch{
                
            }
        }
        if(control == "to.be.null"){
            expect(click).to.be.null
        }else if(control == "to.not.be.null"){
            expect(click).to.not.be.null
        }
        
    })
}

function addRule(){
    //Aggiunge una nuova regola per il blocco di un device
    describe("Add a device lock new rule", function(){

        describe("Database tests", function(){
            before(async function(){    
                //Aggiungi un device con stessi vid e pid nel db
                db.conn.select(1)
                db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[{\"vid\":\""+vid+"\",\"pid\":\""+pid+"\"}]}")
            })

            after(async function(){    
                //Aggiungi un device con stessi vid e pid nel db
                db.conn.select(1)
                db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[]}")
            })
    
    
            it("should return false if the device is already in the db list", async () => {
                var device = null;
                device = await db.getDeviceLock(vid,pid)
                expect(device).to.not.be.null;
            })
        })

        
        describe("Device Lock tests", function(){
            this.timeout(30000);
            //pid e vid con cui provare il test should return false if the rule can't be confirmed
            const wrongValues = [
                {v:0, p:0},
                {v:1234, p:0}, 
                {v:1234, p:123}, 
                {v:1234, p:12345}, 
                {v:123, p:1234}, 
                {v:123, p:12}, 
                {v:12, p:1234}, 
                {v:"12a", p:1234}, 
                {v:"", p:1234},
                {v:"123", p:1234},
                {v:"abcd", p:"abdc"},
                {v:"aaaa", p:1234},
                {v:"", p:"abcde"},
                {v:"aaaaaaa", p:1234},
                {v:"aaaa", p:12374}
            ]
            wrongValues.forEach(elem => {
                addrule(elem.v, elem.p, "to.be.null")

            })

            const rightValues = [
                {v:1234, p:1234},
                {v:8705, p:2640}
            ]
            rightValues.forEach(elem => {
                addrule(elem.v, elem.p, "to.not.be.null")
            })
        })


        // //Controlla che sia presente nel db
        // it("Check if the device is in the db", async () => {
        //     const device = await db.getDeviceLock(vid, pid);
        //     assert.ok(device, "The device with the given vid and pid is not in the db")
        // })

        // //Controlla che sia nella lista di agile
        // it("Check if the device is in the agile list", async () => {
        //     const length = await db.getDeviceLockListLength();
        //     const base = "#main-div > div.main-content > main > section > div.section-wrapper.with-header.scrollable > div > div"
        //     var found = false;
        //     var vidPid = null;
        //     for(i = 1; i <= length; i++){
        //         try{
        //             vidPid = await global.app.client.$(base + " > div:nth-child("+i+") > div > div.usbredir-item-properties > div > div").getText();
        //         }catch{
        //             assert.ok(false, "Impossible to find the list elements")
        //         }
        //         if(vidPid == "Vid: " + vid + ", Pid: " + pid){
        //             found = true;
        //         }
        //     }
        //     assert.ok(found, "The resource is not in the agile list")
        // })

    })
}

module.exports = {
    addRule
}
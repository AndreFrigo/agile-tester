const {db} = require ("../db.js");
const {global} = require ("../global.js");
const {utils} = require("../utils.js");
const { expect } = require("chai");

//funzione per testare, crea una nuova regola con i parametri dati, se non riesce a confermare annulla
const addrule = async function (vid, pid){

    const menu = global.app.client.$('#menu-link-11');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1500);
    

    click = null;                    
    const addRule = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > a");
    try{
        click = await addRule.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await utils.sleep(1000)
    

    var v = global.app.client.$("#vid");
    try{
        v.click();
        var x = await v.setValue(vid);
        while(!x){
            
        }
    }catch{
    }


    await utils.sleep(1000)


    v = global.app.client.$("#pid");
    try{
        v.click();
        var x = await v.setValue(pid);
        while(!x){
            
        }
    }catch{
    }


    await utils.sleep(1000)


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
    return click 
}



//Aggiunge una nuova regola per il blocco di un device
describe("Add a device lock new rule", function(){

    before(async function(){
        await global.app.start()
    })
    before(async function(){    
        //Aggiungi un device con stessi vid e pid nel db
        db.conn.select(1)
        db.conn.set("config_usb_lock", "{\"lock_enabled\":false,\"lock_except\":[],\"lock_specific\":[{\"vid\":\"9999\",\"pid\":\"9999\"}]}")
    }) 
    after(async function(){
        await global.app.stop()
    })
    
    describe("Database tests", function(){   

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
            {v:"12a12", p:1234}, 
            {v:"", p:1234},
            {v:"123", p:1234},
            {v:"", p:"abcd"},
            {v:1234, p:"qwer"},
            {v:"aaaaaaa", p:1234},
            {v:"aaaa", p:12374}
        ]
        wrongValues.forEach(elem => {
            it("should return null if the rule can't be confirmed", async () => {
                expect(await addrule(elem.v, elem.p)).to.be.null
            })
        })

        const rightValues = [
            {v:1234, p:1234},
            {v:8705, p:2640},
            {v:"aaaa", p:1234}
        ]
        rightValues.forEach(elem => {                
            it("should return not null if the rule has been confirmed", async () => {
                expect( await addrule(elem.v, elem.p)).to.not.be.null
            })
        })

    })
})

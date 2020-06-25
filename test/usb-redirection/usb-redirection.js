const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");

//return not null se ha confermato la creazione della regola
const addRule = async function(description, vid, pid){

    //Apre menù USB Redirection
    const menu = global.app.client.$('#menu-link-10');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //clicca add redirection rule
    const button = global.app.client.$('#citrix > div > div > div > a');
    click = null;
    try{
        click = await button.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //inserisce descrizione 
    const d = global.app.client.$("#description");
    try{
        d.click();
        var x = await d.setValue(description);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1000)


    //inserisce il vid
    const v = global.app.client.$("#vid");
    try{
        v.click();
        var x = await v.setValue(vid);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1000)


    //inserisce il pid
    const p = global.app.client.$("#pid");
    try{
        p.click();
        x = await p.setValue(pid);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1000)


    //conferma
    const ok = global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
    var click = null;
    try{
        click = await ok.click();
    }catch{
        click = null
    }

    if(click == null){
        //preme su annulla
        try{
            global.app.client.$("#add-usb-rule-modal > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(2)").click()
        }catch{
        }
    }

    return click
}

describe("Add USB redirection rule", function(){

    before(async function(){
        await global.app.start()
    })

    before(async function(){    
        //Aggiungi una regola
        db.conn.select(1)
        db.conn.set("config_citrix", "{\"usb_redirection\":{\"auto_redirect_on_start\":true,\"auto_redirect_on_plug\":false,\"rules\":[{\"type\":\"ALLOW\",\"vid\":\"1234\",\"pid\":\"1234\",\"class\":\"\",\"subclass\":\"\",\"prot\":\"\",\"description\":\"prova_usb\",\"split\":false,\"interfaces\":[]}],\"default\":\"ALLOW\"}}")
    }) 

    after(async function(){
        await global.app.stop()
    })

    this.timeout(30000)

    describe("Database tests", async () => {

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


            await global.sleep(1000)


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

        it("should return null if it tries to add a rule with same vid and pid of another rule", async () => {
            expect(await addRule("any", 1234, 1234)).to.be.null
        })

    })

    describe("Usb redirection tests", async () => {

        const wrongValues = [
            {description:"", vid:"", pid:""},
            {description:"aaaa", vid:"abc", pid:"1234"},
            {description:"qqqq", vid:"12", pid:"1234"},
            {description:"aaaaa", vid:"", pid:"1234"},
            {description:"eeee", vid:"12345", pid:"1234"},
            {description:"tt", vid:"8576", pid:"1"},
            {description:"gg", vid:"5654", pid:""},
            {description:"95744", vid:"3333", pid:"12345"},
            {description:"dhdhd", vid:"123p", pid:"2222"},
            {description:"www", vid:"1234", pid:"gggg"},
            {description:"dd", vid:"1p31", pid:"1111"}
        ]
        wrongValues.forEach(elem => {
            it("should return null for invalid description, vid or pid", async () => {
                expect(await addRule(elem.description, elem.vid, elem.pid)).to.be.null
            })
        })

        const rightValues = [
            {description:"test", vid:"1234", pid:"5678"}
        ]
        rightValues.forEach(elem => {
            it("should return not null if the rule has been added", async () => {
                expect(await addRule(elem.description, elem.vid, elem.pid)).to.not.be.null
            })

        })
    })

})    


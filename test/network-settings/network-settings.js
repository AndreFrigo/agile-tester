const {db} = require ("../db.js");
const {global} = require ("../global.js");
const { expect } = require("chai");

//ritorna click, se è nullo allora la rete non è presente nell'elenco
const checkSsid = async function (ssid) {
    //Va nella sezione impostazioni di rete
    const menu = global.app.client.$('#menu-link-2');
    var click = null;
    try{
        click = await menu.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //Va nella sezione wifi
    const wifi = global.app.client.$("#ab > a");
    click = null;
    try{
        click = await wifi.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //Clicca su aggiungi rete wifi
    const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
    click = null;
    try{
        click = await add.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    //apre la lista delle reti disponibili
    const button = global.app.client.$("#wifi");
    var click = null;
    try{
        click = await button.click();
    }catch{
    }
    global.app.client.waitUntilWindowLoaded();


    await global.sleep(1000)


    var ret = null
    try{
        ret = await global.app.client.$("span.network-ssid=" + ssid).click();
    }catch{
        ret = null
    }
    
    await global.sleep(1000)

    return ret
}

//ritorna click, se è nullo allora la password non è corretta o la rete non è presente nell'elenco
const checkPsw = async function (ssid, psw){
    await checkSsid(ssid)

    //inserisce la password
    const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
    try{
        password.click();
        var x = await password.setValue(psw);
        while(!x){
            
        }
    }catch{
    }


    await global.sleep(1000)


    //conferma premendo ok
    const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
    var click = null;
    try{
        click = await ok.click();
    }catch{
        click = null
    }
    await global.sleep(1500)
    if(click == null){
        //preme su annulla
        try{
            await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
        }catch{
        }
    }
    try{
        //titolo del pop-up
        notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
    }catch{
        notification = null
    }
    //aggiorna lingua
    global.language = await db.dbLanguage()
    var succ = null
    switch(global.language){
        case 1: {
            succ = "Successo"
            break
        }
        case 2: {
            succ = "Success"
            break
        }
        case 3: {
            succ = "Exito"
            break
        }
    }
    if(notification != succ) click = null

    return click

}



//FUNZIONA SOLO CON WIFI CHE RICHIEDONO SSID E PASSWORD
describe("Add WiFi Network", function(){

    before(async function(){
        await global.app.start()
    })
    before(async function(){    
        //Aggiungi una rete wifi
        db.conn.select(1)
        db.conn.set("config_network", "{\"hostname\":null,\"interfaces\":[],\"wifi\":[{\"ssid\":\"prova_wifi\",\"authentication\":\"WPA2-PSK\",\"encryption\":\"AES\",\"hidden\":false,\"psk\":\"cHJhaW0tYWVzLTEyOC1jYmM6wRyVyCSItEALI2T4eKVZv1Wf5tKVgxW/ALd0sseL5F3vS/UV85EkrpLv0Prels4J\"}],\"hosts\":null}")
    })
    after(async function(){
        await global.app.stop()
    })

    this.timeout(30000)

    describe("Database tests", function(){

        //Controlla che la nuova wifi sia stata inserita nel db
        it("should return not null if the wifi is in the database", async () => {
            expect(await db.getWifi("prova_wifi")).to.not.be.null
        })

        //Controlla che la nuova wifi sia nella lista di agile 
        it("should return true if the wifi is in the list", async () => {

            //Va nella sezione impostazioni di rete
            const menu = global.app.client.$('#menu-link-2');
            var click = null;
            try{
                click = await menu.click();
            }catch{
            }
            global.app.client.waitUntilWindowLoaded();


            await global.sleep(1000)


            //Va nella sezione wifi
            const wifi = global.app.client.$("#ab > a");
            click = null;
            try{
                click = await wifi.click();
            }catch{
            }
            global.app.client.waitUntilWindowLoaded();


            await global.sleep(1500)


            const length = await db.getWifiListLength();
            const base = "#wifiTab > div > div > div.section-wrapper.scrollable > div"
            var found = false; 
            var name = null;
            for(i = 1; i<= length; i++){
                try{
                    name = await global.app.client.$(base + " > div:nth-child(" + i + ") > div > div.block-item-properties-wrapper > div").getText();
                }catch{
                }
                if(name.slice(14) == "prova_wifi"){
                    found = true;
                }
            }
            expect(found).to.be.true
        })

    })

    describe("WiFi tests", function(){
        const wrongSsid = [
            {ssid:"", psw:1234},
            {ssid:"allagriglia", psw:1234},
            {ssid:"bsn", psw:1234},
            {ssid:123345, psw:1234}
        ]
        wrongSsid.forEach(elem => {
            it("should return null if there is not a wifi with the given ssid in the list", async () => {
                const isNull = await checkSsid(elem.ssid)
                //preme su annulla
                try{
                    await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
                }catch{
                }
                expect(isNull).to.be.null
            })
        })

        const wrongPsw = [
            {ssid:"PRAIM_WIFI_N", psw:1234},
            {ssid:"PRAIM_WIFI_N", psw:"asdfghj"},
            {ssid:"PRAIM_WIFI_N", psw:""}
        ]
        wrongPsw.forEach(elem => {
            it("should return null if the password is wrong or there is not a wifi with the given ssid in the list", async () => {
                expect(await checkPsw(elem.ssid, elem.psw)).to.be.null
            })
        })

        const rightValues = [
            {ssid:"PRAIM_WIFI_N", psw:"asd123!!"}
        ]
        rightValues.forEach(elem => {
            it("should return not null if the wifi has been added correctly and success notification appeared", async () => {
                expect(await checkPsw(elem.ssid, elem.psw)).to.be.not.null
            })
        })

    })
})

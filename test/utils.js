const {db} = require ("./db.js");
const {global} = require ("./global.js");

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //return not null se la risorsa è stata creata con successo, null altrimenti
    addResource : async function (resourceName, resourceUrl) {

        //va in risorse
        const menu = global.app.client.$("#menu-link-6");
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //clicca su add resource
        const addResource = global.app.client.$("#main-div > div.main-content > main > section > div > div.fixed-header > div > a");
        click = null;
        try{
            click = await addResource.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //seleziona local browser
        const localBrowser = global.app.client.$("#add-connection-modal > div.custom-modal.open > div.modal-content > div > div > div.row > div.col.s12 > div.connection-col > div:nth-child(4) > label");
        click = null;
        try{
            click = await localBrowser.click();
        }catch{
        }


        await utils.sleep(1000)


        //inserisce il nome 
        const text = global.app.client.$("#add-connection-name");
        try{
            text.click();
            await text.setValue(resourceName);
        }catch{
        }


        await utils.sleep(1000)


        //inserisce l'url
        const url = global.app.client.$("#add-connection-server");
        try{
            url.click();
            await url.setValue(resourceUrl);
        }catch{
        }


        await utils.sleep(1000)


        //preme ok per confermare, se non è disponibile preme annulla 
        const ok = global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(1)");
        var ret = null;
        try{
            ret = await ok.click();
        }catch{
            ret = null
        }
        await utils.sleep(1000)
        if(ret == null){
            try{
                await global.app.client.$("#add-connection-modal.form > div.custom-modal.open > div.modal-footer > div.buttons > a:nth-child(2)").click();
            }catch{
            }
        }
        return ret
    },


    //ritorna not null se c'è una wifi disponibile con l'ssid dato, altrimenti null
    checkSsid : async function (ssid) {
        //Va nella sezione impostazioni di rete
        const menu = global.app.client.$('#menu-link-2');
        var click = null;
        try{
            click = await menu.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Va nella sezione wifi
        const wifi = global.app.client.$("#ab > a");
        click = null;
        try{
            click = await wifi.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //Clicca su aggiungi rete wifi
        const add = global.app.client.$("#wifiTab > div > div > div.header-inputs > a");
        click = null;
        try{
            click = await add.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        //apre la lista delle reti disponibili
        const button = global.app.client.$("#wifi");
        var click = null;
        try{
            click = await button.click();
        }catch{
        }
        global.app.client.waitUntilWindowLoaded();


        await utils.sleep(1000)


        var ret = null
        try{
            ret = await global.app.client.$("span.network-ssid=" + ssid).click();
        }catch{
            ret = null
        }
        
        await utils.sleep(1000)

        return ret
    },


    //ritorna not null se ha confermato la wifi, null se la password non è corretta o la rete non è presente nell'elenco
    saveWifi: async function (ssid, psw){
        await utils.checkSsid(ssid)

        //inserisce la password
        const password = global.app.client.$("#add-connection-modal > div > div.modal-content > div > div > div.row:nth-child(4) > div > div > input");
        try{
            password.click();
            var x = await password.setValue(psw);
            while(!x){
                
            }
        }catch{
        }


        await utils.sleep(1000)


        //conferma premendo ok
        const ok = global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(1)");
        var click = null;
        try{
            click = await ok.click();
        }catch{
            click = null
        }
        await utils.sleep(1500)
        if(click == null){
            //preme su annulla
            try{
                await global.app.client.$("#add-connection-modal > div > div.modal-footer > div > a:nth-child(2)").click();
            }catch{
            }
        }
        return click
    },


    //ritorna not null se ha creato la regola, altrimenti null
    addRule: async function (vid, pid){

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




}

module.exports = {utils}
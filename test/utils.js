const {db} = require ("./db.js");
const {global} = require ("./global.js");
const {info} = require("./set-before-test.js")
const ids = require("./selectors.js")
var robot = null
const path = require("path")

const utils={
    //funzione di wait
    sleep : time => new Promise(r => setTimeout(r, time)),

    //funzione per avviare l'applicazione
    start: async function(){
        await global.app.start()
        
        //se siamo su windows si utilizza robotjs
        if(info.os == "w"){
            robot = require("robotjs")
            
            // minimizza il terminale vuoto
            await robot.keyToggle("space", "down", ["alt"])
            await robot.keyTap("n")
            await utils.sleep(500)
            await robot.keyToggle("space", "up", ["alt"])
        }

        // //setta l'applicazione come finestra principale 
        // await global.app.browserWindow.setAlwaysOnTop(true);
        // await global.app.browserWindow.focus();

        //se siamo su linux l'applicazione non viene avviata da amministratore e quindi è necesssario inserire le credenziali
        if(info.os == 'l'){
            try{
                await utils.sleep(500)
                await global.app.client.$("#admin-username").setValue(info.adminUsername)
                await utils.sleep(500)
                await global.app.client.$("#admin-password").setValue(info.adminPassword)
                await utils.sleep(500)
                await global.app.client.$("#license-wrapper > div > div.col.s12.license-body > div > div.col.s3 > a").click()
                await utils.sleep(500)
                await global.app.client.waitUntilWindowLoaded()
                try{
                    //chiude il notification pop-up
                    await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > a").click();
                }catch{
                }
            }catch{
                console.log("Errore autenticazione")
            }
        }

        //Dopo il login attende che l'applicazione sia completamente avviata e non in caricamento
        var ok = null
        while(ok == null){
            try{
                ok = await global.app.client.$(info.ABOUT).getText()
            }catch{
                ok = null
                await utils.sleep(1000)
            }
        }
        
    },

    //return true se è apparso il pop up , altrimenti false 
    //param type: tipo di notifica: success | warning
    //param time: tempo massimo di attesa in secondi (da moltiplicare per 2)
    checkNotification: async function(type, time = 2){
        var notification = null
        var i = 0
        while(notification == null && i<time){
            try{
                //titolo del pop-up
                notification = await global.app.client.$("#main-div > div:nth-child(3) > span > div.notification > div.header > p.title").getText();
            }catch{
                notification = null
            }
            i++
            await utils.sleep(2000)
        }
        
        //aggiorna lingua
        const language = await db.dbLanguage()
        var not = null
        switch(language){
            case 1: {
                if(type == "success") not = "Successo"
                else if(type == "warning") not = "Attenzione"
                break
            }
            case 2: {
                if(type == "success") not = "Success"
                else if(type == "warning") not = "Warning"
                break
            }
            case 3: {
                if(type == "success") not = "Exito"
                else if(type == "warning") not = "Atención"
                break
            }
        }
        return notification == not && notification != null
    },

    //seleziona il file con il nome dato in input nella cartella agile-tester/files
    //return true se tutto è andato bene, altrimenti false
    fileChooser: async function(fileName){
        var done = true
        //va nella sezione path
        try{
            for(i=0;i<5;i++){
                robot.keyTap("tab")
                await utils.sleep(100)
            }
            robot.keyTap("enter")
            await utils.sleep(200)
        }catch{
            done = false
        }

        //inserisce la path
        const p = path.join(path.dirname(__filename), "../files")
        try{
            robot.typeString(p)
            await utils.sleep(500)
            robot.keyTap("enter")
        }catch{
            done = false
        }

        //va nella sezione nome del file
        try{
            for(i=0;i<6;i++){
                robot.keyTap("tab")
                await utils.sleep(100)
            }
        }catch{
            done = false
        }

        //Inserisce il nome del file
        try{
            await robot.typeString(fileName)

            await utils.sleep(500)

            //preme invio per confermare
            robot.keyTap("enter")
        }catch{
            done = false
        }

        return done
    },

    /**
     * Click on an element given his id
     * @param  {string} id This is the ID ot the object to click
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {boolean} True if the element was clicked, false in case of error
     */
    click: async function(id, printError = true){
        try{
            await global.app.client.$(id).click()
        }catch(err){
            if(printError){
                console.log("Error while clicking element with id: " + id)
                console.log("ERROR: " + err)
            }
            return false
        }
        global.app.client.waitUntilWindowLoaded()
        return true
    },
    /**
     * Insert a text in the text field with the given ID
     * @param  {string} id This is the ID ot the text field
     * @param  {string} text This is the text to set to the text field
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {boolean} True if the text was inserted, false in case of error
     */
    insertText: async function(id, text, printError = true){
        try{
            await global.app.client.$(id).setValue(text)
        }catch(err){
            if(printError){
                console.log("Error while inserting text: " + text + " to the element with id: " + id)
                console.log("ERROR: "+err)
            }
            return false
        }
        global.app.client.waitUntilWindowLoaded()
        return true
    },
    /**
     * Find an element in the Agile list
     * @param  {string | string[]} elemName This is the name of the element to find, can be a string or an array, the first occurence is returned
     * @param  {string} nameId Id of the html element that contains the name 
     * @param  {number} startIndex Start index for iteration
     * @param  {number} listLength Length of the Agile list
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {number} Index of the element founded, -1 if no element was found
     */
    findInList: async function(elemName, nameId, startIndex, listLength, printError = true){
        var n = null
        for(i = startIndex; i < startIndex + listLength; i++){
            //salva il nome dell'elemento
            try{
                n = await global.app.client.$(nameId(i)).getText()
            }catch(err){
                if(printError){
                    console.log("Error while getting name of the element with id: " + id)
                    console.log("ERROR: "+err)
                }
            }
            //controlla se i nomi coincidono
            if(typeof elemName == "string"){
                if(elemName == n){
                    return i
                }
            }else{
                elemName.forEach(elem => {
                    if(elem == n){
                        return i
                    }
                })
            }
        }
        return -1
    },

    insertTextPromise: async function(id, text, printError = true){
        const elem = global.app.client.$(id)
        try{
            elem.click()
            const val = text.toString()
            await new Promise(function (resolve, reject){
                elem.getValue().then(async function(result){
                    //cancella il valore predefinito
                    for(i=0;i<result.length;i++){	
                        global.app.client.keys("Backspace");	
                    }

                    await utils.sleep(500)

                    //inserisce manualmente il valore da settare
                    for(i=0;i<val.length;i++){
                        global.app.client.keys(val[i])
                    }
                    resolve(true)
                })
            })                    
        }catch(err){
            if(printError){
                console.log("Error while getting/setting value of the element with id: " + id)
                console.log("ERROR: "+err)
            }
            return false
        }
        return true        
    },

    resources:{
        /**
         * Add a resource of type Local Browser
         * @param  {string} resourceName This is the name to give to the resource
         * @param  {string} resourceUrl This is the url to give to the resource
         * @return {boolean | null} true if the resource was created successfully, false if not, null in case of errors
         */
        addLocalBrowser : async function (resourceName, resourceUrl) {
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null
            
            await utils.sleep(1000)

            //clicca su add resource
            if(await utils.click(ids.resources.addResource.button) == false) return null

            await utils.sleep(1000)

            //seleziona local browser
            if(await utils.click(ids.resources.addResource.localBrowser.label) == false) return null

            await utils.sleep(1000)

            //inserisce il nome 
            if(await utils.insertText(ids.resources.addResource.name, resourceName) == false) return null

            await utils.sleep(1000)

            //inserisce l'url
            if(await utils.insertText(ids.resources.addResource.localBrowser.server, resourceUrl) == false) return null

            await utils.sleep(1000)

            //preme ok per confermare
            if(await utils.click(ids.resources.addResource.localBrowser.ok, false) == true) return true
            else return false
        },


        /**
         * Delete a resource
         * @param  {string} name This is the name of the resource to delete
         * @return {boolean | null} true if the resource was deleted, false if there is not a resource in the list with the given name, null in case of errors
         */
        deleteResource: async function(name){
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(500)

            const length = await db.getResourceListLength();
            //indice dell'elemento da eliminare
            const index = await utils.findInList(["agile_local " + name, "agile_remote " + name], ids.resources.name, 0, length)

            await utils.sleep(500)

            if(index != -1){
                //preme sul bottone per eliminare 
                if(await utils.click(ids.resources.delete(index)) == false) return null
    
                await utils.sleep(500)
    
                //conferma l'eliminazione 
                if(await utils.click(ids.resources.confirmDelete(index)) == false) return null
            }else{
                return false
            }
            return true
        },
        /**
         * Search for an element in the Agile resource list
         * @param  {number} type This is the resource type: citrix => 1, Microsoft => 2, VMware => 3, Local Browser => 4, Local Application => 5
         * @param  {string} name This is the name of the resource to find 
         * @return {boolean | null} True if the resource is in the list, false if the resource is not in the list, null in case of errors
         */
        isInAgileList: async function(type, name){
            var ret = null
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            const length = await db.getResourceListLength();

            switch(type){
                //Citrix
                case 1:{
                    ret = await utils.findInList("agile_remote " + name, ids.resources.name, 0, length)
                    break
                }
                //Microsoft
                case 2:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                //VMware
                case 3:{
                    ret = await utils.findInList("agile_remote " + name, ids.resources.name, 0, length)
                    break
                }
                //Local Browser
                case 4:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                //Local Application 
                case 5:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                default:{
                    return null
                }
            }
            if(ret == -2) return null
            else if(ret == -1) return false
            else return true 
        },
        /**
         * Add a resource of type Local Application
         * @param  {string} resourceName This is the name of the resource to add
         * @param  {string} resourceInfo This is the name of the application to add
         * @return {boolean | null} True if the resource was added, false otherwise, null in case of errors
         */
        addLocalApplication: async function(resourceName, resourceInfo){
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            //clicca su add resource
            if(await utils.click(ids.resources.addResource.button) == false) return null

            await utils.sleep(1000)

            //seleziona local app
            if(await utils.click(ids.resources.addResource.localApplication.label) == false) return null

            await utils.sleep(1000)

            //inserisce il nome 
            if(await utils.insertText(ids.resources.addResource.name, resourceName) == false) return null

            await utils.sleep(1000)

            //clicca in file
            if(await utils.click(ids.resources.addResource.localApplication.file) == false) return null

            await utils.sleep(1000)

            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(resourceInfo) == false) return null

            await utils.sleep(1000)

            //preme su ok per confermare
            if(await utils.click(ids.resources.addResource.localApplication.ok, false) == true) return true
            else return false
            
        },
        //return true se ha aggiunto la risorsa, altrimenti false, null se ci sono errori
        /**
         * Add a resource of type Citrix
         * @param  {string} name This is the name of the resource to add
         * @param  {string} server This is the server of the resource to add
         * @param  {string} domain This is the domain of the resource to add
         * @return {boolean | null} True if the resource has been added, false otherwise, null in case of errors
         */
        addCitrix: async function(name, server, domain){
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            //clicca su add resource
            if(await utils.click(ids.resources.addResource.button) == false) return null
            
            await utils.sleep(1000)

            //seleziona citrix
            if(await utils.click(ids.resources.addResource.citrix.label) == false) return null

            await utils.sleep(500)

            //inserisce il nome 
            if(await utils.insertText(ids.resources.addResource.name, name) == false) return null

            await utils.sleep(1000)


            //inserisce il server 
            if(await utils.insertText(ids.resources.addResource.citrix.server, server) == false) return null

            await utils.sleep(1000)

            //inserisce il domain 
            if(await utils.insertText(ids.resources.addResource.citrix.domain, domain) == false) return null

            await utils.sleep(1000)

            //preme su ok per confermare
            if(await utils.click(ids.resources.addResource.citrix.ok, false) == true) return true
            else return false

        },
        //return true se la risorsa è stata aggiunta, altrimenti false, null se ci sono errori
        /**
         * Add a resource of type Microsoft
         * @param  {string} name This is the name of the resource to add
         * @param  {string} resourceInfo This is the name of the Microsoft resource in the system
         * @return {boolean | null} True if the resource has been added, false otherwise, null in case of errors
         */
        addMicrosoft: async function(name, resourceInfo){
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            //clicca su add resource
            if(await utils.click(ids.resources.addResource.button) == false) return null

            await utils.sleep(1000)

            //seleziona microsoft
            if(await utils.click(ids.resources.addResource.microsoft.label) == false) return null

            await utils.sleep(500)

            //inserisce il nome 
            if(await utils.insertText(ids.resources.addResource.name, name) == false) return null

            await utils.sleep(1000)

            //clicca in file
            if(await utils.click(ids.resources.addResource.microsoft.file) == false) return null

            await utils.sleep(1000)

            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(resourceInfo) == false) return null

            await utils.sleep(1000)

            //preme su ok per confermare
            if(await utils.click(ids.resources.addResource.citrix.ok, false) == true) return true
            else return false

        },

        //return true se l'ha creata, altrimenti false, null se ci sono stati errori
        /**
         * Add a resource of type VMware
         * @param  {string} name This is the name of the resource to add
         * @param  {string} server This is the server of the resource to add
         * @return {boolean | null} True if the resource has been added, false otherwise, null in case of errors
         */
        addVMware: async function(name, server){
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            //clicca su add resource
            if(await utils.click(ids.resources.addResource.button) == false) return null

            await utils.sleep(1000)

            //seleziona VMware
            if(await utils.click(ids.resources.addResource.vmware.label) == false) return null

            await utils.sleep(1000)

            //inserisce il nome 
            if(await utils.insertText(ids.resources.addResource.name, name) == false) return null

            await utils.sleep(1000)

            //inserisce il server 
            if(await utils.insertText(ids.resources.addResource.vmware.server, server) == false) return null

            await utils.sleep(500)

            //preme su ok per confermare
            if(await utils.click(ids.resources.addResource.citrix.ok, false) == true) return true
            else return false
            
        },
        //input: type: 1|2|3|4|5 identifica il tipo di risorsa, name: il nome della risorsa
        //output: true se il test ha prodotto una notifica di successo, false altrimenti, null in caso di errori
        /**
         * @param  {number} type This is the resource type: citrix => 1, Microsoft => 2, VMware => 3, Local Browser => 4, Local Application => 5
         * @param  {string} name This is the name of the resource to test
         * @return {boolean | null} True if the resource has been successfully tested, false otherwise, null in case of errors
         */
        test: async function(type, name){
            var ret = null
            //va in risorse
            if(await utils.click(ids.resources.menuID) == false) return null

            await utils.sleep(1000)

            const length = await db.getResourceListLength();

            switch(type){
                //Citrix
                case 1:{
                    ret = await utils.findInList("agile_remote " + name, ids.resources.name, 0, length)
                    break
                }
                //Microsoft
                case 2:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                //VMware
                case 3:{
                    ret = await utils.findInList("agile_remote " + name, ids.resources.name, 0, length)
                    break
                }
                //Local Browser
                case 4:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                //Local Application 
                case 5:{
                    ret = await utils.findInList("agile_local " + name, ids.resources.name, 0, length)
                    break
                }
                default:{
                    return null
                }
            }

            //preme sull'elemento
            if(await utils.click(ids.resources.element(ret)) == false) return null

            await utils.sleep(1000)

            //preme su test
            if(await utils.click(ids.resources.test(ret)) == false) return null

            await utils.sleep(1500)

            //controlla la notifica
            var not = null
            not = await utils.checkNotification("success")

            return not
        }

    },
    
    networkSettings:{
        /**
         * Secect a wifi 
         * @param  {string} ssid This is the ssid of the wifi to select
         * @return {boolean | null} True if the wifi has been successfully selected, false if it is not in the list, null in case of errors
         */
        checkSsid : async function (ssid) {
            //Va nella sezione impostazioni di rete
            if(await utils.click(ids.networkSettings.menuID) == false) return null

            await utils.sleep(1000)

            //Va nella sezione wifi
            if(await utils.click(ids.networkSettings.wifi.wifiTab) == false) return null

            await utils.sleep(1000)

            if(await utils.click(ids.networkSettings.wifi.addWifi.button) == false) return null

            await utils.sleep(1000)

            //apre la lista delle reti disponibili
            if(await utils.click(ids.networkSettings.wifi.addWifi.selectNetwork) == false) return null

            await utils.sleep(1000)

            //preme su quella con ssid dato
            var ret = null
            try{
                ret = await global.app.client.$("span.network-ssid=" + ssid).click();
            }catch{
                ret = null
            }
            
            return ret != null
            
        },
        /**
         * Add a wifi
         * @param  {string} ssid This is the ssid of the wifi to add
         * @param  {string} psw This is the password of the wifi to add
         * @return {boolean | null} True if the wifi has been successfully added, false if it is not in the list or has not been added, null in case of errors
         */
        saveWifi: async function (ssid, psw){
            //seleziona la wifi con ssid corrispondente
            if(await utils.networkSettings.checkSsid(ssid) != true) return false

            await utils.sleep(1000)

            //inserisce la password
            if(await utils.insertText(ids.networkSettings.wifi.addWifi.password, psw) == false) return null

            await utils.sleep(1000)

            //conferma premendo ok
            if(await utils.click(ids.networkSettings.wifi.addWifi.ok, false) == true) return true
            else return false
         
        }
    },

    deviceLock:{
        /**
         * Add a device
         * @param  {string} vid This is the vid of the device
         * @param  {string} pid This is the pid of the device
         * @return {boolean | null} True if the device has been successfully added, false otherwise, null in case of errors
         */
        addRule: async function (vid, pid){
            //va nel menu device lock
            if(await utils.click(ids.deviceLock.menuID) == false) return null

            await utils.sleep(1000);

            //clicca su add rule
            if(await utils.click(ids.deviceLock.addRule.button) == false) return null

            await utils.sleep(1000)

            //inserisce vid
            if(await utils.insertText(ids.deviceLock.addRule.vid, vid) == false) return null

            await utils.sleep(1000)

            //inserisce pid
            if(await utils.insertText(ids.deviceLock.addRule.pid, pid) == false) return null

            await utils.sleep(1000)

            //conferma premendo ok
            if(await utils.click(ids.deviceLock.addRule.ok, false) == true) return true
            else return false

        },
        /**
         * Delete a device
         * @param  {string} vid This is the vid of the device
         * @param  {string} pid This is the pid of the device
         * @return {boolean | null} True if the device has been successfully delete, false if the device is not in the list, null in case of errors
         */
        deleteRule: async function(vid, pid){
            //va nel menu device lock
            if(await utils.click(ids.deviceLock.menuID) == false) return null

            await utils.sleep(500)

            const length = await db.getDeviceLockListLength()

            await utils.sleep(500)

            var vidPid = null
            if(vid != null && pid != null) vidPid == "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid == "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid == "Vid: " + vid
            
            const index = await utils.findInList(vidPid, ids.deviceLock.vidPid, 1, length)
        
            //clicca su elimina
            if(await utils.click(ids.deviceLock.delete(index), false) == true) return true
            else return false
            
        },
        /**
         * Search an element in the list
         * @param  {string} vid This is the vid of the device
         * @param  {string} pid This is the pid of the device
         * @return {boolean | null} True if the device is in the list, false otherwise, null in case of errors
         */
        isInAgileList: async function(vid, pid){
            //va nel menu device lock
            if(await utils.click(ids.deviceLock.menuID) == false) return null

            await utils.sleep(500)

            const length = await db.getDeviceLockListLength()

            await utils.sleep(500)

            var vidPid = null
            if(vid != null && pid != null) vidPid == "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid == "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid == "Vid: " + vid
            
            const index = await utils.findInList(vidPid, ids.deviceLock.vidPid, 1, length)

            if(index > 0) return true
            else return false

        }
    },

    thinmanSettings: {
        /**
         * Add a thinman address
         * @param  {string} address This is the address/hostname of the thinman
         * @param  {string} port This is the port of the thinman
         * @param  {string} timeout This is the timeout of the thinman
         * @return {boolean | null} True if the device has been added, false otherwise, null in case of errors
         */
        addAddress: async function(address, port, timeout){
            //va in thinman settings
            if(await utils.click(ids.thinmanSettings.menuID) == false) return null
        
            await utils.sleep(1000)
        
            //preme su add address
            if(await utils.click(ids.thinmanSettings.addAddress.button) == false) return null
        
            await utils.sleep(1000)
        
            //inserisce l'address
            if(await utils.insertText(ids.thinmanSettings.addAddress.hostname, address) == false) return null
        
            await utils.sleep(1000)
        
            // inserisce la porta
            //la funzione insertText qui non funziona            
            if(await utils.insertTextPromise(ids.thinmanSettings.addAddress.port, port) == false) return null
        
            await utils.sleep(1000)

            //inserisce il timeout
            //la funzione insertText qui non funziona
            if(await utils.insertTextPromise(ids.thinmanSettings.addAddress.timeout, timeout) == false) return null
        
            await utils.sleep(1000)
        
            //conferma premendo ok
            if(await utils.click(ids.thinmanSettings.addAddress.ok, false) == true) return true
            else return false

        },
        /**
         * Delete an address of the list
         * @param  {string} address This is the address/hostname of the thinman
         * @return {boolean | null} True if the device has been deleted, false if the device is not in the list, null in case of errors
         */
        deleteAddress: async function(address){
            //va in thinman settings
            if(await utils.click(ids.thinmanSettings.menuID) == false) return null
        
            await utils.sleep(1000)

            //numero di address agile 
            const length = await db.getThinManListLength();
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"

            //indice dell'elemento da eliminare
            const index = await utils.findInList("<div><b>"+indirizzo+":</b> "+ address +"</div>", ids.thinmanSettings.address, 1, length)

            //elimina l'elemento premendo il bottone
            if(await utils.click(ids.thinmanSettings.delete(index), false) == true) return true
            else return false
            
        },
        /**
         * Search a device in the list
         * @param  {string} address This is the address/hostname of the thinman
         * @return {boolean | null} True if the device is in the list, false otherwise, null in case of errors
         */
        isInAgileList: async function(address){
            //va in thinman settings
            if(await utils.click(ids.thinmanSettings.menuID) == false) return null
        
            await utils.sleep(1000)

            //numero di address agile 
            const length = await db.getThinManListLength();
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"

            //indice dell'elemento
            const index = await utils.findInList("<div><b>"+indirizzo+":</b> "+ address +"</div>", ids.thinmanSettings.address, 1, length)

            if(index > 0) return true
            else return false
            
        },
        /**
         * Test an address
         * @param  {string} address This is the address/hostname of the thinman
         * @return {boolean | null} True if the device has been successfully testd and success notification appeared, false otherwise, null in case of errors
         */
        testAddress: async function(address){
            //va in thinman settings
            if(await utils.click(ids.thinmanSettings.menuID) == false) return null
        
            await utils.sleep(1000)

            //numero di address agile 
            const length = await db.getThinManListLength();
            //aggiorno lingua
            const language = await db.dbLanguage()
            //string per html che dipende dalla lingua in uso
            var indirizzo = null;
            if(language == 1) indirizzo = "Indirizzo"
            else if(language == 2) indirizzo = "Address"
            else if(language == 3) indirizzo = "Dirección"

            //indice dell'elemento
            const index = await utils.findInList("<div><b>"+indirizzo+":</b> "+ address +"</div>", ids.thinmanSettings.address, 1, length)

            //preme bottone test
            if(await utils.click(ids.thinmanSettings.test(index), false) == false) return false

            await utils.sleep(1500)

            //a volte ci mette un po' quindi attende fino a 60 secondi per ricevere la notifica e poi controlla il titolo
            const not = await utils.checkNotification("success", 30)

            return not
            
        }
    },

    usbRedirection: {
        //return true se ha confermato la creazione della regola, false altrimenti, null se qualcosa non ha funzionato 
        /**
         * @param  {string} description This is the description of the rule
         * @param  {string} vid This is the vid of the rule
         * @param  {string} pid This is the pid of the rule
         * @return {boolean | null} True if the rule has been added, false otherwise, null in case of errors
         */
        addRule: async function(description, vid, pid){
            //Apre menù USB Redirection
            if(await utils.click(ids.usbRedirection.menuID) == false) return null

            await utils.sleep(1000)

            //clicca add redirection rule
            if(await utils.click(ids.usbRedirection.addRule.button) == false) return null

            await utils.sleep(1000)

            //inserisce descrizione 
            if(await utils.insertText(ids.usbRedirection.addRule.description, description) == false) return null

            await utils.sleep(1000)

            //inserisce il vid
            if(await utils.insertText(ids.usbRedirection.addRule.vid, vid) == false) return null

            await utils.sleep(1000)

            //inserisce il pid
            if(await utils.insertText(ids.usbRedirection.addRule.pid, pid) == false) return null

            await utils.sleep(1000)

            //conferma premendo ok
            if(await utils.click(ids.usbRedirection.addRule.ok, false) == true) return true
            else return false
            
        },
        /**
         * Delete a rule of the list
         * @param  {string} vid This is the vid of the rule
         * @param  {string} pid This is the pid of the rule
         * @return {boolean | null} True if the rule has been deleted, false if the rule is not in the list, null in case of errors
         */
        deleteRule: async function(vid, pid){
            //Apre menù USB Redirection
            if(await utils.click(ids.usbRedirection.menuID) == false) return null

            await utils.sleep(1000)

            const length = await db.getUSBRedirectionListLength()

            var vidPid = null
            if(vid != null && pid != null) vidPid == "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid == "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid == "Vid: " + vid
            
            //indice dell'elemento da eliminare
            const index = await utils.findInList(vidPid, ids.usbRedirection.vidPid, 1, length)

            //elimina l'elemento premendo il bottone
            if(await utils.click(ids.usbRedirection.delete(index), false) == true) return true
            else return false

        },
        /**
         * Search a rule in the list
         * @param  {string} vid This is the vid of the rule
         * @param  {string} pid This is the pid of the rule
         * @return {boolean | null} True if the rule is in the list, false otherwise, null in case of errors
         */
        findRule: async function(vid, pid){
            //Apre menù USB Redirection
            if(await utils.click(ids.usbRedirection.menuID) == false) return null

            await utils.sleep(500)

            //numero di address agile 
            const length = await db.getUSBRedirectionListLength();

            var vidPid = null
            if(vid != null && pid != null) vidPid == "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid == "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid == "Vid: " + vid
            
            //indice dell'elemento
            const index = await utils.findInList(vidPid, ids.usbRedirection.vidPid, 1, length)

            if(index > 0) return true
            else return false
        }
    },

    startup: {
        //ritorna true se ha creato la startup, altrimenti false, null se qualcosa non ha funzionato
        /**
         * Add a startup
         * @param  {string} name This is the name of the startup to add
         * @param  {string} command This is the command of the startup to add
         * @return {boolean | null} True if the startup has been added, false otherwise, null in case of errors
         */
        addStartup: async function(name, command){
            //va in startup
            if(await utils.click(ids.startup.menuID) == false) return null

            await utils.sleep(1000)

            //preme su Add startup
            if(await utils.click(ids.startup.addStartup.button) == false) return null

            await utils.sleep(1000)

            //inserisce nome 
            if(await utils.insertText(ids.startup.addStartup.name, name) == false) return null

            await utils.sleep(1000)

            //inserisce comando 
            if(await utils.insertText(ids.startup.addStartup.command, command) == false) return null

            await utils.sleep(1000)

            //conferma premendo ok
            if(await utils.click(ids.usbRedirection.addRule.ok, false) == true) return true
            else return false
            
        }
    },
    
    remoteAssistance: {
        /**
         * Enable remote assistance
         * @return {boolean | null} True if remote assistance is enable, false otherwise, null in case of errors
         */
        enableRemoteAssistance: async function(){
            //va nella sezione remote assistance
            if(await utils.click(ids.remoteAssistance.menuID) == false) return null

            await utils.sleep(1000)

            var val = null
            var isEnable = false
            try{
                val = await global.app.client.$(ids.remoteAssistance.enable).getValue()
            }catch{
                return null
            }
            if(val == "false"){
                try{
                    await global.app.client.$(ids.remoteAssistance.labelEnable).click()
                    isEnable = true
                }catch{
                    return null
                }
            }else if(val == "true"){
                isEnable = true
            }
            
            return isEnable
        },
        /**
         * Set auto-accept and the timeout value
         * @param  {string | number} v This is the value to set to the timeout
         * @return {boolean | null} True if remote assistance and require user authentication are enable and the timeout is correct, false otherwise, null in case of errors
         */
        setAutoAccept: async function(v){
            await utils.remoteAssistance.enableRemoteAssistance()

            await utils.sleep(500)

            var val = null
            try{
                val = await global.app.client.$(ids.remoteAssistance.requireAuthorization).getValue()
            }catch{
                return null
            }
            if(val == "false"){
                try{
                    await global.app.client.$(ids.remoteAssistance.labelRequireAuthorization).click()
                }catch{
                    return null
                }
            }

            await utils.sleep(500)

            var isEnable = false
            val = null
            try{
                val = await global.app.client.$(ids.remoteAssistance.autoAccept).getValue()
            }catch{
                return null
            }
            if(val == "false"){
                try{
                    await global.app.client.$(ids.remoteAssistance.labelAutoAccept).click()
                    isEnable = true
                }catch{
                    return null
                }
            }else if (val == "true"){
                isEnable = true
            }

            await utils.sleep(500)

            //insertText non funziona qui
            if(isEnable){
                if(await utils.insertTextPromise(ids.remoteAssistance.timeAutoAccept, v) == false) return null
            }

            await utils.sleep(1000)
            
            //preme sul menù per confermare 
            if(await utils.click(ids.remoteAssistance.menuID) == false) return null

            await utils.sleep(500)

            const radb = await db.getRemoteAssistance()
            
            return (radb.enabled && radb.acceptance.allow_reject && radb.acceptance.auto_accept == v)
            
        }
    },
    
    agileAuthentication: {
        //input: 
            //ssid: ssid della wifi da scegliere
        //output: 
            //true se l'ssid è corretto, altrimenti false, null se qualcosa non ha funzionato
        checkWifiAuthenticationSsid: async function(ssid){
            var done = true
            //va nella sezione agile authentication
            const menu = global.app.client.$(info.AGILE_AUTHENTICATION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            const dropdown = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.input-field > div > input")
            var dataActivates = null
            try{
                dropdown.click()
                dataActivates = await dropdown.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            const wifi = global.app.client.$("#"+dataActivates+" > li:nth-child(2)")
            try{
                wifi.click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            try{
                global.app.client.$("#wifi").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            var ret = null
            try{
                ret = await global.app.client.$("span.network-ssid=" + ssid).click();
            }catch{
                ret = null
            }
            if(done){
                return ret != null
            }else{
                return null
            }
        },

        //input: 
            //ssid: ssid della wifi da scegliere
            //password: password della wifi da scegliere
        //output: 
            //true se tutto è andato a buon fine, altrimenti false
        addWifiAuthentication: async function(ssid, password){
            var done = true
            var classe = null

            await this.checkWifiAuthenticationSsid(ssid)

            await utils.sleep(500)

            const auth = global.app.client.$("#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(2) > div > div > input")
            var dataActivates = null
            try{
                auth.click()
                dataActivates = await auth.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                global.app.client.$("#"+dataActivates+" > li:nth-child(4)").click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            const base = "#main-div > div > main > section > div > ul > li > div.collapsible-body > div.row:nth-child(4) > div > div"
            const psw = global.app.client.$(base+" > input")

            try{
                psw.click()
                await psw.setValue(password)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //clicca altrove per confermare 
            try{
                global.app.client.$(info.AGILE_AUTHENTICATION).click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            try{
                classe = await global.app.client.$(base).getAttribute("class")
            }catch{
                done = false
            }

            if(done){
                return classe == "password-element"
            }else{
                return null
            }   
        },

        addImprivata: async function(address){
            var done = true
            //va nella sezione agile authentication
            const menu = global.app.client.$(info.AGILE_AUTHENTICATION);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //apre dropdown di scelta
            const dropdown = global.app.client.$("#main-div > div.main-content > main > section > div > div > div.input-field > div > input")
            var dataActivates = null
            try{
                dropdown.click()
                dataActivates = await dropdown.getAttribute("data-activates")
            }catch{
                done = false
            }


            await utils.sleep(500)


            //sceglie imprivata
            const imprivata = global.app.client.$("#"+dataActivates+" > li:nth-child(3)")
            try{
                await imprivata.click()
            }catch{
                done = false
            }

            await utils.sleep(500)


            //inserisce l'address 
            try{
                await global.app.client.$("#addres").setValue(address)
            }catch{
                done = false
            }


            await utils.sleep(500)


            //spunta ignora errori ssl
            try{
                if(await global.app.client.$("#ignoreSSL").getValue() == "false"){
                    await global.app.client.$("#main-div > div.main-content > main > section > div > ul > li > div.collapsible-body > div.row.align-children.top-element > div.col.s4 > div > label").click()
                }
            }catch{
                done = false
            }

            await utils.sleep(500)


            //preme altrove per confermare
            try{
                await global.app.client.$(info.AGILE_AUTHENTICATION).click()
            }catch{
                done = false
            }


            await utils.sleep(500)


            var ret = null
            var error = null
            var addressText = null
            try{
                error = await global.app.client.$("#addres").getAttribute("aria-invalid")
                addressText = await global.app.client.$("#addres").getValue()
            }catch{
                done = false
            }
            if(error == "true" || addressText == ""){
                ret = false
            }else if(error == "false" && addressText != ""){
                ret = true
            }



            if(done){
                return ret == true
            }else{
                return null
            }
        }
    },

    certificateManager: {
        getAgileListLength: async function(){
            var done = true
            //va in certificati
            const menu = global.app.client.$(info.CERTIFICATE_MANAGER);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //itera nella lista e ne conta le righe 
            const list = "#main-div > div.main-content > main > section > div.section-wrapper"
            var num = 0
            var cont = true
            var x = null
            while(cont){
                x=null
                try{
                    x = await global.app.client.$(list + " > div:nth-child("+num+1+") > div").getHTML()
                    if(x != null) num++
                }catch{
                    cont = false
                }
            }

            if(done){
                return num
            }else{
                return null
            }
        },
        
        addCertificate: async function(name){

            const certNumber = await utils.certificateManager.getAgileListLength()
            var done = true
            //va in certificati
            const menu = global.app.client.$(info.CERTIFICATE_MANAGER);
            try{
                await menu.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)


            //clicca su import certificate
            const importCertificate = global.app.client.$("#main-div > div.main-content > main > section > div.fixed-header > div > div > div.waves-effect.btn-flat > span > i");
            try{
                await importCertificate.click();
            }catch{
                done = false
            }
            global.app.client.waitUntilWindowLoaded();


            await utils.sleep(1000)

            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(name) == false){
                done = false
            }

            await utils.sleep(1000)

            var ret = false
            if(await utils.certificateManager.getAgileListLength() > certNumber){
                ret = true
            }

            if(done){
                return ret
            }else{
                return null
            }
        }
    }
    
}

module.exports = {utils}
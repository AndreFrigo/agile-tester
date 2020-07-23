const {db} = require ("./db.js");
const {global} = require ("./global.js");
const {info} = require("./set-before-test.js")
const ids = require("./selectors.js")
var robot = null
const path = require("path")

const utils={
    /**
     * Wait some time
     * @param {number} time This is the time to wait in milliseconds
     */
    sleep : time => new Promise(r => setTimeout(r, time)),
    /**
     * Start the application
     */
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
                ok = await global.app.client.$(ids.about.menuID).getText()
            }catch{
                ok = null
                await utils.sleep(1000)
            }
        }
        
    },
    /**
     * Wait for a pop-up to appear
     * @param  {string} type This is the type of notification: {"success" | "warning" | "error"}
     * @param  {number} time This is the max time to wait (divided by 2)
     * @return {boolean} True if the pop-up has shown in time, false otherwise
     */
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
    /**
     * Select the file with the given name, it has to be in the folder agile-tester/files
     * @param  {string} fileName This is the name of the file to choose
     * @return {boolean} True if everything was right, false if there were errors
     */
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
     * Wait max 20 seconds for an element to be available
     * @param  {string} id This is the id of the element that has to be available
     * @param  {boolean} condition This is the initial condition to stop the loop
     */
    waitForExist: async function(id, condition = false){
        await new Promise(async function(resolve, reject){
            if(condition) resolve()
            var time = 0
            var el = null
            while(el == null && time < 10){
                try{
                    el = await global.app.client.$(id).getHTML()
                }catch{
                    el = null
                }
                utils.sleep(2000)
                time++
            }
            resolve()
        })
        return
    },
    /**
     * Click on an element given his id (wait max 20 sec for it to be enable)
     * @param  {string} id This is the ID ot the object to click
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {boolean} True if the element was clicked, false in case of error
     */
    click: async function(id, printError = true){
        await utils.waitForExist(id)
        try{
            await global.app.client.$(id).click()
        }catch(err){
            if(printError){
                console.log("Error while clicking element with id: " + id)
                console.log("ERROR: " + err)
            }
            return false
        }
        await global.app.client.waitUntilWindowLoaded()
        return true
    },
    /**
     * Insert a text in the text field with the given ID (wait max 20 sec for it to be enable)
     * @param  {string} id This is the ID ot the text field
     * @param  {string} text This is the text to set to the text field
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {boolean} True if the text was inserted, false in case of error
     */
    insertText: async function(id, text, printError = true){
        await utils.waitForExist(id)
        try{
            await global.app.client.$(id).setValue(text)
        }catch(err){
            if(printError){
                console.log("Error while inserting text: " + text + " to the element with id: " + id)
                console.log("ERROR: "+err)
            }
            return false
        }
        await global.app.client.waitUntilWindowLoaded()
        return true
    },
    /**
     * Find an element in the Agile list (wait max 20 sec for it to be enable)
     * @param  {string | string[]} elemName This is the name of the element to find, can be a string or an array, the first occurence is returned
     * @param  {string} nameId Id of the html element that contains the name 
     * @param  {number} startIndex Start index for iteration
     * @param  {number} listLength Length of the Agile list
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @param  {object} app Application running, default: global.app  
     * @return {number} Index of the element founded, -1 if no element was found
     */
    findInList: async function(elemName, nameId, startIndex, listLength, printError = true, app = global.app){
        await utils.waitForExist(nameId(startIndex), listLength <= 0)
        var n = null
        for(i = startIndex; i < startIndex + listLength; i++){
            //salva il nome dell'elemento
            try{
                n = await app.client.$(nameId(i)).getText()
            }catch(err){
                if(printError){
                    console.log("Error while getting name of the element with id: " + nameId(i))
                    console.log("ERROR: "+err)
                }
            }
            const ret = await new Promise(function(resolve, reject){
                //controlla se i nomi coincidono
                if(typeof elemName == "string"){
                    if(elemName == n){
                        resolve(i)
                    }
                }else{
                    elemName.forEach(elem => {
                        if(elem == n){
                            resolve(i)
                        }
                    })
                }
                resolve(-1)
            })
            if(ret != -1) return ret
        }
        return -1
    },
    /**
     * Insert a text in the text field with the given ID using promises, this function is used instead of insertText when it does not work (wait max 20 sec for it to be enable)
     * @param  {string} id This is the ID ot the text field
     * @param  {string} text This is the text to set to the text field
     * @param  {boolean} printError If true in case of error, it prints in the console the error, default: true
     * @return {boolean} True if the text was inserted, false in case of error
     */
    insertTextPromise: async function(id, text, printError = true){
        await utils.waitForExist(id)
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
    /**
     * Get an attribure of an element (wait max 20 sec for it to be enable)
     * @param  {string} id This is the id of the element
     * @param  {string} attribute This is the attribute 
     * @param  {boolean} click If true it clicks the element before getting his attribute, if false otherwise, defaule true
     * @return {string | null} Return the attribute, null in case of errors
     */
    getAttribute: async function(id, attribute, click = true){
        await utils.waitForExist(id)
        var attr = null
        try{
            if(click) global.app.client.$(id).click()
            attr = await global.app.client.$(id).getAttribute(attribute)
        }catch(err){
            if(click) console.log("Error while clicking or getting attribute from element with id: " + id)
            else console.log("Error while getting attribute from element with id: " + id)
            console.log("ERROR: " + err)
            return null
        }
        return attr
    },
    /**
     * Get the value of an element (wait max 20 sec for it to be enable)
     * @param  {string} id This is the id of the element
     * @return {string | null} Return the value, null in case of errors
     */
    getValue: async function(id){
        await utils.waitForExist(id)
        var val = null
        try{
            val = await global.app.client.$(id).getValue()
        }catch(err){
            console.log("Error while getting value of element with id: " + id)
            console.log("ERROR: " + err)
            return null
        }
        return val
    },

    systemSettings: {
         /**
         * Choose english as Agile language
         * @param  {boolean} checkLabel If true then read the text of the menu to confirm the language has changed, else only click to the language, default false
         * @return {boolean | null} True if english has been selected, false otherwise, null in case of errors
         */
        chooseEnglish: async function(checkLabel = false){
            //va nelle impostazioni di sistema
            if(await utils.click(ids.systemSettings.menuID) == false) return null

            await utils.sleep(1000)

            //va nella sezione lingua
            if(await utils.click(ids.systemSettings.language.languageTab) == false) return null

            await utils.sleep(1000)
            
            //string contenente "Lingua di Agile" nelle diverse lingue 
            var agileLanguage = null
            //stringa contenente il selector per la lingua da usare in seguito
            var sel = null
            
            //testo da confrontare
            switch(await db.dbLanguage()){
                case 1:{
                    agileLanguage = "Lingua di Agile"
                    sel = "span=Inglese"
                    break
                }
                case 2:{
                    agileLanguage = "Agile language"
                    sel = "span=English"
                    break
                }
                case 3:{
                    agileLanguage = "Idioma de Agile"
                    sel = "span=Inglés"
                    break
                }
                default:{
                    agileLanguage = "error"
                    sel = "error"
                    break
                }
            }
            //indice elemento
            var index = null
            //c'è un header prima dei div, quindi l'indice parte da 2 al posto che da 1
            var i = 2
            var text = null
            var cont = true
            //attendo solo per il primo
            await utils.waitForExist(ids.systemSettings.language.label(i))
            while(cont){
                try{
                    text = await global.app.client.$(ids.systemSettings.language.label(i)).getText()
                }catch{
                    cont = false
                }
                if(text == agileLanguage){
                    index = i
                }
                i ++
            }
            
            //clicca sul dropdown corrispondente ad agile language
            if(await utils.click(ids.systemSettings.language.dropdown(index)) == false) return null

            await utils.sleep(1000)

            //clicca nella lingua inglese
            const ret = await utils.click(sel)

            if(!checkLabel){
                if(ret == true) return true
                else return false
            }else{
                await utils.sleep(1000)
                var lan = null
                try{
                    lan = await global.app.client.$(ids.systemSettings.menuID).getText()
                }catch(err){
                    console.log("Error while getting text of element with id: " + ids.systemSettings.menuID)
                    console.log("ERROR: " + err)
                    lan = null
                }
                return lan == "System Settings"
            }
            
        },
        /**
         * Set output volume
         * @param  {number} val This is the volume to set
         * @return {boolean | null} True if the volume changed correctly (+-1 margin), false otherwise, null in case of errors
         */
        setAudio: async function(val){
            //va nelle impostazioni di sistema
            if(await utils.click(ids.systemSettings.menuID) == false) return null

            await utils.sleep(1000)

            //va nella sezione audio
            if(await utils.click(ids.systemSettings.sound.soundTab) == false) return null

            await utils.sleep(1000)

            var widthElem = null
            await utils.waitForExist(ids.systemSettings.sound.outputVolume)
            try{
                widthElem = await global.app.client.getCssProperty(ids.systemSettings.sound.outputVolume, "width")
            }catch(err){
                console.log("Error while getting css width of element with id: " + ids.systemSettings.sound.outputVolume)
                console.log("ERROR: " + err)
                return null
            }

            var width = null
            width = widthElem.parsed.value
            
            //formula ricavata dal grafico x: expected value, y: actual value. L'equazione della retta è y = 1.1x - 6, viene concesso un errore di +-1 a causa dell'approssimazione 
            var x = Math.round(((val + 6)/1.1)*width/100)   

            //opzions deprecated
            try{
                await global.app.client.moveToObject("#outputVolume",x,0)
                await utils.sleep(1000)
                await global.app.client.buttonPress()
                await global.app.client.buttonPress()
                await global.app.client.buttonPress()
            }catch(err){
                console.log("Error in moveToObject or buttonPress")
                console.log("ERROR: " + err)
                return null
            }

            await utils.sleep(500)

            //legge il valore attuale dall'interfaccia agile
            var currentValue = null
            await utils.waitForExist(ids.systemSettings.sound.outputLevel)
            try{
                currentValue = await global.app.client.$(ids.systemSettings.sound.outputLevel).getText()
            }catch(err){
                console.log("Error while getting text of element with id: " + ids.systemSettings.sound.outputLevel)
                console.log("ERROR: " + err)
                return null
            }
            try{
                if(currentValue <= val + 1 && currentValue >= val -1) return true
                else return false
            }catch(err){
                console.log("Error with condition")
                console.log("ERROR: " + err)
                return null
            }

        }
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
         
        },
        /**
         * Search for a wifi in the Agile list
         * @param  {string} ssid This is the ssid of the wifi to search
         * @return {boolean | null} True if the wifi is in the list, false otherwise, null in case of errors
         */
        isInAgileList: async function(ssid){
            //Va nella sezione impostazioni di rete
            if(await utils.click(ids.networkSettings.menuID) == false) return null

            await utils.sleep(1000)

            //Va nella sezione wifi
            if(await utils.click(ids.networkSettings.wifi.wifiTab) == false) return null

            await utils.sleep(1500)

            const length = await db.getWifiListLength();
            
            var name = null;
            for(i = 1; i<= length; i++){
                try{
                    await utils.waitForExist(ids.networkSettings.wifi.ssid(i))
                    name = await global.app.client.$(ids.networkSettings.wifi.ssid(i)).getText();
                    if(name.slice(14) == ssid){
                        return true
                    }
                }catch(err){
                    console.log("Error while getting text from element with id: " + ids.networkSettings.wifi.ssid(i))
                    console.log("ERROR: " + err)
                    return null
                }
            }
            return false
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
            if(vid != null && pid != null) vidPid = "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid = "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid = "Vid: " + vid

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
            if(vid != null && pid != null) vidPid = "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid = "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid = "Vid: " + vid
            
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
            const index = await utils.findInList(indirizzo+": "+ address, ids.thinmanSettings.address, 1, length)
            if(index == -1) return false
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
            const index = await utils.findInList(indirizzo+": "+ address, ids.thinmanSettings.address, 1, length)

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
            if(vid != null && pid != null) vidPid = "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid = "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid = "Vid: " + vid
            
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
            if(vid != null && pid != null) vidPid = "Vid: " + vid + ", Pid: " + pid
            else if((vid == null || vid == "") && pid != null) vidPid = "Pid: " + pid
            else if(vid != null && (pid == null || pid == "")) vidPid = "Vid: " + vid
            
            //indice dell'elemento
            const index = await utils.findInList(vidPid, ids.usbRedirection.vidPid, 1, length)

            if(index > 0) return true
            else return false
        }
    },

    startup: {
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
            if(await utils.click(ids.startup.addStartup.ok, false) == true) return true
            else return false
            
        },
        /**
         * Check if a startup is in the list
         * @param  {string} name This is the name of the startup
         * @param  {string} command This is the command of the startup
         * @return {boolean | null} True if the startup is in the list, false otherwise, null in case of errors
         */
        isInAgileList: async function(name, command){
            //va in startup
            if(await utils.click(ids.startup.menuID) == false) return null

            await utils.sleep(1000)
            const length = await db.getStartupListLength();
            var n = null;
            var c = null;
            for(i = 0; i < length; i++){
                //nome della startup nella lista
                try{
                    await utils.waitForExist(ids.startup.name(i))
                    n = await global.app.client.$(ids.startup.name(i)).getText();
                }catch(err){
                    console.log("Error while getting attribute from element with id: " + ids.startup.name(i))
                    console.log("ERROR: " + err)
                    return null
                } 
                //comando della startup nella lista
                try{
                    await utils.waitForExist(ids.startup.command(i))
                    c = await global.app.client.$(ids.startup.command(i)).getText();
                }catch(err){
                    console.log("Error while getting attribute from element with id: " + ids.startup.command(i))
                    console.log("ERROR: " + err)
                    return null
                } 

                if(n == name && c == command){
                    return true
                }
            }
            return false
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
            val = await utils.getValue(ids.remoteAssistance.enable)
            if(val == null) return null
            if(val == "false"){
                return await utils.click(ids.remoteAssistance.labelEnable)
            }else if(val == "true"){
                return true
            }
            
            return false
        },
        /**
         * Check show notification icon
         * @return {boolean | null} True if notification icon is checked, false otherwise, null in case of errors
         */
        showNotificationIcon: async function(){
            await utils.remoteAssistance.enableRemoteAssistance()
            await utils.sleep(500)
            var val = null
            val = await utils.getValue(ids.remoteAssistance.showNotificationIcon)
            if(val == null) return null
            if(val == "false"){
                return await utils.click(ids.remoteAssistance.labelShowNotificationIcon)
            }else if (val == "true"){
                return true
            }else return null
             
        },
        /**
         * Check user authentication
         * @return {boolean | null} True if user authentication is checked, false otherwise, null in case of errors
         */
        userAuthentication: async function(){
            await utils.remoteAssistance.enableRemoteAssistance()
            await utils.sleep(500)
            var val = null
            val = await utils.getValue(ids.remoteAssistance.requireAuthorization)
            if(val == null) return null
            if(val == "false"){
                return await utils.click(ids.remoteAssistance.labelRequireAuthorization)
            }else if (val == "true"){
                return true
            }else return null

        },
        /**
         * Set auto-accept and the timeout value
         * @param  {string | number} v This is the value to set to the timeout
         * @return {boolean | null} True if remote assistance and require user authentication are enable and the timeout is correct, false otherwise, null in case of errors
         */
        setAutoAccept: async function(v){
            if(await utils.remoteAssistance.userAuthentication() == null) return null

            await utils.sleep(500)

            var isEnable = false
            val = null
            val = await utils.getValue(ids.remoteAssistance.autoAccept)
            if(val == null) return null
            if(val == "false"){
                if(await utils.click(ids.remoteAssistance.labelAutoAccept) == true) isEnable = true
                else return null
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
        /**
         * Choose a wifi for authentication given the ssid
         * @param  {string} ssid This is the ssid of the wifi to choose
         * @return {boolean | null} True if the ssid is correct, false otherwise, null in case of errors
         */
        checkWifiAuthenticationSsid: async function(ssid){
            //va nella sezione agile authentication
            if(await utils.click(ids.agileAuthentication.menuID) == false) return null

            await utils.sleep(1000)

            //dropdown per scegliere il tipo di autenticazione
            var dataActivates = null
            dataActivates = await utils.getAttribute(ids.agileAuthentication.dropdown, "data-activates")
            if(dataActivates == null) return null

            await utils.sleep(500)

            //clicca sull'opzione wifi
            if(await utils.click(ids.agileAuthentication.wifi.selector(dataActivates)) == false) return null

            await utils.sleep(500)

            //apre il dropdown con lista wifi disponibili
            if(await utils.click(ids.agileAuthentication.wifi.dropdown) == false) return null

            await utils.sleep(500)

            //clicca sulla wifi con ssid corrispondente
            return await utils.click("span.network-ssid=" + ssid, false)

        },
        /**
         * Set authentication with wifi
         * @param  {string} ssid This is the ssid of the wifi to connect
         * @param  {string} password This is the password of the wifi to connect
         * @return {boolean | null} True if the wifi has been added, false otherwise, null in case of errors
         */
        addWifiAuthentication: async function(ssid, password){
            if(await this.checkWifiAuthenticationSsid(ssid) == false) return false

            await utils.sleep(500)

            //dropdown per il tipo di autenticazione
            var dataActivates = null
            dataActivates = await utils.getAttribute(ids.agileAuthentication.wifi.authentication, "data-activates")
            if(dataActivates == null) return null

            await utils.sleep(500)

            //scelta tipo autenticazione
            if(await utils.click("#"+dataActivates+" > li:nth-child(4)") == false) return null

            await utils.sleep(500)

            //inserisce password
            if(await utils.insertText(ids.agileAuthentication.wifi.passwordInput, password) == false) return null

            await utils.sleep(500)

            //clicca nel menu per confermare 
            if(await utils.click(ids.agileAuthentication.menuID) == false) return null

            await utils.sleep(500)

            //attributto class del text field per la password
            var classe = null
            classe = await utils.getAttribute(ids.agileAuthentication.wifi.passwordField, "class", false)
            if(classe == null) return null

            //se la password è corretta allora la classe sarà password-element, altrimenti no
            return classe == "password-element"
               
        },
        /**
         * Set authentication with imprivata
         * @param  {string} address This is the address of the imprivata
         * @return {boolean | null} True if the imprivata has been added, false otherwise, null in case of errors
         */
        addImprivata: async function(address){
            //va nella sezione agile authentication
            if(await utils.click(ids.agileAuthentication.menuID) == false) return null

            await utils.sleep(1000)

            //dropdown per scegliere il tipo di autenticazione
            var dataActivates = null
            dataActivates = await utils.getAttribute(ids.agileAuthentication.dropdown, "data-activates")
            if(dataActivates == null) return null

            await utils.sleep(500)

            //clicca sull'opzione wifi
            if(await utils.click(ids.agileAuthentication.imprivata.selector(dataActivates)) == false) return null

            await utils.sleep(500)

            //inserisce l'address 
            if(await utils.insertText(ids.agileAuthentication.imprivata.address, address) == false) return null

            await utils.sleep(500)

            //spunta ignora errori ssl
            var ignore = null
            ignore = await utils.getValue(ids.agileAuthentication.imprivata.ignoreSsl)
            if(ignore == null) return null
            if(ignore == "false" && await utils.click(ids.agileAuthentication.imprivata.labelIgnoreSsl) == false) return null

            await utils.sleep(500)

            //preme altrove per confermare
            if(await utils.click(ids.agileAuthentication.menuID) == false) return null

            await utils.sleep(500)

            //controlli finali
            var error = null
            var addressText = null
            error = await utils.getAttribute(ids.agileAuthentication.imprivata.address, "aria-invalid")
            addressText = await utils.getValue(ids.agileAuthentication.imprivata.address)
            if(error == null || addressText == null) return null

            if(error == "true" || addressText == ""){
                return false
            }else if(error == "false" && addressText != ""){
                return true
            }

        }
    },

    certificateManager: {
        /**
         * Get certificate agile list length
         * @return {number | null} The number of certificate, null in case of errors
         * @return {boolean | null} True if the imprivata has been added, false otherwise, null in case of errors
         */
        getAgileListLength: async function(){
            //va in certificati
            if(await utils.click(ids.certificateManager.menuID) == false) return null

            await utils.sleep(1000)

            await utils.waitForExist(ids.certificateManager.list)
            //itera nella lista e ne conta le righe 
            var num = 0
            var cont = true
            var x = null
            while(cont){
                x=null
                try{
                    x = await global.app.client.$(ids.certificateManager.list + " > div:nth-child("+num+1+") > div").getHTML()
                    if(x != null) num++
                }catch{
                    cont = false
                }
            }

            return num
        },
        /**
         * Add a certificate
         * @param  {string} name The name of the certificate to add
         * @return {boolean | null} True if the certificate has been added, false otherwise, null in case of errors
         */
        addCertificate: async function(name){
            const certNumber = await utils.certificateManager.getAgileListLength()
            if(certNumber == null) return null
            //va in certificati
            if(await utils.click(ids.certificateManager.menuID) == false) return null

            await utils.sleep(1000)

            //clicca su import certificate
            if(await utils.click(ids.certificateManager.importCertificate) == false) return null

            await utils.sleep(1000)

            //inserisce il nome del file nel file picker (deve trovarsi nella directory agile-tester/files)
            if(await utils.fileChooser(name) == false){
                return null
            }

            await utils.sleep(1000)

            const actualCertNumber = await utils.certificateManager.getAgileListLength()
            if(actualCertNumber == null) return null

            //controlla che il numero di certificati attuali sia maggiore di quello precedente
            if(actualCertNumber > certNumber) return true
            else return false

        }
    },
    agileMode: {
        /**
         * Check if a resource is in the list
         * @param  {string} name This is the name of the resource 
         * @param  {object} app This is the application running 
         * @return true if the resource is in the list, false otherwise
         */
        checkResource: async function(name, app){
            const length = await db.getResourceListLength()
            if(await utils.findInList(name, ids.mode.agile.resourceName, 1, length, true, app) != -1) return true
            return false
        }
    }
    
}

module.exports = {utils}
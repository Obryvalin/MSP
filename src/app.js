const fs = require("fs")
const pgsql = require("./utils/pgsql");
const xml = require("./utils/xml")
const path = require("path");
const chalk = require("chalk");
const log = require("./utils/log")

const appoptions = JSON.parse(fs.readFileSync("conf/app.json").toString());
var { dataDir } = appoptions;

dataDir = path.join(__dirname+dataDir)

const load = (callback)=>{
    fs.readdir(dataDir,(err,files)=>{
        if (err || !files) {
            console.log ("No Files / Dir Error "+dataDir)
            callback()
        }
        log.timestamp("Files found:"+ files.length)
        files.forEach((file)=>{
            log.timestamp("File: "+ chalk.bold(file))
            fs.readFile(path.join(dataDir,file),(err,filecontent)=>{
                if (err) {log.timestamp(chalk.red("Error in "+ file + ": "+err))}
                xml.toJSON(filecontent.toString(),(err,json)=>{
                    if (err){log.timestamp(chalk.red("Error in "+ file + ": "+err))}
                    pgsql.addData(json,()=>{
                        log.timestamp("File "+ chalk.bold(file)+" added")
                    })
                    // fs.writeFile(path.join(dataDir,file).replace(".xml",".json"),JSON.stringify(json),()=>{})
                })
            })
           
           
            
        })
    })
}
command = process.argv[2]
console.log(command)
if (command == "load"){
    load()
}
if (command == "init"){
    pgsql.backup(()=>{
        pgsql.init()
    })
}

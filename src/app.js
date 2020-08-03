const fs = require("fs");
const pgsql = require("./utils/pgsql");
const xml = require("./utils/xml");
const path = require("path");
const chalk = require("chalk");
const log = require("./utils/log");

const appoptions = JSON.parse(fs.readFileSync("conf/app.json").toString());
var { dataDir } = appoptions;

dataDir = path.join(__dirname + dataDir);

const load = (callback) => {
  queries = [];
  cnt = 0;
  fs.readdir(dataDir, (err, files) => {
    if (err || !files) {
      console.log("No Files / Dir Error " + dataDir);
      callback();
    }
    log.timestamp("Files found:" + files.length);
    files.forEach((file) => {
      log.timestamp("File: " + chalk.bold(file));
      let filecontent = fs.readFileSync(path.join(dataDir, file));
      if (err) {
        log.timestamp(chalk.red("Error in " + file + ": " + err));
      }
      xml.toJSON(filecontent.toString(), (err, json) => {
        if (err) {
          log.timestamp(chalk.red("Error in " + file + ": " + err));
        }
        pgsql.addData(json, (err, resarray) => {
          queries = queries.concat(resarray);
          log.timestamp(
            "File " + chalk.bold(file) + " added (" + resarray.length + " sqls)"
          );
          cnt += 1;
        });
        // fs.writeFile(path.join(dataDir,file).replace(".xml",".json"),JSON.stringify(json),()=>{})
      });
    });

    const interid = setInterval(() => {
      if (cnt == files.length) {
        clearInterval(interid);
        log.timestamp("Finished reading");
        pgsql.multiquery(queries, () => {
          log.timestamp("SQL executed");
        });
      }
    }, 1000);
  });
};
command = process.argv[2];
console.log(command);
if (command == "load") {
  load();
}
if (command == "init") {
  pgsql.backup(() => {
    pgsql.init();
  });
}

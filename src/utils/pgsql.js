const chalk = require("chalk");
const{Pool} = require("pg");
const fs = require("fs");
const msp = require("./msp")

const path = require("path")
const log = require("./log")

const pgoptions = JSON.parse(fs.readFileSync("conf/pg.json").toString());
const { dropQueries, createQueries, backupdir} = pgoptions;
if (!fs.existsSync(backupdir)){fs.mkdirSync(backupdir)};
//log.timestamp(pgoptions);
pool = new Pool(pgoptions)

const query = (sql,callback) =>{
  // log.timestamp(sql);
  pool.query(sql, (err, res) => {
    if (err) {
      logError("PGSQL query error for request: "+chalk.greenBright(sql))
      logError(chalk.red(err));
      if (callback){callback(err,undefined)}
    }
    if (!err) {
      
      if (callback){callback(undefined,res);}
    }
    
  });
}

const multiquery = (queries, callback) => {
  const qcnt = queries.length;
  var endedPool;
  if (qcnt == 0) {
    callback();
  }
  var donecnt = 0;
  
  queries.forEach((query) => {
    
    pool.query(query, (err, res) => {
      if (err) {
        log.timestamp(chalk.red(err))
        log.timestamp("Query was: "+query)
        logError(chalk.red(err));
      }
      donecnt = donecnt + 1;
    });
  });
  const intid = setInterval(() => {
    log.timestamp(donecnt+"/"+qcnt)
    if (donecnt == qcnt) {
      clearInterval(intid);
    
      callback();
    }
    if (donecnt > qcnt){
      console.log("Multiquery error! Donecnt:"+donecnt+", qcnt:"+qcnt)
    }
    
  }, 50);
};

const backup = (callback) => {
  date = new Date();
  datedir = "" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
  const backup = path.join(__dirname, backupdir,"\\",datedir);
  try {
    if (!fs.existsSync(backupdir)){fs.mkdirSync(backupdir)};
    if (!fs.existsSync(backup)){fs.mkdirSync(backup)};
  } catch (e) {
    log.timestamp(e)
  }
  log.timestamp("BACKUP to: " + backup);
  //fs.copyFileSync('/data/*',backup)
    
  const sqls = [];
  query(
    "select tablename from pg_tables where schemaname = 'public'",
    (error, result) => {
      log.timestamp("Backuping Database");
      log.timestamp(result.rows);
      result.rows.forEach((row) => {
        sqls.push(
          "COPY " + row.tablename + " TO '" + backup + "\\" + row.tablename + ".csv' DELIMITER ';' CSV HEADER;"
        );
      });
      multiquery(sqls, () => {
        log.timestamp("Backup complete!");
        if (callback) {
          callback();
        }
      });
    }
  );
};

const init = () => {
  log.timestamp(chalk.underline.bold("Initializing database tables"))
 

  multiquery(dropQueries,() => {
    log.timestamp("Tables droped!")
    multiquery(createQueries,()=>{
      log.timestamp("Tables created!")
      pool.end();
      log.timestamp("Init completed!")});
  });

  
};

const logError = (error) =>{
  if(error) query("INSERT into errorlog(error,datetime) values('"+error+"',CURRENT_TIMESTAMP)");
}

//-------------------------------------------------------------------------------------------------------

const addData = (json,callback) =>{
  let resarray =[]
    njson = msp.map(json)
    if (njson.documents){
        if(Array.isArray){
            njson.documents.forEach((document)=>
            {
                sql = "insert into document (id,actualdate ,startdate ,subjtype ,subjcategory ,subjnew ,subjcategorydesc ,inn ,sname ,fname ,pname ,region ,orgname ,shortname ,type) values('"+document.id+"','"+document["@ДатаСост"]+"','"+document["@ДатаВклМСП"]+"',"+document["@ВидСубМСП"]+","+document["@КатСубМСП"]+","+document["@ПризНовМСП"]+",'"+document.subjcategorydesc+"','"+document.inn+"','"+document.sname+"','"+document.fname+"','"+document.pname+"','"+document.region+"','"+document.ogrname+"','"+document.shortname+"','"+document.type+"')"
                resarray.push(sql)

            })
        } else{
          sql = "insert into document (id,actualdate ,startdate ,subjtype ,subjcategory ,subjnew ,subjcategorydesc ,inn ,sname ,fname ,pname ,region ,orgname ,shortname ,type) values('"+documents.id+"','"+documents["@ДатаСост"]+"','"+documents["@ДатаВклМСП"]+"',"+documents["@ВидСубМСП"]+","+documents["@КатСубМСП"]+","+documents["@ПризНовМСП"]+",'"+documents.subjcategorydesc+"','"+documents.inn+"','"+documents.sname+"','"+documents.fname+"','"+documents.pname+"','"+documents.region+"','"+documents.ogrname+"','"+documents.shortname+"','"+documents.type+"')"
          resarray.push(sql)
        }
    }
    if (njson.rokveds){
      if(Array.isArray){
          njson.rokveds.forEach((okved)=>
          {
              sql = "insert into okved (id,code,okved,version,ismain) values('"+okved.id+"','"+okved["@КодОКВЭД"]+"','"+okved["@НаимОКВЭД"]+"',"+okved["@ВерсОКВЭД"]+","+okved.isMain+")"
              resarray.push(sql)
              
          })
      } else{
        sql = "insert into okved (id,code,okved,version,ismain) values('"+rokveds.id+"','"+rokveds["@КодОКВЭД"]+"','"+rokveds["@НаимОКВЭД"]+"',"+rokveds["@ВерсОКВЭД"]+","+rokveds.isMain+")"
        resarray.push(sql)
      } 
  }
  if (njson.rlicneces){
    if(Array.isArray){
        njson.rlicneces.forEach((licence)=>
        {
            sql = "insert into document (id,licname,licdate,licdatestart,licdateend,licdesc,licaddr) values('"+licence.id+"','"+licence["@НомЛиценз"]+"','"+licence["@ДатаЛиценз"]+"','"+licence["@ДатаНачЛиценз"]+"','"+licence["@ДатаКонЛиценз"]+"','"+licence["@НаимЛицВД"]+"')"
            resarray.push(sql)
            
        })
    } else{
      sql = "insert into document (id,licname,licdate,licdatestart,licdateend,licdesc,licaddr) values('"+rlicneces.id+"','"+rlicneces["@НомЛиценз"]+"','"+rlicneces["@ДатаЛиценз"]+"','"+rlicneces["@ДатаНачЛиценз"]+"','"+rlicneces["@ДатаКонЛиценз"]+"','"+rlicneces["@НаимЛицВД"]+"')"
        resarray.push(sql)
    }
  }
  callback(undefined,resarray)
  // multiquery(resarray,(err,res)=>{
  //   if (err){
  //     console.log(err)
  //   }
  //   if (callback){callback();}
  // })
}

module.exports = {
    init:init,
    backup:backup,
    addData:addData,
    multiquery:multiquery
}
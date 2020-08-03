const createMapper = require("map-factory");

const injectToArray = (VarArray, name, value) => {
  if (!VarArray) {
    return undefined;
  }
  if (!value) {
    return VarArray;
  }
  if (Array.isArray(VarArray)) {
    VarArray.forEach((item) => {
      item[name] = value;
    });
    return VarArray;
  }
  if (VarArray) {
    VarArray[name] = value;
  }
  return VarArray;
};

const msptypes=[
    "Микропредприятие",
    "Малое Предприятие",
    "Среднее Предприятие"
]

const map = (json) => {
  const documents = json["Файл"]["Документ"];
  var rokveds = [];
  var rlicences = [];
  documents.forEach((document) => {
    document.id = document["@ИдДок"];

    document.subjcategorydesc = msptypes[document["@КатСубМСП"]]
    document.region = document["СведМН"]["@КодРегион"]

    if (document["ИПВклМСП"]){
        document.inn = document["ИПВклМСП"]["@ИННФЛ"]
        document.sname=  document["ИПВклМСП"]["ФИОИП"]["@Фамилия"]
        document.fname=  document["ИПВклМСП"]["ФИОИП"]["@Имя"]
        document.pname=  document["ИПВклМСП"]["ФИОИП"]["@Отчество"]
        document.type="IP"
    }
    if(document["ОргВклМСП"]){
        document.innul = document["ОргВклМСП"]["@ИННЮЛ"]
        document.orgname = document["ОргВклМСП"]["@НаимОрг"]
        document.orgshortname = document["ОргВклМСП"]["@НаимОргСокр"]
        document.type="UL"
    }

    if (document["СвОКВЭД"]["СвОКВЭДОсн"]){
      document["СвОКВЭД"]["СвОКВЭДОсн"].id = document.id;
      document["СвОКВЭД"]["СвОКВЭДОсн"].isMain = 1;
      rokveds.push( document["СвОКВЭД"]["СвОКВЭДОсн"])
    }
    if (document["СвОКВЭД"]["СвОКВЭДДоп"]) {
      let okveds = document["СвОКВЭД"]["СвОКВЭДДоп"];
      
      if (Array.isArray(okveds)) {
        okveds.forEach((okved) => {
          okved.id = document.id;
          okved.isMain = 0;
          rokveds.push(okved)
        })
        

      } else {okveds.id = document.id;
        okveds.isMain = 0;
        rokveds.push(okveds)
      }
      
      
    }
    if (document["СвЛиценз"]) {
      let licences = document["СвЛиценз"];
      if (Array.isArray(licences)) {
        licences.forEach((licence) => {
          licence.id = document.id;
          rlicences.push(licence)
        })
      } else{ licences.id = document.id;
        rlicences.push(licences)
      }
      
    }
  })
  return {documents,rokveds,rlicences}
}
module.exports = {
  map: map,
};

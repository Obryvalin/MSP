const fs = require("fs");
const msp = require("./utils/msp")
console.log("data/MSP.json");

// var json = JSON.parse(fs.readFileSync("data/MSP.json"));
// const documents = json["Файл"]["Документ"];
// documents.forEach((document) => {
//   document.id = document["@ИдДок"];
//   document["СвОКВЭД"]["СвОКВЭДОсн"].id = document.id;
//   if (document["СвОКВЭД"]["СвОКВЭДДоп"]) {
//     let okveds = document["СвОКВЭД"]["СвОКВЭДДоп"];
//     if (Array.isArray(okveds)) {
//       okveds.forEach((okved) => {
//         okved.id = document.id;
//       });
//     } else {
//       okveds.id = document.id;
//     }
//   }
//   if (document["СвЛиценз"]) {
//     let licences = document["СвЛиценз"];
//     if (Array.isArray(licences)) {
//       licences.forEach((licence) => {
//         licence.id = document.id;
//       });
//     } else licences.id = document.id;
//   }
// });
// console.log(documents[0]["СвОКВЭД"]["СвОКВЭДДоп"]);
// // console.log(jp.query(json,"$.'Файл'.'Документ'[*].'@ИдДок'"))

json = JSON.parse(fs.readFileSync("data/MSP.json"))
rjson = msp.map(json)
fs.writeFileSync("data/RJSON.json",JSON.stringify(rjson))
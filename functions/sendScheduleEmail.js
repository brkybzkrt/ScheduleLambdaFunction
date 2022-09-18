const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});
const Responses= require('../responses')
const SES= new AWS.SES();
const axios = require('axios');

exports.handler = async (event) => {

const getCurrencyValues= await getValues(); 
const valueHtml=await createHtml(getCurrencyValues);

const params = {
  Destination:{
    ToAddresses:await getIdentities()
  },
  Message:{
    Body:{ 
      Html:{Data:valueHtml}
    },
    Subject:{Data:"Daily Currency Values"}
  },
  Source:"b9bozkurt959@gmail.com"
}
try {
  await SES.sendEmail(params).promise();
  return Responses._200({message:"The mail sent to receivers"})
} catch (error) {
  return Responses._400({message:"The mail not sent to receivers !!!"})
}


};
  
const getValues =async()=>{
let array =[]


let {data} = await axios.get(`http://hasanadiguzel.com.tr/api/kurgetir`)


for (let i = 0; i < 10; i++) {
    
    array.push(data.TCMB_AnlikKurBilgileri[i])
}
return array;
}

const createHtml =async(data)=>{
return ` <html>
<body>
${data?.map((a)=>(
`<h3>Para Birimi: ${a.Isim} - ${a.CurrencyName}</h3>
    <p>Alış: ${a.BanknoteBuying}</p>
    <p>Satış: ${a.BanknoteSelling}</p>`   
))}

</body>
</html>
`

}

const getIdentities =async()=>{
   

    let params = {
        IdentityType: "EmailAddress",
        MaxItems: 10
       };
   let {Identities} = await SES.listIdentities(params).promise()
  return Identities



}

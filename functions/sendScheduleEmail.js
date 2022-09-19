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


let {data}= await axios.get(`https://api.collectapi.com/economy/allCurrency`,{
  headers:{
    'Content-Type': 'application/json',
    'Authorization': 'apikey YOUR-API-KEY'
  }}).catch(err=>( console.log(err)))

array=await data.result
return array;
}

const createHtml =async(data)=>{
return ` <html>
<body>
${data?.map((a)=>(
`<h3>Para Birimi: ${a.name} - ${a.code}</h3>
    <p>Alış: ${a.buying}</p>
    <p>Satış: ${a.selling}</p>
    <p>Gün: ${a.date}</p>
    <p>Saat: ${a.time}</p>`

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


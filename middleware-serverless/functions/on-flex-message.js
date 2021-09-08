
const flex = require('./on-custom-message');

const projectId = process.env.TELERIVET_PROJECT_ID;
const trAPIkey = process.env.TELERIVET_API_KEY;
var base64 = require("base-64");
const fetch = require("node-fetch");

exports.handler = async function(context, event, callback) {
  //const response = new Twilio.Response();

  console.log('Twilio new message webhook fired', event);
  let client = context.getTwilioClient();

  if (event.Source === 'SDK' ) {
    console.log('chat message from Flex:', event.Body);

    await client.chat.services(event.InstanceSid)
    .channels(event.ChannelSid)
    .members
    .list({limit:10}) // or should this just be 2?
    .then(members => {
      console.log(members);
      members.forEach(m => {
        if (m.identity.startsWith('+')){
          // If it starts with + we treat it as a phone number and will try to send a message through telerivet
          // TODO change it based on attributes 'member_type'
          console.log(m.sid, m.identity);
          sendThroughTelerivet(event.Body, m.identity)
          //console.log(resp);
        }
      })
    });

  }

  return callback(null, {msg:"ok"})
};

async function sendThroughTelerivet(body, destination){
  console.log("sending", body, destination);
    let resp = await fetch(
      `https://api.telerivet.com/v1/projects/${projectId}/messages/send`,
      {
        method: "post",
        body: JSON.stringify({
          "content":body,
          "to_number":destination
        }),
        headers: {
          'Authorization': `Basic ${base64.encode(`${trAPIkey}:`)}`,
          'Content-Type': 'application/json'
        },
      }
    );
    let data = resp.json();
    console.log(data);
    return data;
}

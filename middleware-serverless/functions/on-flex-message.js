
const flex = require('./on-custom-message');

const projectId = process.env.TELERIVET_PROJECT_ID;
const trAPIkey = process.env.TELERIVET_API_KEY;

const fetch = require("node-fetch");

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();

  let client = context.getTwilioClient();

  console.log('Twilio new message webhook fired', event);
  if (event.Source === 'SDK' ) {
    console.log('chat message from Flex:', event.Body);

    client.chat.services(event.InstanceSid)
    .channels(event.ChannelSid)
    .members
    .list({limit:10})
    .then(members => {
      members.forEach(m => {
        if (m.identity.startsWith('+')){
          // If it starts with + we treat it as a phone number and will try to send a message through telerivet
          console.log(m.sid, m.identity);
          let resp = await sendThroughTelerivet(event.Body, m.identity)
        }
      })
    });

  }

  return callback(null, {msg:"ok"})
};

async function sendThroughTelerivet(body, destination){
      return fetch(
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
}

const flex = require('./on-custom-message'); 

exports.handler = async function(context, event, callback) {
  const {saveChannelSid, getChannelSid, removeChannelKey} = require(Runtime.getFunctions()['helpers/index'].path);
  let client = context.getTwilioClient();
  console.log('Twilio channel update webhook fired', event);
  let attribs = JSON.parse(event.Attributes);
  console.log('Channel Status: ' + attribs.status);
  const removed = await removeChannelKey(attribs.from, client);

  // flex.resetChannel(status);
  callback(null, 200);
};
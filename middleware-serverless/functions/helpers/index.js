const flexFlowSid = process.env.FLEX_FLOW_SID;
const flexChatService = process.env.FLEX_CHAT_SERVICE;
const syncServiceSid = process.env.SYNC_SERVICE_SID;
const syncMapSid = process.env.SYNC_MAP_SID; 

async function saveChannelSid(fromNumber, flexChannelCreatedSid, client) {
  return client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapSid)
    .syncMapItems.create({
      key: fromNumber,
      data: {
        channelSid: flexChannelCreatedSid,
      },
    })
    .then((sync_map_item) => {
      console.log("Successfully created ", sync_map_item);
      return sync_map_item;
    })
    .catch((err) => {
      console.log("Couldn't create sync item", err);
      return;
    });
}

async function removeChannelKey(fromNumber, client){
  return client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapSid)
    .syncMapItems(fromNumber)
    .remove()
    .then((resp)=>{
      console.log("deleted",resp);
      return;
    })
    .catch((err)=>{
      console.log("Couldn't delete", err);
      return;
    });
}

async function getChannelSid(fromNumber, client) {
  console.log("Getting channel SID for ", fromNumber);

  let sync_map_item = await client.sync
    .services(syncServiceSid)
    .syncMaps(syncMapSid)
    .syncMapItems(fromNumber)
    .fetch()
    .catch((e)=>{
      console.log(e);
    })

  let channelSid;
  if (sync_map_item && sync_map_item.key ) {
    console.log("Sync key found", sync_map_item.key);
    channelSid = sync_map_item.data.channelSid;
  } else {
    console.log("Sync key not found");
    flexChannelCreatedSid = await createNewChannel(flexFlowSid, flexChatService, fromNumber, client);
    console.log(flexChannelCreatedSid);
    if (!flexChannelCreatedSid){
      console.log("Couldn't create channel");
      return;
    }
    const syncMapItem = await saveChannelSid(fromNumber, flexChannelCreatedSid, client);
    if (!syncMapItem) {
      console.log("Error occurred saving channel Sid", syncMapItem);
      return;
    }
    channelSid = flexChannelCreatedSid;
  }
  return channelSid;
}

function getChannelStatus(channelSid){
  client.chat.services(flexChatService)
  .channels(sync_map_item.key)
  .fetch()
  .then(channel => {
    // console.log(channel.)
  });
}

async function createNewChannel(flexFlowSid, flexChatService, chatUserName, client) {
  console.log("creating new channel");
  let newChannelSid = '';
  
  let newChannelCreated = await client.flexApi.channel
  .create({
    flexFlowSid: flexFlowSid,
    identity: chatUserName,
    chatUserFriendlyName: chatUserName,
    chatFriendlyName: "Flex Custom Chat",
    target: chatUserName,
  });
  console.log(`Created new channel ${newChannelCreated.sid}`);
  console.log('Channel details', newChannelCreated );
  
  // let webhooks = await client.chat.services(flexChatService).channels(newChannelCreated.sid).webhooks.list();
  // webhooks.forEach(w => {
  //   console.log('w',w);
  // });
  let webhooks = await getChannelWebhooks(flexChatService, newChannelCreated.sid, client);
  console.log("webhooks", webhooks.length);
  let assignWebhooks = true;
  if (webhooks.length){
    console.log('running checks');
    for (let i = 0; i<webhooks.length; i++){
      if (webhooks[i].configuration && webhooks[i].configuration.filters){
        console.log(webhooks[i])
        let filters = webhooks[i].configuration.filters;
        if (filters.includes('onMessageSent')){
          assignWebhooks = false;
          newChannelSid = newChannelCreated.sid;
          break;
        }
      }
    }
  }

  console.log(newChannelCreated, assignWebhooks);
  if (newChannelCreated && assignWebhooks){
    console.log("setting webhooks");
    let webhook1 = await client.chat.services(flexChatService).channels(newChannelCreated.sid).webhooks.create({
      type: "webhook",
      "configuration.method": "POST",
      "configuration.url": `${process.env.WEBHOOK_BASE_URL}/on-flex-message?channel=${newChannelCreated.sid}`,
      "configuration.filters": ["onMessageSent"],
    });
    let webhook2 = await client.chat.services(flexChatService).channels(newChannelCreated.sid).webhooks.create({
      type: "webhook",
      "configuration.method": "POST",
      "configuration.url": `${process.env.WEBHOOK_BASE_URL}/on-channel-update`,
      "configuration.filters": ["onChannelUpdated"],
    });
    if (webhook1 && webhook2){
      newChannelSid = newChannelCreated.sid;
    }
  }
  return newChannelSid;
  
}

async function getChannelWebhooks(flexChatService, channelSid, client){
  return client.chat.services(flexChatService).channels(channelSid).webhooks.list({limit: 10})
  .then((webhooks)=>{
    
    return webhooks;
  })
  .catch((err)=>{
    console.log("couldn't get webhooks");
    return null
  })
}


module.exports =  {saveChannelSid, getChannelSid, getChannelStatus, createNewChannel, removeChannelKey};
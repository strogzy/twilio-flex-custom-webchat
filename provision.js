require('dotenv').config();
const Inquirer = require('inquirer');
const fs = require('fs');



Inquirer.prompt([
  {
    type: 'string',
    name: 'functionsURL',
    message: 'Base URL'
  },
  {
    type: 'string',
    name: 'twilioAccountSid',
    message: 'Twilio Account SID'
  },
  {
    type: 'password',
    name: 'twilioAuthToken',
    message: 'Twilio Auth Token'
  },
  {
    type: 'string',
    name: 'studioFlowSid',
    message: 'Studio Flow SID'
  },
  {
    type: 'string',
    name: 'flexChatServiceSid',
    message: 'Flex Chat Service SID'
  },
  {
    type: 'string',
    name: 'syncServiceSid',
    message: 'Sync Service SID'
  },
  {
    type: 'string',
    name: 'syncMapSid',
    message: 'Sync Map SID'
  },
  {
    type: 'string',
    name: 'telerivetPass',
    message: 'Telerivet Passphrase (webhook secret)'
  },
  {
    type: 'string',
    name: 'telerivetAPIkey',
    message: 'Telerivet API key'
  },
  {
    type: 'string',
    name: 'telerivetProjectId',
    message: 'Telerivet Project ID'
  },

]).then(answers => {

  const client = require('twilio')(
    answers.twilioAccountSid,
    answers.twilioAuthToken
  );

  var flowOptions = {
    integrationType: 'studio',
    channelType: 'custom',
    enabled: true,
    'integration.flowSid': answers.studioFlowSid,
    contactIdentity: 'telerivet-channel',
    friendlyName: 'Flex Custom Channel Flow',
    chatServiceSid: answers.flexChatServiceSid
  };


  client.flexApi.flexFlow
    .create(flowOptions)
    .then(flexFlow => {
      console.log(`Created Flex Flow ${flexFlow.sid}`);
      envFileContent = `ACCOUNT_SID=${answers.twilioAccountSid}\n` 
        + `AUTH_TOKEN=${answers.twilioAuthToken}\n`
        + `WEBHOOK_BASE_URL=${answers.functionsURL}\n`  
        + `FLEX_FLOW_SID=${flexFlow.sid}\n`
        + `FLEX_CHAT_SERVICE=${answers.flexChatServiceSid}\n`
        + `SYNC_SERVICE_SID=${answers.syncServiceSid}\n`
        + `SYNC_MAP_SID=${answers.syncMapSid}\n`
        + `TELERIVET_PASS=${answers.telerivetPass}\n`
        + `TELERIVET_API_KEY=${answers.telerivetAPIkey}\n`
        + `TELERIVET_PROJECT_ID=${answers.telerivetProjectId}`

      fs.writeFileSync('middleware-serverless/.env',envFileContent)
    })
    .catch(error => {
      console.log(error);
    });
});

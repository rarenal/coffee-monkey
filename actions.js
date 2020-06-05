const store = require('./store');
const messages = require('./messages');
const utils = require('./utils');

exports.accept = async (app, payload) => {
  const actionUser = payload.body.actions[0].value;
  const rsvpUser = payload.body.user;
  
  if (rsvpUser.id === actionUser) {
    const channel = payload.body.channel.id;
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;
    const messageBlockId = payload.body.actions[0].block_id;
    
    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messages.messageWithRSVP(actionUser, messageId, messageBlocks, messageBlockId)
    });
  }
  
  return payload.ack();
};

exports.decline = async (app, payload) => {
  const actionUser = payload.body.actions[0].value;
  const rsvpUser = payload.body.user;
  
  if (rsvpUser.id === actionUser) {
    const channel = payload.body.channel.id;
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;
    const messageBlockId = payload.body.actions[0].block_id;

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messages.messageDeclinedRSVP(actionUser, messageId, messageBlocks, messageBlockId)
    });
  }

  await payload.ack();
};

exports.unsubscribe = async (app, users, payload) => {
  const rsvpUser = payload.body.actions[0].value;
  const actionUser = payload.body.user;
  
  if (rsvpUser === actionUser.id) {
    store.unsubscribe(rsvpUser);
    const channel = payload.body.channel.id;
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;
    const messageBlockId = payload.body.actions[0].block_id;
    const selectedUsers = messageBlocks.filter((block) => block.type === 'section').map((block) => block.block_id);

    const newMember = utils.replaceUser(selectedUsers, users);
        
    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messages.messageWithNewMember(actionUser, messageId, messageBlocks, messageBlockId, newMember)
    });
  }
  
  await payload.ack();
};

exports.dismiss = async (app, users, payload) => {
  const rsvpUser = payload.body.actions[0].value;
  const actionUser = payload.body.user;
   
  if (rsvpUser === actionUser.id) {
    const channel = payload.body.channel.id;
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;
    const messageBlockId = payload.body.actions[0].block_id;
    const selectedUsers = messageBlocks.filter((block) => block.type === 'section').map((block) => block.block_id);
    
    const newMember = utils.replaceUser(selectedUsers, users);
        
    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messages.messageWithNewMember(actionUser, messageId, messageBlocks, messageBlockId, newMember)
    });
  }
  
  await payload.ack();
};

exports.cancel = async (app, payload) => {
  const actionUser = payload.body.actions[0].value;
  const rsvpUser = payload.body.user;
  
  if (rsvpUser.id === actionUser) {
    const channel = payload.body.channel.id;
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;
    const messageBlockId = payload.body.actions[0].block_id;

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messages.messageCancelDeclinedRSVP(actionUser, messageId, messageBlocks, messageBlockId)
    });
  }

  await payload.ack();
};

exports.channelFromAction = (payload) => payload.body.channel.id;

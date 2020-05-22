const { App } = require('@slack/bolt');
const scheduler = require('node-schedule');
const lodash = require('lodash');

const store = require('./store');
const actions = require('./actions');
const messages = require('./messages');
const utils = require('./utils');

const channel = 'CH34Y9ZPV';
const numberOfParticipants = 2;

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ CofeeMonkey app is running in heroku!');
})();

app.action('accept', async (payload) => {
  await actions.accept(app, channel, payload);
});

app.action('decline', async (payload) => {
  await actions.decline(app, channel, payload);
});

app.action('unsubscribe', async (payload) => {

  const users = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    limit: 1000
  });
  const unsubscribedUsers = store.getUnsubscribed();
  const eligibleMembers = lodash.difference(users.members, unsubscribedUsers);
  await actions.unsubscribe(app, channel, eligibleMembers, payload);
});

app.action('dismiss', async (payload) => {
  const users = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    limit: 1000
  });
  const unsubscribedUsers = store.getUnsubscribed();
  const eligibleMembers = lodash.difference(users.members, unsubscribedUsers);
  await actions.dismiss(app, channel, eligibleMembers, payload);
});

app.action('cancel', async (payload) => {
  await actions.cancel(app, channel, payload);
});

//scheduler.scheduleJob("* * * * *", async () => {
(async () => {
  const users = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    limit: 1000
  });

  if (users.members.length < numberOfParticipants) {
    return;
  }

  const unsubscribedUsers = store.getUnsubscribed();
  const eligibleMembers = lodash.difference(users.members, unsubscribedUsers);
  console.log(eligibleMembers);
  const randomMembers = utils.getUniqueRandomMembers(numberOfParticipants, eligibleMembers);

  app.client.chat.postMessage(messages.meetingMessage(channel, randomMembers));
})();

app.event('member_joined_channel', ({ event, say }) => {
  say(`Hello world :coffee:🐵! and welcome our new member <@${event.user}>!:tada:`);
});

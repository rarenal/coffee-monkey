const { App } = require('@slack/bolt');
const scheduler = require('node-schedule');
const lodash = require('lodash');

const store = require('./store');
const actions = require('./actions');
const messages = require('./messages');
const utils = require('./utils');

const runtimeSchedulers = [];

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ CofeeMonkey app is running!');
})();

const createScheduler = async (channel, schedule, numberOfMembers) => {
  const existingSchedulerIndex = runtimeSchedulers.findIndex((runtimeScheduler) => runtimeScheduler.channel === channel);
  if (existingSchedulerIndex !== -1) {
    runtimeSchedulers[existingSchedulerIndex].scheduler.cancel();
    runtimeSchedulers.splice(existingSchedulerIndex, 1);
  }

  const newScheduler = await scheduler.scheduleJob(schedule, async () => {
      const users = await app.client.conversations.members({
        token: process.env.SLACK_BOT_TOKEN,
        channel,
        limit: 1000
      });

      if (users.members.length < numberOfMembers) {
        return;
      }

      const unsubscribedUsers = store.getUnsubscribed();
      const eligibleMembers = lodash.difference(users.members, unsubscribedUsers);
      const randomMembers = utils.getUniqueRandomMembers(numberOfMembers, eligibleMembers);

      app.client.chat.postMessage(messages.meetingMessage(channel, randomMembers));
  });

  const runtimeScheduler = {
    scheduler: newScheduler,
    channel: channel
  }
  runtimeSchedulers.push(runtimeScheduler);

}

// Commands API

app.command('/monkey', async ({ command, ack, say, body }) => {
  await ack();
  const channel = command.channel_id;
  const text = body.text;
  
  if (text.includes('add')) {
    try {
    const result = await app.client.views.open({
      token: process.env.SLACK_BOT_TOKEN,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: messages.messageSetup(channel),
    });
  }
  catch (error) {
    console.error(error);
  }
    
    
  } else if (text.includes('remove')) {
    store.removeScheduler(channel);
    say(`CoffeeMonkey has been removed from this channel by request of <@${body.user_id}>`);
    
    const runtimeScheduler = runtimeSchedulers.find((runtimeScheduler) => runtimeScheduler.channel === channel);
    if (runtimeScheduler) {
      runtimeScheduler.scheduler.cancel();
    }    
  }
});

// Views API

app.view('set_up', async ({view, body, ack}) => {
  await ack();

  const numberOfMembers = view.state.values.number_of_participants['participants-value'].selected_option.value;
  const dayOfWeek = view.state.values.day_of_the_week['day-value'].selected_option.value;
  const hour = view.state.values.hour_of_the_day['hour-value'].selected_option.value;
  
  const schedule = {hour, dayOfWeek, minute: 0};

  store.addScheduler(view.private_metadata, schedule, parseInt(numberOfMembers));
  
  await createScheduler(view.private_metadata, schedule, parseInt(numberOfMembers));
  
  app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: view.private_metadata,
      text: `CoffeeMonkey has been added to this channel by request of <@${body.user.id}>`
  });
});

// Events API

app.event('member_joined_channel', ({ event, say }) => {
  say(`Hello world :coffee:🐵! and welcome our new member <@${event.user}>!:tada:`);
});

// Actions API

app.action('accept', async (payload) => {
  await actions.accept(app, payload);
});

app.action('decline', async (payload) => {
  await actions.decline(app, payload);
});

app.action('unsubscribe', async (payload) => {
  const eligibleMembers = await utils.getElegibleMembers(app, actions.channelFromAction(payload));
  await actions.unsubscribe(app, eligibleMembers, payload);
});

app.action('dismiss', async (payload) => {
  const eligibleMembers = await utils.getElegibleMembers(app, actions.channelFromAction(payload));
  await actions.dismiss(app, eligibleMembers, payload);
});

app.action('cancel', async (payload) => {
  await actions.cancel(app, payload);
});

// Schedulers
(async () => {
  store.getSchedulers().forEach(async (job) => {
    console.log(job);
    await createScheduler(job.channel, job.schedule, job.members);
  });
})();

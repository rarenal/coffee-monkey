const { App } = require('@slack/bolt');
const store = require('./store');
const scheduler = require('node-schedule');

const channel = 'CH34Y9ZPV';
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

const coffeeRoles = ['*magic lizard* :lizard:', '*glamorous octopus* :octopus:', '*dancing t-rex* :t-rex:', '*fearless kitty* :cat2:', '*singing elephant* :elephant:'];

app.action('RSVP', async (payload) => {
  const rsvpUser = payload.body.actions[0].value;
  const actionUser = payload.body.user;

  if (rsvpUser === actionUser.id) {
    const messageId = payload.body.message.ts;
    const messageBlocks = payload.body.message.blocks;

    await app.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      ts: messageId,
      blocks: messageWithRSVP(rsvpUser, messageId, messageBlocks)
    });
  }

  await payload.ack();
});

//scheduler.scheduleJob({hour: 7, minute: 0, dayOfWeek: 1}, async () => {
  (async () => {
  const users = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    limit: 1000
  });

  if (users.members.length < 2) {
    return;
  }

  const randomMembers = getUniqueRandomMembers(2, users.members);

  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
	  blocks: [
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":coffee: :monkey: *The CoffeeMonkey has chosen this week folks* (from heroku)"
			}
		},
		...randomMembers.map((member, index) => ({
			"type": "section",
      "block_id": `${member}`,
			"text": {
				"type": "mrkdwn",
				"text": index === 0 ? `<@${member}> as the ${coffeeRoles[index]} will be the host` : `<@${member}> as the ${coffeeRoles[index]}`
			},
			"accessory": {
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "RSVP",
					"emoji": true,
				},
        "value": `${member}`,
        "action_id": 'RSVP',
			}
		})),
		{
			"type": "divider"
		},
    {
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "The host will invite the rest of folks to enjoy a coffee together in a remote a meeting within this week\n"
				}
			]
		}
	]
  });
})();
//});

app.event('member_joined_channel', ({ event, say }) => {
  say(`Hello world :coffee:🐵! and welcome our new member <@${event.user}>!:tada:`);
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

const messageWithRSVP = (rsvpUser, messageId, messageBlocks) => {
  const messageToChange = messageBlocks.filter((block) => block.block_id === rsvpUser);
    const newMessage = {
      ...messageToChange[0],
      text: {
        ...messageToChange[0].text,
        text: `:white_check_mark: :white_check_mark: :white_check_mark: ${messageToChange[0].text.text}`
      },
      accessory: undefined,
    };

  return messageBlocks.map((block) => block.block_id === rsvpUser ? newMessage : block);
}


const getUniqueRandomMembers = (n, members) =>
  Array(n).fill(null)
    .reduce((indexes, index) => {
      const randomIndex = getUniqueRandomIndex(indexes, members.length);

      return [...indexes, randomIndex];
    }, [])
    .map((index) => members[index]);

const getUniqueRandomIndex = (previous, length) => {
  const randomIndex = Math.floor(Math.random() *  length);
  if (previous.includes(randomIndex)) {
    return getUniqueRandomIndex(previous, length);
  }

  return randomIndex;
}

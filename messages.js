const lodash = require('lodash');

const coffeeRoles = ['*magic lizard* :lizard:', '*glamorous octopus* :octopus:', '*dancing t-rex* :t-rex:', '*fearless kitty* :cat2:', '*singing elephant* :elephant:'];

exports.meetingMessage = (channel, members) => ({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
	  blocks: [
		{
			"type": "divider"
		},
    {
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":coffee: :monkey: *The CoffeeMonkey has chosen this week folks*"
			}
		},
    {
			"type": "divider"
		},
		...lodash.flatMap(members.map((member, index) => ([{
			"type": "section",
      "block_id": `${member}`,
			"text": {
				"type": "mrkdwn",
				"text": index === 0 ? `<@${member}> as the ${coffeeRoles[index]} will be the host` : `<@${member}> as the ${coffeeRoles[index]}`
			}
		},
    {
			"type": "actions",
      "block_id": `${member}_actions`,
			"elements": [
				{
					"type": "button",
          "action_id": "accept",
					"text": {
						"type": "plain_text",
						"text": "Accept",
						"emoji": true
					},
          "style": "primary",
					"value": `${member}`,
				},
				{
					"type": "button",
          "action_id": "decline",
					"text": {
						"type": "plain_text",
						"text": "Decline",
						"emoji": true
					},
          "style": "danger",
					"value": `${member}`
				}
			]
		},
    {
			"type": "divider"
		},
    ]))),
    {
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "The host will invite the rest of folks to enjoy a coffee together in a remote a meeting within this week\n"
				}
			]
		},
    {
			"type": "divider"
		},
    {
			"type": "divider"
		},
	]
});

exports.messageWithRSVP = (rsvpUser, messageId, messageBlocks, blockId) => {
  const messageToChange = messageBlocks.filter((block) => block.block_id === rsvpUser);
  const newMessage = {
      ...messageToChange[0],
      text: {
        ...messageToChange[0].text,
        text: `:white_check_mark: ${messageToChange[0].text.text}`
      },
    };
  const filteredMessage = messageBlocks.filter((block) => block.block_id !== blockId);

  return filteredMessage.map((block) => block.block_id === rsvpUser ? newMessage : block);
};

exports.messageDeclinedRSVP = (rsvpUser, messageId, messageBlocks, blockId) => {
  const actionToChange = messageBlocks.filter((block) => block.type === 'actions' && block.block_id === blockId);
  
  const newElements = [
    {
      "type": "button",
      "action_id": "cancel",
      "text": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true
      },
      "value": rsvpUser,
		},
    {
      "type": "button",
      "action_id": "dismiss",
      "text": {
        "type": "plain_text",
        "text": "Just this time",
        "emoji": true
      },
      "style": "primary",
      "value": rsvpUser,
    },
    {
      "type": "button",
      "action_id": "unsubscribe",
      "text": {
        "type": "plain_text",
        "text": "Unsubscribe",
        "emoji": true
      },
      "style": "danger",
      "value": rsvpUser
    }
  ];
  
  const blocks = messageBlocks.map((block) => block.block_id === blockId ? {...block, elements: newElements} : block);

  return blocks;
}

exports.messageCancelDeclinedRSVP = (rsvpUser, messageId, messageBlocks, blockId) => {
  const actionToChange = messageBlocks.filter((block) => block.type === 'actions' && block.block_id === blockId);
  
  const newElements = [
    {
        "type": "button",
        "action_id": "accept",
        "text": {
          "type": "plain_text",
          "text": "Accept",
          "emoji": true
        },
        "style": "primary",
        "value": rsvpUser,
      },
      {
        "type": "button",
        "action_id": "decline",
        "text": {
          "type": "plain_text",
          "text": "Decline",
          "emoji": true
        },
        "style": "danger",
        "value": rsvpUser
      }
  ];
  
  const blocks = messageBlocks.map((block) => block.block_id === blockId ? {...block, elements: newElements} : block);

  return blocks;
};

exports.messageWithNewMember = (rsvpUser, messageId, messageBlocks, blockId, newUser) => { 
  const index = messageBlocks.map((block) => block.block_id).indexOf(rsvpUser.id);
  const actionsIndex = index + 1;

  const messageToReplace = {
    ...messageBlocks[index],
  };
  messageBlocks[index] = {
    ...messageToReplace,
    "block_id": newUser,
    "text": {
      ...messageToReplace.text,
      "text": messageToReplace.text.text.replace(/<(.*?)>/, `<@${newUser}>`)
    }
  }
  
  messageBlocks[actionsIndex] = {
			"type": "actions",
      "block_id": `${newUser}_actions`,
			"elements": [
				{
					"type": "button",
          "action_id": "accept",
					"text": {
						"type": "plain_text",
						"text": "Accept",
						"emoji": true
					},
          "style": "primary",
					"value": newUser,
				},
				{
					"type": "button",
          "action_id": "decline",
					"text": {
						"type": "plain_text",
						"text": "Decline",
						"emoji": true
					},
          "style": "danger",
					"value": newUser
				}
			]
		};
  
  return messageBlocks;

  /*
  const newSection = {
			"type": "section",
      "block_id": newUser,
			"text": {
				"type": "mrkdwn",
				"text": index === 0 ? `<@${newUser}> as the ${coffeeRoles[index]} will be the host` : `<@${newUser}> as the ${coffeeRoles[index]}`
			}
		};

  const newActions = {
			"type": "actions",
      "block_id": `${newUser}_actions`,
			"elements": [
				{
					"type": "button",
          "action_id": "accept",
					"text": {
						"type": "plain_text",
						"text": "Accept",
						"emoji": true
					},
          "style": "primary",
					"value": newUser,
				},
				{
					"type": "button",
          "action_id": "decline",
					"text": {
						"type": "plain_text",
						"text": "Decline",
						"emoji": true
					},
          "style": "danger",
					"value": newUser
				}
			]
		};
  
  const blocks = messageBlocks.map((block) => 
     block.block_id === blockId
       ? newActions
       : block
  );
  */
};
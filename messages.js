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

exports.messageSetup = (channel) => {
  const message = 
    {
    "title": {
      "type": "plain_text",
      "text": "CoffeeMonkey"
    },
    "submit": {
      "type": "plain_text",
      "text": "Set up",
    },
    "blocks": [
      {
        "block_id": "number_of_participants",
        "type": "input",
        "element": {
          "type": "static_select",
          "action_id": "participants-value",
          "placeholder": {
            "type": "plain_text",
            "text": "Select number of participants",
            "emoji": true
          },
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Two (2)",
                "emoji": true
              },
              "value": "2"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Three (3)",
                "emoji": true
              },
              "value": "3"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Four (4)",
                "emoji": true
              },
              "value": "4"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Five (5)",
                "emoji": true
              },
              "value": "5"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Six (6)",
                "emoji": true
              },
              "value": "6"
            },
            {
              "text": {
                "type": "plain_text",
                "text": "Seven (7)",
                "emoji": true
              },
              "value": "7"
            }
          ]
        },
        "label": {
          "type": "plain_text",
          "text": "Number of users to select",
          "emoji": true
        }
      },
      {
			  "type": "divider"
		  },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Schedule*"
        }
      },
      {
			  "type": "divider"
		  },
      {
        "block_id": "day_of_the_week",
        "type": "input",
        "element":
          {
            "type": "static_select",
            "action_id": "day-value",
            "placeholder": {
              "type": "plain_text",
              "text": "Select Day of the week",
              "emoji": true,
            },
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "Every monday",
                  "emoji": true
                },
                "value": "1"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Every tuesday",
                  "emoji": true
                },
                "value": "2"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Every wednesday",
                  "emoji": true
                },
                "value": "3"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Every thursday",
                  "emoji": true
                },
                "value": "4"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "Every friday",
                  "emoji": true
                },
                "value": "5"
              }
            ]
          },
          "label": {
            "type": "plain_text",
            "text": "Day of the week",
            "emoji": true
          }
        },
        {
          "block_id": "hour_of_the_day",
          "type": "input",
          "element":
          {
            "type": "static_select",
            "action_id": "hour-value",
            "placeholder": {
              "type": "plain_text",
              "text": "Select hour",
              "emoji": true
            },
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "01:00am (UTC)",
                  "emoji": true
                },
                "value": "1"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "02:00am (UTC)",
                  "emoji": true
                },
                "value": "2"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "03:00am (UTC)",
                  "emoji": true
                },
                "value": "3"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "04:00am (UTC)",
                  "emoji": true
                },
                "value": "4"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "05:00am (UTC)",
                  "emoji": true
                },
                "value": "5"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "06:00am (UTC)",
                  "emoji": true
                },
                "value": "6"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "07:00am (UTC)",
                  "emoji": true
                },
                "value": "7"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "08:00am (UTC)",
                  "emoji": true
                },
                "value": "8"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "09:00am (UTC)",
                  "emoji": true
                },
                "value": "9"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "11:00am (UTC)",
                  "emoji": true
                },
                "value": "10"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "11:00am (UTC)",
                  "emoji": true
                },
                "value": "11"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "12:00pm (UTC)",
                  "emoji": true
                },
                "value": "12"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "01:00pm (UTC)",
                  "emoji": true
                },
                "value": "13"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "02:00pm (UTC)",
                  "emoji": true
                },
                "value": "14"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "03:00pm (UTC)",
                  "emoji": true
                },
                "value": "15"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "04:00pm (UTC)",
                  "emoji": true
                },
                "value": "16"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "05:00pm (UTC)",
                  "emoji": true
                },
                "value": "17"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "06:00pm (UTC)",
                  "emoji": true
                },
                "value": "18"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "07:00pm (UTC)",
                  "emoji": true
                },
                "value": "19"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "08:00pm (UTC)",
                  "emoji": true
                },
                "value": "20"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "09:00pm (UTC)",
                  "emoji": true
                },
                "value": "21"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "10:00pm (UTC)",
                  "emoji": true
                },
                "value": "22"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "11:00pm (UTC)",
                  "emoji": true
                },
                "value": "23"
              }
            ]
          },
          "label": {
          "type": "plain_text",
          "text": "Hour of the day",
          "emoji": true
        }
      }
    ],
    callback_id: 'set_up',
    "type": "modal",
    private_metadata: channel
  }
  return message;
}
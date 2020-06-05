const store = require('./store');
const lodash = require('lodash');

exports.getUniqueRandomMembers = (n, members) =>
  Array(n).fill(null)
    .reduce((indexes, index) => {
      const randomIndex = getUniqueRandomIndex(indexes, members.length);
      return [...indexes, randomIndex];
    }, [])
    .map((index) => members[index]);

exports.replaceUser = (selectedUsers, users) => {
  const candidates = lodash.difference(users, selectedUsers);
 
  return this.getUniqueRandomMembers(1, candidates)[0];
}

exports.getElegibleMembers = async (app, channel) => {
  const users = await app.client.conversations.members({
    token: process.env.SLACK_BOT_TOKEN,
    channel,
    limit: 1000
  });
  const unsubscribedUsers = store.getUnsubscribed();
  return lodash.difference(users.members, unsubscribedUsers);
}

const getUniqueRandomIndex = (previous, length) => {
  const randomIndex = Math.floor(Math.random() *  length);
  const unsubscribedUsers = store.getUnsubscribed();

  if (previous.includes(randomIndex)) {
    return getUniqueRandomIndex(previous, length);
  }
  
  return randomIndex;
}

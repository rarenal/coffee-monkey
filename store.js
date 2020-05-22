// Storage API
const fs = require('fs');

exports.getUnsubscribed = () => {
  const unsubscribedUsers = fs.readFileSync('unsubscribed_users.json', 'utf8');

  return JSON.parse(unsubscribedUsers);
}

exports.unsubscribe = async (userId) => {
  const unsubscribedUsers = JSON.parse(fs.readFileSync('unsubscribed_users.json', 'utf8'));
  unsubscribedUsers.push(userId);
  
  const newJson = JSON.stringify(unsubscribedUsers);
  return fs.writeFileSync('unsubscribed_users.json', newJson, 'utf8');
}

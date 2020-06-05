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


exports.getSchedulers = () => {
  return JSON.parse(fs.readFileSync('schedulers.json', 'utf8'));
}

exports.addScheduler = async (channelId, schedule, numberOfMembers) => {
  const schedulers = this.getSchedulers();
  const newScheduler = {
    schedule,
    channel: channelId,
    members: numberOfMembers,
  };
  
  const schedulerToReplace = schedulers.findIndex((scheduler) => scheduler.channel === channelId);
  
  if (schedulerToReplace !== -1) {
    schedulers[schedulerToReplace] = newScheduler;
  } else {
    schedulers.push(newScheduler);
  }
  
  const newJson = JSON.stringify(schedulers);
  
  return fs.writeFileSync('schedulers.json', newJson, 'utf8');
}

exports.removeScheduler = (channel) => {
  const schedulers = this.getSchedulers();
  
  const indexToRemove = schedulers.findIndex((scheduler) => scheduler.channel === channel);
  
  if (indexToRemove !== -1) {
    schedulers.splice(indexToRemove, 1);  
  }
  
  const newJson = JSON.stringify(schedulers);
  
  return fs.writeFileSync('schedulers.json', newJson, 'utf8');
}

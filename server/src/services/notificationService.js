const Notification = require('../models/Notification');

const triggerNotification = async (recipientId, type, title, message, link = '', relatedId = null) => {
  try {
    await Notification.create({ recipient: recipientId, type, title, message, link, relatedId });
  } catch (err) {
    console.error('Notification Error:', err.message);
  }
};

module.exports = { triggerNotification };

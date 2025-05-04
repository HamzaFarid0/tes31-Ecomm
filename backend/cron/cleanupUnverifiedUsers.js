
const cron = require('node-cron');
const UserModel = require('../models/user.model');


cron.schedule('*/15 * * * *', async () => {
  const expiryTime = new Date(Date.now() - 15 * 60 * 1000); 
  console.log('delete kar');

  try { 
    const result = await UserModel.deleteMany({
      isVerified: false, 
      createdAt: { $lt: expiryTime },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} unverified users`);
    }
  } catch (err) {
    console.error('❌ Error cleaning up unverified users:', err);
  }
});

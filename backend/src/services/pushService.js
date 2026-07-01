const admin = require('firebase-admin');

let initialized = false;

const initializeFirebase = () => {
  if (!initialized && process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    initialized = true;
  }
};

const send = async ({ to, title, body, data }) => {
  try {
    initializeFirebase();

    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      token: to
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to ${to} with ID ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push notification failed:', error);
    throw error;
  }
};

module.exports = { send };

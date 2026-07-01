const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');

const sendCampaign = async (campaign, customers) => {
  const results = [];
  const content = JSON.parse(campaign.content);
  const channels = JSON.parse(campaign.channels);

  for (const customer of customers) {
    const preferences = JSON.parse(customer.preferences);

    if (channels.includes('email') && preferences.email) {
      const notification = await Notification.create({
        customer_id: customer.id,
        campaign_id: campaign.id,
        type: 'email',
        channel: 'email',
        subject: content.subject,
        content: content.email_body,
        recipient: customer.email,
        status: 'pending',
        triggered_by: 'campaign'
      });

      await emailService.send({
        to: customer.email,
        subject: content.subject,
        html: content.email_body
      });

      await Notification.updateStatus(notification.id, 'sent');
      results.push({ customer_id: customer.id, channel: 'email', status: 'sent' });
    }

    if (channels.includes('sms') && preferences.sms) {
      const notification = await Notification.create({
        customer_id: customer.id,
        campaign_id: campaign.id,
        type: 'sms',
        channel: 'sms',
        content: content.sms_body,
        recipient: customer.phone,
        status: 'pending',
        triggered_by: 'campaign'
      });

      await smsService.send({
        to: customer.phone,
        message: content.sms_body
      });

      await Notification.updateStatus(notification.id, 'sent');
      results.push({ customer_id: customer.id, channel: 'sms', status: 'sent' });
    }

    if (channels.includes('push') && preferences.push) {
      const notification = await Notification.create({
        customer_id: customer.id,
        campaign_id: campaign.id,
        type: 'push',
        channel: 'push',
        subject: content.subject,
        content: content.push_body,
        recipient: customer.id,
        status: 'pending',
        triggered_by: 'campaign'
      });

      await pushService.send({
        to: customer.id,
        title: content.subject,
        body: content.push_body
      });

      await Notification.updateStatus(notification.id, 'sent');
      results.push({ customer_id: customer.id, channel: 'push', status: 'sent' });
    }
  }

  return results;
};

const sendShipmentNotification = async (shipment, customer, status) => {
  const preferences = JSON.parse(customer.preferences);
  const results = [];

  const templates = {
    'order_shipped': {
      subject: 'Your shipment is on the way!',
      email: `Your order #${shipment.id} has been shipped`,
      sms: `Your order #${shipment.id} shipped. Track: ${shipment.tracking_url}`,
      push: `Order #${shipment.id} shipped`
    },
    'out_for_delivery': {
      subject: 'Your package is out for delivery',
      email: `Your order #${shipment.id} is out for delivery today`,
      sms: `Order #${shipment.id} is out for delivery. ETA: ${shipment.eta}`,
      push: `Order #${shipment.id} out for delivery`
    },
    'delivered': {
      subject: 'Your shipment has been delivered',
      email: `Your order #${shipment.id} has been delivered`,
      sms: `Order #${shipment.id} delivered. Thank you!`,
      push: `Order #${shipment.id} delivered`
    },
    'delayed': {
      subject: 'Your shipment has been delayed',
      email: `Your order #${shipment.id} has been delayed. New ETA: ${shipment.eta}`,
      sms: `Order #${shipment.id} delayed. New ETA: ${shipment.eta}`,
      push: `Order #${shipment.id} delayed`
    }
  };

  const template = templates[status];

  if (preferences.email) {
    const notification = await Notification.create({
      customer_id: customer.id,
      type: 'email',
      channel: 'email',
      subject: template.subject,
      content: template.email,
      recipient: customer.email,
      status: 'pending',
      triggered_by: 'shipment',
      metadata: { shipment_id: shipment.id, event: status }
    });

    await emailService.send({
      to: customer.email,
      subject: template.subject,
      html: template.email
    });

    await Notification.updateStatus(notification.id, 'delivered');
    results.push({ channel: 'email', status: 'sent' });
  }

  if (preferences.sms) {
    const notification = await Notification.create({
      customer_id: customer.id,
      type: 'sms',
      channel: 'sms',
      content: template.sms,
      recipient: customer.phone,
      status: 'pending',
      triggered_by: 'shipment',
      metadata: { shipment_id: shipment.id, event: status }
    });

    await smsService.send({
      to: customer.phone,
      message: template.sms
    });

    await Notification.updateStatus(notification.id, 'delivered');
    results.push({ channel: 'sms', status: 'sent' });
  }

  if (preferences.push) {
    const notification = await Notification.create({
      customer_id: customer.id,
      type: 'push',
      channel: 'push',
      subject: template.subject,
      content: template.push,
      recipient: customer.id,
      status: 'pending',
      triggered_by: 'shipment',
      metadata: { shipment_id: shipment.id, event: status }
    });

    await pushService.send({
      to: customer.id,
      title: template.subject,
      body: template.push
    });

    await Notification.updateStatus(notification.id, 'delivered');
    results.push({ channel: 'push', status: 'sent' });
  }

  return results;
};

module.exports = {
  sendCampaign,
  sendShipmentNotification
};

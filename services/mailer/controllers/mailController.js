const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { db } = require('../firebase');
const fs = require('fs');

// POST Controller Function
exports.queueMail = (queue) => async (req, res) => {
  try {
    const {
      recipient_list,
      sender_id,
      use_custom_template = false,
      template_id,
      recipient_data = {},
    } = req.body;

    if (!recipient_list || !Array.isArray(recipient_list) || recipient_list.length === 0) {
      return res.status(400).json({ error: 'recipient_list is required and must be a non-empty array.' });
    }

    if (sender_id !== 'VSB') {
      return res.status(400).json({ error: 'Invalid sender_id. Only "VSB" is supported currently.' });
    }

    if (use_custom_template) {
      return res.status(400).json({ error: 'Custom templates are not supported yet.' });
    }

    // Load the HTML mail template
    const templatePath = path.join(__dirname, '..', 'templates', `${template_id}.html`);
    if (!fs.existsSync(templatePath)) {
      return res.status(400).json({ error: 'Invalid template_id.' });
    }

    const templateHtml = fs.readFileSync(templatePath, 'utf-8');

    // Generate a unique task ID
    const queueId = uuidv4();

    // Build queue payload for in-memory queue (can be swapped to Redis later)
    const queuePayload = {
      id: queueId,
      template_id,
      sender_id,
      templateHtml,
      recipients: recipient_list.map(email => ({
        email,
        data: recipient_data[email] || {}
      })),
      created_at: Date.now(),
      status: "queued",
      remaining_recipients: recipient_list.length
    };

    // Enqueue mail job
    await queue.enqueue(queueId, queuePayload);

    // Write queue metadata to Firestore
    await db.collection('internal').doc('queued_mail').set({
      [queueId]: {
        id: queueId,
        sender_id,
        template_id,
        recipient_count: recipient_list.length,
        use_custom_template,
        created_at: new Date().toISOString(),
      }
    }, { merge: true });

    console.log(`[MailerService] Queued ${recipient_list.length} mail(s) w/ ${template_id}`);
    // Return 200 with queue ID
    res.status(200).json({ queue_id: queueId });

  } catch (err) {
    console.error('[MailerService] Error in queueMail:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.checkStatus = async (req, res) => {
  res.status(200).json({ message: "Successfully called checkStatus" });
};


const { db } = require('../firebase.js');
const mailer = require('../utils/smtp/mailSender.js');

function renderTemplate(template, data) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => data[key] ?? '');
}

exports.processMailQueue = async (queue, sendLimit = 20) => {
  // console.log(`[MailerWorker] Fetching jobs from queue...`);
  const jobs = await queue.getAllJobs();

  if (!jobs.length) {
    // console.log(`[MailerWorker] ✅ No pending mail jobs`);
    return;
  }

  for (const job of jobs) {
    const { id, payload } = job;
    const { recipients = [], templateHtml, sender_id } = payload;

    console.log(`\n[MailerWorker] 📨 Processing job ID: ${id}`);
    console.log(`[MailerWorker] ➤ Total recipients: ${recipients.length}`);

    if (!recipients.length) {
      console.log(`[MailerWorker] ⚠️ No recipients — removing job ${id}`);
      await queue.removeJob(id);
      await db.collection('internal').doc('queued_mail').set({ [id]: { status: 'completed' } }, { merge: true });
      continue;
    }

    const statusChanged = await queue.updateStatus(id, 'running');
    if (statusChanged) {
      console.log(`[MailerWorker] 🔄 Marked job ${id} as 'running'`);
      await db.collection('internal').doc('queued_mail').set({ [id]: { status: 'running' } }, { merge: true });
    }

    const toSend = recipients.slice(0, sendLimit);
    const remaining = recipients.slice(sendLimit);

    const emailBatch = toSend.map(recipient => {
      const renderedBody = renderTemplate(templateHtml, recipient.data || {});
      return {
        to: recipient.email,
        subject: recipient.data?.subject || 'No Subject',
        body: renderedBody,
      };
    });

    const isHtml = !!templateHtml;

    console.log(`[MailerWorker] 📤 Sending ${emailBatch.length} email(s)...`);
    if (remaining.length) {
      console.log(`[MailerWorker] ⏳ ${remaining.length} remaining recipient(s) will be re-queued.`);
    }

    try {
      if (isHtml) {
        await mailer.sendBatchHtmlEmails(emailBatch);
      } else {
        await mailer.sendBatchTextEmails(emailBatch);
      }

      if (remaining.length === 0) {
        console.log(`[MailerWorker] ✅ Job ${id} fully processed. Removing...`);
        await queue.removeJob(id);
        await db.collection('internal').doc('queued_mail').set({ [id]: { status: 'completed' } }, { merge: true });
      } else {
        const updatedPayload = { ...payload, recipients: remaining, remaining_recipients: remaining.length };
        await queue.updateJob(id, updatedPayload);
        console.log(`[MailerWorker] 📦 Job ${id} partially processed. ${remaining.length} queued.`);
      }

    } catch (err) {
      console.error(`[MailerWorker] ❌ Failed to send for job ${id}:`, err.message || err);
      console.error(`[MailerWorker] 🧨 Affected recipients:`, toSend.map(r => r.email));
      await db.collection('internal').doc('queued_mail').set({ [id]: { status: 'failed', error: err.message } }, { merge: true });
    }
  }

  console.log(`\n[MailerWorker] 🎯 All queued jobs processed.\n`);
};



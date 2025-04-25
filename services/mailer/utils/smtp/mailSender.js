const tokenManager = require('./oauth/tokenManager');
const axios = require('axios');
const xmlbuilder = require('xmlbuilder');

class MailSender {
  async sendBatchTextEmails(emailList) {
    return this.sendBatchEmails(emailList, 'Text');
  }

  async sendBatchHtmlEmails(emailList) {
    return this.sendBatchEmails(emailList, 'HTML');
  }

  async sendBatchEmails(emailList, bodyType = 'Text') {
    // TODO: remove hardcoded subject
    const HARD_CODED_SUBJECT = 'Signup for your upcoming capstone event';

    if (!Array.isArray(emailList) || emailList.length === 0) {
      throw new Error('emailList must be a non-empty array');
    }

    const accessToken = await tokenManager.getAccessToken();
    const ewsUrl = 'https://outlook.office365.com/EWS/Exchange.asmx';

    const envelope = xmlbuilder.create('soap:Envelope', { encoding: 'utf-8' })
      .att('xmlns:soap', 'http://schemas.xmlsoap.org/soap/envelope/')
      .att('xmlns:t', 'http://schemas.microsoft.com/exchange/services/2006/types')
      .att('xmlns:m', 'http://schemas.microsoft.com/exchange/services/2006/messages');

    // Header
    envelope.ele('soap:Header')
      .ele('t:RequestServerVersion').att('Version', 'Exchange2016').up()
    .up();

    // Body
    const body = envelope.ele('soap:Body')
      .ele('m:CreateItem').att('MessageDisposition', 'SendAndSaveCopy');

    body.ele('m:SavedItemFolderId')
      .ele('t:DistinguishedFolderId').att('Id', 'sentitems').up()
    .up();

    const items = body.ele('m:Items');

    for (const email of emailList) {
      const msg = items.ele('t:Message');

      // msg.ele('t:Subject', email.subject);
      msg.ele('t:Subject', HARD_CODED_SUBJECT); // TODO: subjected for removal

      msg.ele('t:Body').att('BodyType', bodyType).text(email.body);

      const recipients = msg.ele('t:ToRecipients');
      recipients.ele('t:Mailbox').ele('t:EmailAddress', email.to);
    }

    const xml = envelope.end({ pretty: true });

    const response = await axios.post(ewsUrl, xml, {
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }
}

module.exports = new MailSender();

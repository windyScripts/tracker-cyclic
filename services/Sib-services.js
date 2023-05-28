
const Sib = require('sib-api-v3-sdk');

exports.sendEmail = async function(sender, receiver, subject, textContent, htmlContent, params) {
  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications['api-key'];
  apiKey.apiKey = process.env.SIB_SMTP_API_KEY;
  if (!client) return new Promise((res, rej) => rej('Invalid client'));

  const transactionalEmailApi = new Sib.TransactionalEmailsApi();
  try {
    return new Promise((resolve, reject) => {
      transactionalEmailApi.sendTransacEmail({
        sender,
        to: receiver,
        subject,
        textContent,
        htmlContent,
        params,
      }).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

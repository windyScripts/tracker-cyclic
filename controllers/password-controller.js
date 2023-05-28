
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const PasswordRequests = require('../services/password-services');
const Sib = require('../services/Sib-services');
const User = require('../services/user-services');

exports.forgotPassword = async (req, res) => {
  try {
    const sender = {
      name: process.env.EMAIL_SENDER_NAME,
      email: process.env.EMAIL_SENDER_ADDRESS,
    };

    const receiver = [{ email: req.body.email }];

    const reqId = uuidv4();
    const user = await User.findOne({  email: req.body.email });

    if (user) {
      await PasswordRequests.create({ userId: user._id, date: new Date(), id: reqId });
      const subject = 'Expense Tracker: Password reset response';
      const textContent = 'Here is the link to reset your password:';
      const htmlContent = '<a href="{{params.passwordURL}}">Reset password</a>';
      const params = {
        passwordURL: 'http://localhost:3000/password/resetpassword/' + reqId,
      };

      await Sib.sendEmail(sender, receiver, subject, textContent, htmlContent, params);
      return res.status(200).json({ message: 'Email sent successfully' });
    } else {
      return res.status(400).json({ message: 'That email does not exist in records' });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getPasswordUpdateForm = async (req, res) => {
  try {
    const id = req.params.reqId;
    const passwordRequest = await PasswordRequests.findOne({ id });
    if (passwordRequest && passwordRequest.isActive) {
      return res.status(200).send(`<html>
        <script>
            function formsubmitted(e){
                e.preventDefault();
                console.log('called')
            }
        </script>
        <form action="/password/updatepassword/${id}" method="get">
            <label for="newpassword">Enter New password</label>
            <input name="newpassword" type="password" required></input>
            <button>reset password</button>
        </form>
    </html>`,
      );
    } else return res.status(401).json({ message: 'Reset link expired/invalid' });
  } catch (err) {
    console.log(err);
  }
};

exports.setPassword = async (req, res) => {
  try {
    // store password, make isActive for request false.
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;
    const passwordRequest = await PasswordRequests.findOne({
      id: resetpasswordid,
    });
    const user = await User.findOne({
      _id: passwordRequest.userId,
    });
    console.log(resetpasswordid, passwordRequest);
    if (user) {
      const saltRounds = 10;
      bcrypt.hash(newpassword, saltRounds, (err, hash) => {
        if (err) {
          res.status(500).json({ message: 'Something went wrong' });
        }
        user.password = hash;
        passwordRequest.isActive = false;
        const p1 = User.save(user);
        const p2 = PasswordRequests.save(passwordRequest);
        Promise.all([p1, p2]).then(() => {
          res.status(201).json({ message: 'Successfully updated new password' });
        });
      });
    } else return res.status(404).json({ error: 'No user Exists', success: false });
  } catch (err) {
    return res.status(403).json({ error: err, success: false });
  }
};

export const mailBody = (htmlMessage) => {
  const body = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center;">
        <h1 style="color: #4CAF50;">Task App</h1>
        <p style="font-size: 18px;">Your trusted app for task management</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee;"/>

      <div style="padding: 20px 0;">
        <h2 style="font-size: 22px; color: #333;">Hi,</h2>
        <p style="font-size: 16px;">
          Thank you for using <strong>Task App</strong>. Your One-Time Password (OTP) for reset password is:
        </p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 24px; font-weight: bold; color: #333;">${htmlMessage}</p>
        </div>
        <p style="font-size: 16px;">
          Please enter this OTP within the next 10 minutes to verify your identity. If you did not request this, please ignore this email or contact our support team.
        </p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee;"/>

      <div style="text-align: center; color: #777; font-size: 14px;">
        <p>Task App © ${new Date().getFullYear()}</p>
        <p><a href="https://taskapp.com" style="color: #4CAF50; text-decoration: none;">Visit Task App</a> | <a href="mailto:support@taskapp.com" style="color: #4CAF50; text-decoration: none;">Contact Support</a></p>
      </div>
    </div>
  `;
  return body;
};

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are present
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export const sendMobileOtp = async (to: string, otp: string) => {
  if (!client) {
    console.error('Twilio credentials not found');
    throw new Error('Twilio service not configured');
  }

  try {
    // Remove any non-digit characters except leading +
    let cleanNumber = to.replace(/[^\d+]/g, '');
    
    let formattedTo = cleanNumber;
    if (!formattedTo.startsWith('+')) {
        // If the user inputs 10 digits, we assume India (+91)
        if (formattedTo.length === 10) {
            formattedTo = '+91' + formattedTo;
        }
    }
    
    console.log(`Attempting to send OTP to ${formattedTo} using Twilio from ${phoneNumber}`);

    const message = await client.messages.create({
      body: `Your verification code for Dream Properties is ${otp}. Valid for 5 minutes.`,
      from: phoneNumber,
      to: formattedTo,
    });

    console.log(`Twilio Message SID: ${message.sid}, Status: ${message.status}`);
    return message.sid;
  } catch (error: any) {
    console.error('Error sending mobile OTP:', JSON.stringify(error, null, 2));
    throw error;
  }
};

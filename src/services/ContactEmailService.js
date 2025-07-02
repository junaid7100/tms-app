class ContactEmailService {
  static async sendContactEmail(formData, source = 'Contact Form') {
    const adminEmail = "jasonmiller.dev87@gmail.com";
    const senderName = "TMS of Emerald Coast";
    const senderEmail = "onboarding@resend.dev";
    const resendApiKey = "re_a6sV9E4m_7z2rZVBbLQpkxbuqdLCam3DR";

    const preferredDateFormatted = formData.date 
      ? new Date(formData.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Not specified';
    
    const submissionTime = new Date().toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      second: 'numeric', 
      timeZoneName: 'short' 
    });

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Message Submission</title>
<style>
  body { margin: 0; padding: 0; width: 100% !important; -webkit-font-smoothing: antialiased; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; color: #333333; }
  .email-container { max-width: 680px; margin: 20px auto; background-color: #F7FAFC; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  .header { background-color: #2C5282; padding: 35px 25px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; margin: 0 0 5px 0; font-weight: 500; }
  .header p { color: #ffffff; font-size: 14px; margin: 0; }
  .attention-banner { background-color: #FED7D7; padding: 10px 20px; border-left: 5px solid #CC0000; margin: 20px 20px; }
  .attention-banner p { margin: 0; font-size: 14px; font-weight: bold; color: #222222; }
  .content { padding: 20px 30px 30px 30px; }
  .field-block { margin-bottom: 18px; }
  .field-block label { display: block; font-size: 14px; color: #2c5264; font-weight: bold; margin-bottom: 6px; }
  .field-block .value { font-size: 13px; color: #333333; padding: 12px; background-color: #FFFFFF; border-radius: 5px; border: 1px solid #e9ecef; word-wrap: break-word; white-space: pre-wrap; }
  .field-block .value a { color: #2E6AD2; text-decoration: none; }
  .footer { text-align: center; padding: 20px; font-size: 12px; color: #777777; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>New Message Submission</h1>
      <p>From: TMS of Emerald Coast App</p>
    </div>
    <div class="attention-banner">
      <p>&#9888;&#65039; New patient inquiry requires attention</p>
    </div>
    <div class="content">
      <div class="field-block">
        <label>Patient Name:</label>
        <div class="value">${formData.name}</div>
      </div>
      <div class="field-block">
        <label>Email Address:</label>
        <div class="value"><a href="mailto:${formData.email.trim()}">${formData.email.trim()}</a></div>
      </div>
      <div class="field-block">
        <label>Preferred Date:</label>
        <div class="value">${preferredDateFormatted}</div>
      </div>
      <div class="field-block">
        <label>Consultation Type:</label>
        <div class="value">${formData.consultationType}</div>
      </div>
      ${formData.message ? `
      <div class="field-block">
        <label>Message:</label>
        <div class="value">${formData.message}</div>
      </div>
      ` : ''}
      <div class="field-block">
        <label>Submission Time:</label>
        <div class="value">${submissionTime}</div>
      </div>
      <div class="field-block">
        <label>Source:</label>
        <div class="value">${source}</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} TMS of Emerald Coast. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const emailData = {
      from: `"${senderName}" <${senderEmail}>`,
      to: [adminEmail],
      subject: `New Message Submission from ${formData.name}`,
      html: htmlBody,
      reply_to: formData.email.trim(),
    };

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Resend API error:', responseData);
        throw new Error(responseData.message || "Failed to send email via Resend.");
      }

      console.log('Contact email sent successfully:', responseData);
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error sending contact email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email asynchronously in the background
   * This function doesn't throw errors to avoid blocking the UI
   */
  static sendEmailInBackground(formData, source = 'Contact Form') {
    // Fire and forget - send email asynchronously without blocking UI
    this.sendContactEmail(formData, source)
      .then(result => {
        if (result.success) {
          console.log('Background email sent successfully');
        } else {
          console.error('Background email failed:', result.error);
          // Could implement retry logic here if needed
        }
      })
      .catch(error => {
        console.error('Background email error:', error);
        // Could implement retry logic here if needed
      });
  }

  /**
   * Handle contact form submission with immediate success and background email
   */
  static async handleContactFormSubmission(formData, source = 'Contact Form') {
    // Immediately show success after 1 second
    return new Promise((resolve) => {
      setTimeout(() => {
        // Send email in background without blocking the UI
        this.sendEmailInBackground(formData, source);
        
        // Resolve immediately with success
        resolve({ 
          success: true, 
          message: 'Your message has been sent successfully!' 
        });
      }, 1000);
    });
  }
}

export default ContactEmailService; 
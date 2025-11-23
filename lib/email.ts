import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendConfirmationEmailParams {
    to: string;
    attendeeName: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    nftTxid?: string;
    network: string;
}

export async function sendConfirmationEmail({
    to,
    attendeeName,
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    nftTxid,
    network,
}: SendConfirmationEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email service not configured' };
    }

    const explorerUrl = network === 'mainnet'
        ? `https://blockchair.com/bitcoin-cash/transaction/${nftTxid}`
        : `https://chipnet.chaingraph.cash/tx/${nftTxid}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Dance.cash <noreply@dance.cash>',
            to: [to],
            subject: `Ticket Confirmation: ${eventName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 You're All Set!</h1>
                        <p style="margin: 10px 0 0 0; color: #e9d5ff; font-size: 16px;">Your ticket has been confirmed</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px;">Hi ${attendeeName},</p>
                        <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Thank you for booking with Dance.cash! Your payment has been confirmed and your NFT ticket has been minted on the Bitcoin Cash blockchain.
                        </p>
                        
                        <!-- Event Details Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                          <tr>
                            <td>
                              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: bold;">${eventName}</h2>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">📅 Date:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">🕐 Time:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${eventTime}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">📍 Location:</td>
                                  <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${eventLocation}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        ${nftTxid && !nftTxid.startsWith('error_') ? `
                        <!-- NFT Ticket Info -->
                        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                          <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">✅ Your NFT Ticket</p>
                          <p style="margin: 0 0 12px 0; color: #047857; font-size: 13px;">Your ticket has been minted as an NFT on the Bitcoin Cash blockchain!</p>
                          <a href="${explorerUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 500;">View on Blockchain Explorer</a>
                        </div>
                        ` : ''}
                        
                        <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                          We're excited to see you at the event! If you have any questions, please don't hesitate to reach out.
                        </p>
                        
                        <p style="margin: 0; color: #4b5563; font-size: 14px;">
                          Best regards,<br>
                          <strong style="color: #9333ea;">The Dance.cash Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                          Powered by Bitcoin Cash & CashTokens
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Dance.cash. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        console.log('Confirmation email sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error };
    }
}

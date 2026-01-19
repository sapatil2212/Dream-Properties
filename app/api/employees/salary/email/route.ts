import { NextRequest, NextResponse } from 'next/server';
import { transporter } from '@/lib/mailer';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as Blob;
        const email = formData.get('email') as string;
        const name = formData.get('name') as string;
        const month = formData.get('month') as string;
        const year = formData.get('year') as string;

        if (!file || !email || !name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const monthName = new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'long' });

        const mailOptions = {
            from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: `Salary Slip for ${monthName} ${year} - Dream Properties`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Salary Slip Notification</h2>
                    <p>Dear ${name},</p>
                    <p>Please find attached your salary slip for the month of <strong>${monthName} ${year}</strong>.</p>
                    <p>If you have any discrepancies, please contact the HR department immediately.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p><strong>Dream Properties HR Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `Salary_Slip_${monthName}_${year}.pdf`,
                    content: buffer
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Salary slip sent successfully' });
    } catch (error) {
        console.error('Error sending salary slip email:', error);
        return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Simple in-memory rate map
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  if (clientIp !== 'unknown') {
    let rateData = rateLimitMap.get(clientIp);
    if (!rateData) {
      rateData = { count: 0, firstRequestTime: now };
    }
    if (now - rateData.firstRequestTime > RATE_LIMIT_WINDOW_MS) {
      rateData = { count: 1, firstRequestTime: now };
    } else {
      rateData.count += 1;
    }
    rateLimitMap.set(clientIp, rateData);

    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = body.name as string | undefined;
  const email = body.email as string | undefined;
  const message = body.message as string | undefined;
  const additional_info = body.additional_info as string | undefined;
  const imageBase64 = body.imageBase64 as string | null | undefined;
  const images = body.images as Array<{ filename?: string; data?: string }> | undefined;
  const clientImageFailures = body.clientImageFailures as Array<{ filename?: string; reason?: string }> | undefined;

  // Honeypot check
  if (additional_info) {
    return NextResponse.json({ message: 'Success' });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ message: 'Name, email, and message are required.' }, { status: 400 });
  }

  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('[submit] Missing SMTP credentials');
    return NextResponse.json({ message: 'Email service not configured.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const mailTo = process.env.EMAIL_TO || process.env.CONTACT_EMAIL_TO || 'struction.dev@gmail.com';

  type FailRow = { stage: 'client' | 'server'; filename: string; reason: string };
  const allFailures: FailRow[] = [];

  if (Array.isArray(clientImageFailures)) {
    for (const row of clientImageFailures) {
      const fn = typeof row?.filename === 'string' ? row.filename : '(unknown file)';
      const reason = typeof row?.reason === 'string' ? row.reason : 'not included';
      allFailures.push({ stage: 'client', filename: fn, reason });
    }
  }

  const attachments: { filename: string; content: string; encoding: 'base64' }[] = [];

  const pushAttachment = (dataUrl: string, preferredName: string, index: number): void => {
    const parts = dataUrl.split(';base64,');
    if (parts.length < 2 || !parts[1]?.trim()) {
      allFailures.push({ stage: 'server', filename: preferredName, reason: 'missing or invalid base64 payload' });
      return;
    }
    const base64Data = parts.pop() as string;
    const safe = preferredName.replace(/[^a-zA-Z0-9._-]/g, '_') || `image-${index + 1}.jpg`;
    const withExt = /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(safe) ? safe : `${safe.replace(/\.+$/, '')}.jpg`;
    attachments.push({ filename: withExt, content: base64Data, encoding: 'base64' });
  };

  if (Array.isArray(images) && images.length > 0) {
    images.forEach((item, i) => {
      const preferred = typeof item?.filename === 'string' && item.filename.trim() ? item.filename.trim() : `attachment-${i + 1}.jpg`;
      const data = typeof item?.data === 'string' ? item.data : '';
      if (!data || !data.includes('base64,')) {
        allFailures.push({ stage: 'server', filename: preferred, reason: 'no image data in request' });
        return;
      }
      try {
        pushAttachment(data, preferred, i);
      } catch (e) {
        allFailures.push({ stage: 'server', filename: preferred, reason: e instanceof Error ? e.message : String(e) });
      }
    });
  } else if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.includes('base64,')) {
    pushAttachment(imageBase64, 'attachment.jpg', 0);
  }

  const failureHtml =
    allFailures.length === 0
      ? ''
      : `<div style="margin-top:16px;padding:12px;border:1px solid #f59e0b;background:#fffbeb;color:#92400e;border-radius:8px;">
          <strong>Attachment issues (${allFailures.length})</strong>
          <ul style="margin:8px 0 0 16px;padding:0;">
            ${allFailures.map((f) => `<li><strong>${escapeHtml(f.stage)}</strong> — ${escapeHtml(f.filename)}: ${escapeHtml(f.reason)}</li>`).join('')}
          </ul>
        </div>`;

  const subject = allFailures.length > 0
    ? `[attachment note] New Project Request from ${name}`
    : `New Project Request from ${name}`;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: mailTo,
      subject,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`,
      html: `<h2>New Project Discussion Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
        ${failureHtml}`,
      attachments: attachments.length ? attachments : undefined,
    });
    return NextResponse.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email. Please check server logs.' }, { status: 500 });
  }
}

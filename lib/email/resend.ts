import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.PROJECT_NOTIFICATIONS_FROM
const fallbackRecipients = process.env.PROJECT_NOTIFICATIONS_CC
  ? process.env.PROJECT_NOTIFICATIONS_CC.split(",").map((item) => item.trim()).filter(Boolean)
  : []

const resendClient = apiKey ? new Resend(apiKey) : null

type SendProjectEmailOptions = {
  to: string | string[]
  subject: string
  html: string
}

export async function sendProjectNotificationEmail(options: SendProjectEmailOptions) {
  if (!resendClient || !fromAddress) {
    return { skipped: true }
  }

  const toArray = Array.isArray(options.to) ? options.to : [options.to]
  const recipients = [...new Set([...toArray.filter(Boolean), ...fallbackRecipients])]

  if (recipients.length === 0) {
    return { skipped: true }
  }

  await resendClient.emails.send({
    from: fromAddress,
    to: recipients,
    subject: options.subject,
    html: options.html,
  })

  return { sent: true, to: recipients }
}

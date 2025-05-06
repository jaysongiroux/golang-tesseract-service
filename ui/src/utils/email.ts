import "server-only";

import { Resend } from "resend";

export const sendEmail = async ({
  to,
  subject,
  template,
}: {
  to: string[];
  subject: string;
  template: React.ReactNode;
}) => {
  const resend = new Resend(process.env.RESEND_API_KET);

  if (process.env.NODE_ENV === "development") {
    console.log("---");
    console.log(`Sending Email to ${to}`);
    console.log(template);
    console.log("---");
    return;
  }
  const { data, error } = await resend.emails.send({
    from: `${process.env.NEXT_PUBLIC_PRODUCT_NAME} <noreply@${process.env.NEXT_PUBLIC_DOMAIN_NAME?.toLowerCase()}>`,
    to,
    subject,
    react: template,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

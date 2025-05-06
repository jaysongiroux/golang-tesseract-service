import * as React from "react";

interface InviteEmailTemplateProps {
  toEmail: string;
  organizationName: string;
  authorName?: string;
}

export const InviteEmailTemplate = ({
  toEmail,
  organizationName,
  authorName,
}: InviteEmailTemplateProps) => (
  <div>
    <h1>You&apos;ve been invited to join {organizationName}!</h1>
    <p>Hello {toEmail},</p>
    <p>
      Welcome to {process.env.NEXT_PUBLIC_PRODUCT_NAME}, an AI driven document
      processing platform.
    </p>
    <p>
      You&apos;ve been invited to join {organizationName}
      {authorName ? ` by ${authorName}` : ""}.
    </p>
    <p>Click the link below to accept the invitation:</p>
    <a href={`${process.env.NEXT_PUBLIC_APP_URL}/platform/organizations`}>
      Accept Invitation
    </a>
  </div>
);

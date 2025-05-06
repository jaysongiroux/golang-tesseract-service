import {
  OrganizationMemberAPIKeyScope,
  OrganizationMemberPermissions,
} from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";

export const calculatePasswordStrength = (password: string): number => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*]/.test(password);

  let strength = 0;

  if (password.length >= 8) strength++;
  if (hasUpperCase && hasLowerCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecialChars) strength++;
  if (password?.length > 12) strength++;

  return strength;
};

// require
export const passwordSchema = z
  .string({
    message: "Password is required",
  })
  .min(8, {
    message: "Password must be at least 8 characters long",
  })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });

export const nameSchema = z
  .string({
    message: "Name is required",
  })
  .min(1, {
    message: "Name must be at least 1 character long",
  })
  .max(255, {
    message: "Name must be less than 255 characters",
  })
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

export const emailSchema = z
  .string({
    message: "Email is required",
  })
  .email("Invalid email address");

export const scopeSchema = z.array(z.nativeEnum(OrganizationMemberAPIKeyScope));

export const organizationIdSchema = z.string({
  message: "Organization ID is required",
});

export const expirationDateSchema = z
  .string({
    message: "Expiration date is required",
  })
  .refine((date) => dayjs(date).isValid() && dayjs(date).isAfter(dayjs()), {
    message: "Expiration date cannot be in the past",
  });

export const newAPITokenSchema = z.object({
  name: z
    .string({
      message: "Name is required",
    })
    .min(1, {
      message: "Name must be at least 1 character long",
    })
    .max(255, {
      message: "Name must be less than 255 characters",
    }),
  scopes: scopeSchema.min(1, {
    message: "At least one scope is required",
  }),
  expirationDate: expirationDateSchema.optional().nullable(),
});

const organizationNameSchema = z
  .string({
    message: "Name is required",
  })
  .min(1, {
    message: "Name must be at least 1 character long",
  })
  .max(255, {
    message: "Name must be less than 255 characters",
  })
  .regex(
    /^[a-zA-Z0-9\s]+$/,
    "Name can only contain letters, numbers and spaces"
  );

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  email: emailSchema,
});

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
});

export const permissionsSchema = z
  .array(z.nativeEnum(OrganizationMemberPermissions))
  .min(1, {
    message: "At least one permission is required",
  });

export const inviteMemberClientSchema = z.object({
  email: emailSchema,
  permissions: permissionsSchema,
});

export const inviteMemberSchema = z.object({
  ...inviteMemberClientSchema.shape,
  organizationId: organizationIdSchema,
});

export const acceptInviteSchema = z.object({
  inviteId: z
    .string({
      message: "Invite ID is required",
    })
    .max(255, {
      message: "Invite ID must be less than 255 characters",
    }),
});

const limitSchema = z
  .number({
    message: "Limit is required",
  })
  .min(1, {
    message: "Limit must be greater than 0",
  })
  .max(30, {
    message: "Limit must be less than 30",
  });

const offsetSchema = z
  .number({
    message: "Offset is required",
  })
  .min(0, {
    message: "Offset must be greater than 0",
  });

export const getOrganizationInvitesSchema = z.object({
  organizationId: organizationIdSchema,
  limit: limitSchema,
  offset: offsetSchema,
});

export const getInviteForUserSchema = z.object({
  limit: limitSchema,
  offset: offsetSchema,
});

export const editMemberPermissionsSchema = z.object({
  memberId: z
    .string({
      message: "Member ID is required",
    })
    .max(255, {
      message: "Member ID must be less than 255 characters",
    }),
  organizationId: organizationIdSchema,
  permissions: permissionsSchema,
});

export const editInviteSchema = z.object({
  inviteId: z
    .string({
      message: "Invite ID is required",
    })
    .max(255, {
      message: "Invite ID must be less than 255 characters",
    }),
  permissions: permissionsSchema,
});

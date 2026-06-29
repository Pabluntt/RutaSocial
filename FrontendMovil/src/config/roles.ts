export const Role = {
  Admin: 'admin',
  Volunteer: 'voluntario',
} as const;

export type RoleValue = typeof Role[keyof typeof Role];

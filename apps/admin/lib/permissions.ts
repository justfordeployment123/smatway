// Mirror of apps/api/src/modules/admin/admin.permissions.ts — kept as plain
// constants on the frontend so the permission picker on the Admins page can
// render labelled checkboxes without an extra fetch.

export const ADMIN_PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',

  ROUTES_READ: 'routes:read',
  ROUTES_EDIT: 'routes:edit',
  ROUTES_DELETE: 'routes:delete',

  VEHICLES_READ: 'vehicles:read',
  VEHICLES_EDIT: 'vehicles:edit',
  VEHICLES_DELETE: 'vehicles:delete',

  BOOKINGS_READ: 'bookings:read',
  BOOKINGS_EDIT: 'bookings:edit',

  FINANCE_READ: 'finance:read',
  FINANCE_REFUND: 'finance:refund',

  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_DELETE: 'feedback:delete',

  REVIEWS_READ: 'reviews:read',
  REVIEWS_DELETE: 'reviews:delete',

  ANNOUNCEMENTS_READ: 'announcements:read',
  ANNOUNCEMENTS_CREATE: 'announcements:create',
  ANNOUNCEMENTS_DELETE: 'announcements:delete',

  ADMINS_READ: 'admins:read',
  ADMINS_CREATE: 'admins:create',
  ADMINS_EDIT: 'admins:edit',
  ADMINS_DELETE: 'admins:delete',

  AUDIT_READ: 'audit:read',
  SETTINGS_EDIT: 'settings:edit',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = Object.values(ADMIN_PERMISSIONS);

export const ADMIN_PERMISSION_GROUPS: Array<{
  label: string;
  permissions: Array<{ value: AdminPermission; label: string; description: string }>;
}> = [
  {
    label: 'Users',
    permissions: [
      { value: ADMIN_PERMISSIONS.USERS_READ, label: 'View users', description: 'Browse and search the user list and detail.' },
      { value: ADMIN_PERMISSIONS.USERS_EDIT, label: 'Edit users', description: 'Suspend / reactivate / edit user records.' },
      { value: ADMIN_PERMISSIONS.USERS_DELETE, label: 'Delete users', description: 'Permanently remove a user.' },
    ],
  },
  {
    label: 'Routes',
    permissions: [
      { value: ADMIN_PERMISSIONS.ROUTES_READ, label: 'View routes', description: 'See all transports / routes on the platform.' },
      { value: ADMIN_PERMISSIONS.ROUTES_EDIT, label: 'Edit routes', description: 'Force-deactivate or edit a route.' },
      { value: ADMIN_PERMISSIONS.ROUTES_DELETE, label: 'Delete routes', description: 'Permanently delete a route.' },
    ],
  },
  {
    label: 'Vehicles',
    permissions: [
      { value: ADMIN_PERMISSIONS.VEHICLES_READ, label: 'View vehicles', description: 'See all vehicles registered by transporters.' },
      { value: ADMIN_PERMISSIONS.VEHICLES_EDIT, label: 'Edit vehicles', description: 'Edit a vehicle’s details.' },
      { value: ADMIN_PERMISSIONS.VEHICLES_DELETE, label: 'Delete vehicles', description: 'Soft-delete a vehicle.' },
    ],
  },
  {
    label: 'Bookings',
    permissions: [
      { value: ADMIN_PERMISSIONS.BOOKINGS_READ, label: 'View bookings', description: 'List and inspect all bookings.' },
      { value: ADMIN_PERMISSIONS.BOOKINGS_EDIT, label: 'Edit bookings', description: 'Cancel or adjust a booking.' },
    ],
  },
  {
    label: 'Finance',
    permissions: [
      { value: ADMIN_PERMISSIONS.FINANCE_READ, label: 'View finance', description: 'Revenue dashboards, payouts, reconciliation.' },
      { value: ADMIN_PERMISSIONS.FINANCE_REFUND, label: 'Issue refunds', description: 'Trigger a refund on a paid booking.' },
    ],
  },
  {
    label: 'Feedback & Reviews',
    permissions: [
      { value: ADMIN_PERMISSIONS.FEEDBACK_READ, label: 'View site feedback', description: 'See feedback submitted from the dashboard.' },
      { value: ADMIN_PERMISSIONS.FEEDBACK_DELETE, label: 'Delete site feedback', description: 'Remove inappropriate feedback.' },
      { value: ADMIN_PERMISSIONS.REVIEWS_READ, label: 'View trip reviews', description: 'See per-booking transporter reviews.' },
      { value: ADMIN_PERMISSIONS.REVIEWS_DELETE, label: 'Delete trip reviews', description: 'Remove inappropriate trip reviews.' },
    ],
  },
  {
    label: 'Announcements',
    permissions: [
      { value: ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ, label: 'View announcements', description: 'See all platform announcements.' },
      { value: ADMIN_PERMISSIONS.ANNOUNCEMENTS_CREATE, label: 'Create announcements', description: 'Publish new announcements to travelers/transporters.' },
      { value: ADMIN_PERMISSIONS.ANNOUNCEMENTS_DELETE, label: 'Delete announcements', description: 'Remove a published announcement.' },
    ],
  },
  {
    label: 'Admins',
    permissions: [
      { value: ADMIN_PERMISSIONS.ADMINS_READ, label: 'View admins', description: 'See the list of platform admins.' },
      { value: ADMIN_PERMISSIONS.ADMINS_CREATE, label: 'Create admins', description: 'Invite or directly add new admins.' },
      { value: ADMIN_PERMISSIONS.ADMINS_EDIT, label: 'Edit admins', description: 'Change another admin’s permissions, role, or active state.' },
      { value: ADMIN_PERMISSIONS.ADMINS_DELETE, label: 'Delete admins', description: 'Permanently remove an admin row.' },
    ],
  },
  {
    label: 'System',
    permissions: [
      { value: ADMIN_PERMISSIONS.AUDIT_READ, label: 'View audit log', description: 'Read the append-only admin action log.' },
      { value: ADMIN_PERMISSIONS.SETTINGS_EDIT, label: 'Edit settings', description: 'Modify platform-wide settings.' },
    ],
  },
];

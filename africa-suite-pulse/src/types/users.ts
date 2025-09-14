// User management types
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Permission,
  ProfilePermission,
  ProfilePermissionInsert,
  AppUser,
  AppUserInsert,
  AppUserUpdate,
  StaffInvitation,
  StaffInvitationInsert,
  InvitationPayload
} from './database';

// Re-export database types
export type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Permission,
  ProfilePermission,
  ProfilePermissionInsert,
  AppUser,
  AppUserInsert,
  AppUserUpdate,
  StaffInvitation,
  StaffInvitationInsert,
  InvitationPayload
};

// User roles
export type UserRole = 'admin' | 'manager' | 'staff';

// Profile access levels
export type AccessLevel = 'A' | 'M' | 'T'; // Admin, Manager, Technician

// Permission categories
export type PermissionCategory = 
  | 'system'
  | 'reservations'
  | 'rooms'
  | 'billing'
  | 'reports'
  | 'settings';

// Profile with permissions
export type ProfileWithPermissions = Profile & {
  permissions: ProfilePermission[];
};

// App user with profile details
export type AppUserWithProfile = AppUser & {
  profiles: {
    id: string;
    code: string;
    label: string;
    access_level: AccessLevel;
  } | null;
};

// User invitation status
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// Staff invitation with status
export type StaffInvitationWithStatus = StaffInvitation & {
  status: InvitationStatus;
};

// Permission with category
export type PermissionWithCategory = Permission & {
  category: PermissionCategory;
  allowed?: boolean; // For profile permissions
};

// User session data
export type UserSession = {
  id: string;
  user_id: string;
  org_id: string;
  full_name: string;
  role: UserRole;
  permissions: string[];
  profile?: {
    id: string;
    code: string;
    label: string;
    access_level: AccessLevel;
  };
};

// User creation payload
export type CreateUserPayload = {
  org_id: string;
  full_name: string;
  login: string;
  profile_id?: string;
  password_expires_on?: string;
  active?: boolean;
};

// User update payload
export type UpdateUserPayload = {
  full_name?: string;
  login?: string;
  profile_id?: string;
  password_expires_on?: string;
  active?: boolean;
};
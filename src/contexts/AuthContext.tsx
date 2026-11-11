import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { Profile, Organization, OrganizationMember, MemberRole } from '../types/database.ts';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  currentOrg: Organization | null;
  memberships: OrganizationMember[];
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  switchOrganization: (orgId: string) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  createOrganization: (name: string, isAgency?: boolean) => Promise<{ error: string | null; org?: Organization }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dev storage keys for unconfigured evaluation
const DEV_USER_KEY = 'storepulse_dev_user';
const DEV_PROFILE_KEY = 'storepulse_dev_profile';
const DEV_ORGS_KEY = 'storepulse_dev_orgs';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize dev mode defaults if not in real Supabase mode
  const initDevAuth = () => {
    try {
      const savedUser = localStorage.getItem(DEV_USER_KEY);
      const savedProfile = localStorage.getItem(DEV_PROFILE_KEY);
      const savedOrgs = localStorage.getItem(DEV_ORGS_KEY);

      if (savedUser && savedProfile && savedOrgs) {
        const u = JSON.parse(savedUser);
        const p = JSON.parse(savedProfile);
        const orgs: Organization[] = JSON.parse(savedOrgs);
        setUser(u);
        setProfile(p);
        const mems: OrganizationMember[] = orgs.map((o) => ({
          id: `mem-${o.id}`,
          organization_id: o.id,
          user_id: u.id,
          role: 'owner' as MemberRole,
          created_at: new Date().toISOString(),
        }));
        setMemberships(mems);
        const active = orgs.find((o) => o.id === p.current_organization_id) || orgs[0];
        setCurrentOrg(active || null);
      } else {
        // Default initial session for immediate testing
        const defaultUser = {
          id: 'usr-foundation-demo-01',
          email: 'founder@storepulse.ai',
          user_metadata: { full_name: 'Bakhtawer Hashmi' },
        };
        const defaultOrg: Organization = {
          id: 'org-demo-001',
          name: 'Apex E-Commerce Labs',
          slug: 'apex-ecommerce-labs',
          created_by: defaultUser.id,
          branding: { primary_color: '#2563EB', logo_url: null },
          is_agency: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const defaultProfile: Profile = {
          id: defaultUser.id,
          email: defaultUser.email,
          full_name: 'Bakhtawer Hashmi',
          avatar_url: null,
          system_role: 'admin',
          current_organization_id: defaultOrg.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUser(defaultUser);
        setProfile(defaultProfile);
        setCurrentOrg(defaultOrg);
        setMemberships([
          {
            id: 'mem-default-01',
            organization_id: defaultOrg.id,
            user_id: defaultUser.id,
            role: 'owner',
            created_at: new Date().toISOString(),
          },
        ]);

        localStorage.setItem(DEV_USER_KEY, JSON.stringify(defaultUser));
        localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(defaultProfile));
        localStorage.setItem(DEV_ORGS_KEY, JSON.stringify([defaultOrg]));
      }
    } catch (e) {
      console.warn('LocalStorage error in dev mode initialization', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load real Supabase profile and organizations
  const loadSupabaseUserData = async (userId: string) => {
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profErr) {
        console.warn('Failed to load profile:', profErr.message);
      } else if (prof) {
        setProfile(prof);
      }

      const { data: mems, error: memsErr } = await supabase
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', userId);

      if (memsErr) {
        console.warn('Failed to load memberships:', memsErr.message);
      } else if (mems && mems.length > 0) {
        setMemberships(mems as any);
        const orgMap = mems.map((m: any) => m.organization).filter(Boolean);
        const currentId = prof?.current_organization_id;
        const active = orgMap.find((o: Organization) => o.id === currentId) || orgMap[0];
        setCurrentOrg(active || null);
      }
    } catch (err) {
      console.error('Error fetching Supabase user state', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      initDevAuth();
      return;
    }

    // Check existing active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadSupabaseUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setCurrentOrg(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadSupabaseUserData(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setCurrentOrg(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Dev mode sign in
      const u = {
        id: `usr-${Date.now().toString(36)}`,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      const org: Organization = {
        id: `org-${Date.now().toString(36)}`,
        name: `${email.split('@')[0]}'s Workspace`,
        slug: `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}-ws`,
        created_by: u.id,
        branding: { primary_color: '#2563EB', logo_url: null },
        is_agency: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const p: Profile = {
        id: u.id,
        email: u.email,
        full_name: email.split('@')[0],
        avatar_url: null,
        system_role: 'free_user',
        current_organization_id: org.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(u);
      setProfile(p);
      setCurrentOrg(org);
      setMemberships([
        {
          id: `mem-${org.id}`,
          organization_id: org.id,
          user_id: u.id,
          role: 'owner',
          created_at: new Date().toISOString(),
        },
      ]);
      localStorage.setItem(DEV_USER_KEY, JSON.stringify(u));
      localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(p));
      localStorage.setItem(DEV_ORGS_KEY, JSON.stringify([org]));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return signIn(email, password);
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Sign up failed' };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      setCurrentOrg(null);
      setMemberships([]);
      localStorage.removeItem(DEV_USER_KEY);
      localStorage.removeItem(DEV_PROFILE_KEY);
      localStorage.removeItem(DEV_ORGS_KEY);
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Failed to send password reset email' };
    }
  };

  const switchOrganization = (orgId: string) => {
    if (!profile) return;
    const mem = memberships.find((m) => m.organization_id === orgId);
    if (!mem) return;

    if (profile) {
      const updatedProfile = { ...profile, current_organization_id: orgId };
      setProfile(updatedProfile);
      if (!isSupabaseConfigured) {
        localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(updatedProfile));
        const savedOrgs = localStorage.getItem(DEV_ORGS_KEY);
        if (savedOrgs) {
          const list: Organization[] = JSON.parse(savedOrgs);
          const found = list.find((o) => o.id === orgId);
          if (found) setCurrentOrg(found);
        }
      } else {
        supabase
          .from('profiles')
          .update({ current_organization_id: orgId })
          .eq('id', profile.id)
          .then();
      }
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: 'No active profile' };
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);

    if (!isSupabaseConfigured) {
      localStorage.setItem(DEV_PROFILE_KEY, JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Failed to update profile' };
    }
  };

  const createOrganization = async (name: string, isAgency = false) => {
    if (!profile || !user) return { error: 'Must be authenticated' };

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    if (!isSupabaseConfigured) {
      const newOrg: Organization = {
        id: `org-${Date.now().toString(36)}`,
        name,
        slug,
        created_by: user.id,
        branding: { primary_color: '#2563EB', logo_url: null },
        is_agency: isAgency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const savedOrgs = localStorage.getItem(DEV_ORGS_KEY);
      const list: Organization[] = savedOrgs ? JSON.parse(savedOrgs) : [];
      list.push(newOrg);
      localStorage.setItem(DEV_ORGS_KEY, JSON.stringify(list));

      const newMem: OrganizationMember = {
        id: `mem-${newOrg.id}`,
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'owner',
        created_at: new Date().toISOString(),
      };
      setMemberships([...memberships, newMem]);
      setCurrentOrg(newOrg);
      return { error: null, org: newOrg };
    }

    try {
      const { data: newOrg, error: orgErr } = await supabase
        .from('organizations')
        .insert({
          name,
          slug,
          created_by: user.id,
          is_agency: isAgency,
        })
        .select()
        .single();

      if (orgErr) return { error: orgErr.message };

      // Add membership
      await supabase.from('organization_members').insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'owner',
      });

      // Update current org
      await switchOrganization(newOrg.id);
      return { error: null, org: newOrg };
    } catch (e: any) {
      return { error: e.message || 'Failed to create organization' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentOrg,
        memberships,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        switchOrganization,
        updateProfile,
        createOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

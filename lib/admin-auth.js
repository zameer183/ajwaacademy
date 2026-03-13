export const adminAllowlist = [
  'ajwaacademyofficial@gmail.com',
  'ajwaacadmeyofficial@gmail.com',
  'admin@gmail.com',
  'muhammad@gmail.com',
];

export async function getAdminAccessSnapshot(supabase) {
  if (!supabase) {
    return {
      user: null,
      profile: null,
      email: '',
      isAdmin: false,
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData?.session?.user || null;

  if (!user) {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;
  }

  if (!user) {
    return {
      user: null,
      profile: null,
      email: '',
      isAdmin: false,
    };
  }

  let profile = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, role, is_admin')
      .eq('id', user.id)
      .maybeSingle();
    profile = data || null;
  } catch {
    profile = null;
  }

  const email = String(profile?.email || user.email || '').toLowerCase();
  const isAdminFromProfile = profile?.is_admin || profile?.role === 'admin';
  const isAdminFromMeta = user.user_metadata?.is_admin || user.user_metadata?.role === 'admin';
  const isAdminFromAllowlist = adminAllowlist.includes(email);

  return {
    user,
    profile,
    email,
    isAdmin: Boolean(isAdminFromProfile || isAdminFromMeta || isAdminFromAllowlist),
  };
}

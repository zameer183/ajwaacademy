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

  const profile = null;
  const email = String(user.email || '').toLowerCase();
  const isAdminFromProfile = false;
  const isAdminFromMeta = user.user_metadata?.is_admin || user.user_metadata?.role === 'admin';
  const isAdminFromAllowlist = adminAllowlist.includes(email);

  return {
    user,
    profile,
    email,
    isAdmin: Boolean(isAdminFromProfile || isAdminFromMeta || isAdminFromAllowlist),
  };
}

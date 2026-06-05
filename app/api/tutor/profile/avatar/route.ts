import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

async function ensureAvatarBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets?.some((bucket) => bucket.name === AVATAR_BUCKET);
  if (exists) return;

  const { error: createError } = await supabaseAdmin.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: MAX_AVATAR_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_TYPES.keys()),
  });
  if (createError) throw createError;
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image manquante' }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json({ error: 'Image trop lourde. Taille maximale: 5 Mo.' }, { status: 400 });
    }

    await ensureAvatarBucket();

    const path = `tutors/${user.id}/${Date.now()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Erreur upload avatar tuteur:', uploadError);
      return NextResponse.json({ error: 'Impossible d’envoyer la photo' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await (supabaseAdmin as any)
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur update avatar_url tuteur:', updateError);
      return NextResponse.json({ error: 'Photo envoyée, mais profil non mis à jour' }, { status: 500 });
    }

    return NextResponse.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('Erreur POST /api/tutor/profile/avatar:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

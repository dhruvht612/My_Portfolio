import { supabase } from '../supabase'

export function assertSupabase() {
  if (!supabase) {
    const err = new Error('NOT_CONFIGURED')
    err.code = 'NOT_CONFIGURED'
    throw err
  }
  return supabase
}

export function publicUrl(bucket, path) {
  const client = assertSupabase()
  const { data } = client.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl ?? ''
}

/**
 * @param {string} bucket
 * @param {File} file
 * @param {{ folder?: string, onProgress?: (n: number) => void }} [opts]
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export async function uploadToBucket(bucket, file, opts = {}) {
  const client = assertSupabase()
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const name = `${crypto.randomUUID()}.${ext}`
  const path = opts.folder ? `${opts.folder}/${name}` : name
  opts.onProgress?.(10)
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  opts.onProgress?.(100)
  if (error) throw error
  return { path, publicUrl: publicUrl(bucket, path) }
}

export async function removeFromBucket(bucket, path) {
  const client = assertSupabase()
  const { error } = await client.storage.from(bucket).remove([path])
  if (error) throw error
}

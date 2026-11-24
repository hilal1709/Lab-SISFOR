'use client'
import { useCallback, useEffect, useState } from 'react'

export async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { cache: 'no-store', ...options })
  } catch (error) {
    if (options?.signal?.aborted) throw error
    throw new Error('Koneksi terputus. Periksa jaringan dan coba lagi.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || data === null)
    throw new Error(data?.error || 'Permintaan gagal. Silakan coba lagi.')
  return data as T
}

export function useRemote<T>(url: string | null) {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{
    url: string
    revision: number
    data?: T
    error?: string
  }>()
  const retry = useCallback(() => setRevision((value) => value + 1), [])
  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    requestJson<T>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ url, revision, data })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ url, revision, error: error.message })
      })
    return () => controller.abort()
  }, [url, revision])
  const current = result?.url === url && result?.revision === revision ? result : undefined
  return { data: current?.data, error: current?.error, loading: !!url && !current, retry }
}

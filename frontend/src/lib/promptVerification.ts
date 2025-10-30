// Prompt verification utilities
import { supabase } from './supabase';

export async function hashPrompt(prompt: string): Promise<string> {
  // Normalize: lowercase, trim, remove extra spaces
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Use Web Crypto API (browser)
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkPromptDuplicate(
  promptHash: string,
  currentArtworkId?: string
): Promise<{ isDuplicate: boolean; existingArtworkId?: string }> {
  const { data, error } = await supabase
    .from('prompt_hashes')
    .select('artwork_id')
    .eq('prompt_hash', promptHash)
    .maybeSingle();

  if (error || !data) {
    return { isDuplicate: false };
  }

  // If checking against current artwork, don't flag as duplicate
  if (currentArtworkId && data.artwork_id === currentArtworkId) {
    return { isDuplicate: false };
  }

  return {
    isDuplicate: true,
    existingArtworkId: data.artwork_id
  };
}

export async function savePromptHash(
  artworkId: string,
  prompt: string
): Promise<void> {
  const hash = await hashPrompt(prompt);
  
  await supabase
    .from('prompt_hashes')
    .insert({
      artwork_id: artworkId,
      prompt_hash: hash
    });
}


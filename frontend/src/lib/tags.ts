// Tag management utilities
import { supabase } from './supabase';

export type Tag = {
  id: string;
  name: string;
};

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
  
  return data || [];
}

export async function getArtworkTags(artworkId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('artwork_tags')
    .select('tag_id, tags(*)')
    .eq('artwork_id', artworkId);
  
  if (error) {
    console.error('Error fetching artwork tags:', error);
    return [];
  }
  
  return (data || []).map((item: any) => item.tags).filter(Boolean);
}


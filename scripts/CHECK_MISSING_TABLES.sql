-- Check which tables/columns are missing
-- Run this in Supabase SQL Editor to see what needs to be created

-- Check for missing tables
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags') 
    THEN '❌ MISSING: tags table' 
    ELSE '✅ EXISTS: tags' 
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artwork_tags') 
    THEN '❌ MISSING: artwork_tags table' 
    ELSE '✅ EXISTS: artwork_tags' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') 
    THEN '❌ MISSING: comments table' 
    ELSE '✅ EXISTS: comments' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompt_hashes') 
    THEN '❌ MISSING: prompt_hashes table' 
    ELSE '✅ EXISTS: prompt_hashes' 
  END;

-- Check for missing columns in artworks table
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='prompt') 
    THEN '❌ MISSING: artworks.prompt column' 
    ELSE '✅ EXISTS: artworks.prompt' 
  END as artwork_columns
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='ai_model') 
    THEN '❌ MISSING: artworks.ai_model column' 
    ELSE '✅ EXISTS: artworks.ai_model' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='featured') 
    THEN '❌ MISSING: artworks.featured column' 
    ELSE '✅ EXISTS: artworks.featured' 
  END
UNION ALL
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='hidden') 
    THEN '❌ MISSING: artworks.hidden column' 
    ELSE '✅ EXISTS: artworks.hidden' 
  END;


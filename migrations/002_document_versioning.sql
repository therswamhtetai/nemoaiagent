-- Document Versioning Migration
-- Run this in Supabase SQL Editor

-- 1. Add versioning columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES documents(id);

-- 2. Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_documents_parent ON documents(parent_id);

-- 3. Add is_active column to knowledge_base
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_kb_active ON knowledge_base(is_active) WHERE is_active = true;

-- 4. Update RLS policies for documents
DROP POLICY IF EXISTS "API access with user_id" ON documents;
CREATE POLICY "API access with user_id" ON documents FOR ALL USING (true);

-- 5. Function to auto-archive old versions (keep last 3)
CREATE OR REPLACE FUNCTION archive_old_document_versions()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new version of existing document
  IF NEW.parent_id IS NOT NULL THEN
    -- Archive versions beyond the 3 most recent
    UPDATE documents 
    SET is_archived = true 
    WHERE parent_id = NEW.parent_id 
      AND is_archived = false
      AND id != NEW.id
      AND version < (
        SELECT MIN(version) FROM (
          SELECT version FROM documents 
          WHERE parent_id = NEW.parent_id 
          AND is_archived = false
          ORDER BY version DESC 
          LIMIT 3
        ) sub
      );
    
    -- Deactivate knowledge_base chunks for archived docs
    UPDATE knowledge_base 
    SET is_active = false 
    WHERE (metadata->>'document_id')::uuid IN (
      SELECT id FROM documents 
      WHERE parent_id = NEW.parent_id 
      AND is_archived = true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for auto-archive
DROP TRIGGER IF EXISTS trigger_archive_old_versions ON documents;
CREATE TRIGGER trigger_archive_old_versions
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION archive_old_document_versions();

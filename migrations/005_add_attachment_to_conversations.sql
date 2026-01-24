-- Add attachment column to conversations table
-- This stores image/document metadata so thumbnails persist after app restart

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS attachment JSONB DEFAULT NULL;

-- Add index for querying messages with attachments
CREATE INDEX IF NOT EXISTS idx_conversations_attachment
ON conversations ((attachment IS NOT NULL));

-- Comment for documentation
COMMENT ON COLUMN conversations.attachment IS 'Stores attachment metadata: {type, url, filename, mime_type}';

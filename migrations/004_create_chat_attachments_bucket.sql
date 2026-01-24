-- Create chat_attachments bucket for storing uploaded files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;

-- Allow anyone to upload files (including anon users)
CREATE POLICY "Allow uploads to chat-attachments"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow public read access for displaying in chat
CREATE POLICY "Allow public read chat-attachments"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'chat-attachments');

-- Allow anyone to delete files in this bucket
CREATE POLICY "Allow delete chat-attachments"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'chat-attachments');

-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates the storage buckets and their security policies.

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-images', 'project-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('request-images', 'request-images', false, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

-- 2. PROJECT-IMAGES Policies (Public portfolio images)

-- Anyone can view project images (public portfolio)
CREATE POLICY "project_images_public_read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'project-images');

-- Only admins can upload/edit/delete
CREATE POLICY "project_images_admin_insert" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images' 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "project_images_admin_update" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'project-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "project_images_admin_delete" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'project-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. REQUEST-IMAGES Policies (Client request attachments)

-- Authenticated users can upload
CREATE POLICY "request_images_auth_insert" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'request-images' 
    AND auth.role() = 'authenticated'
  );

-- Users see their own uploads + Admin sees all
CREATE POLICY "request_images_read" ON storage.objects 
  FOR SELECT USING (
    bucket_id = 'request-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Admin can delete any request image
CREATE POLICY "request_images_admin_delete" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'request-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

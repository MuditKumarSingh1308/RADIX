-- RADIX SkillSync — Supabase Database Migration
-- Table: candidate_profiles
-- Storage: resumes (private)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  headline TEXT DEFAULT 'Early Career Software Engineer & Technologist',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT 'Bengaluru, India',
  avatar TEXT DEFAULT 'CD',
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '{"COD": 6, "DSA": 6, "SWE": 6, "SQL": 6, "COMM": 7, "APTI": 6, "OOD": 6, "OS": 5, "NETW": 5, "SYSD": 5, "CLOUD": 5, "AI": 5}'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  internships JSONB DEFAULT '[]'::jsonb,
  hackathons JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  preferred_roles JSONB DEFAULT '["Software Engineer", "Full Stack Developer"]'::jsonb,
  resume_url TEXT DEFAULT NULL,
  resume_name TEXT DEFAULT NULL,
  resume_storage_path TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_candidate_profiles_updated_at ON public.candidate_profiles;
CREATE TRIGGER set_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.candidate_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.candidate_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.candidate_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.candidate_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.candidate_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.candidate_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.candidate_profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.candidate_profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
BEGIN
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.candidate_profiles (
    id, full_name, email, headline, avatar,
    education, skills, categories, projects, internships, hackathons, certifications, preferred_roles
  )
  VALUES (
    NEW.id,
    extracted_name,
    NEW.email,
    'Early Career Technologist · RADIX Candidate',
    UPPER(SUBSTRING(extracted_name FROM 1 FOR 2)),
    '[{"degree": "Bachelor of Technology in Computer Science", "institution": "National Institute of Technology", "year": "2024", "cgpa": "8.5 / 10.0"}]'::jsonb,
    '[]'::jsonb,
    '{"COD": 7, "DSA": 7, "SWE": 6, "SQL": 6, "COMM": 7, "APTI": 6, "OOD": 6, "OS": 6, "NETW": 5, "SYSD": 5, "CLOUD": 5, "AI": 5}'::jsonb,
    '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
    '["Software Engineer", "Full Stack Developer"]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 'resumes', false, 10485760,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own resume" ON storage.objects;
CREATE POLICY "Users can upload their own resume"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read their own resume" ON storage.objects;
CREATE POLICY "Users can read their own resume"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own resume" ON storage.objects;
CREATE POLICY "Users can update their own resume"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own resume" ON storage.objects;
CREATE POLICY "Users can delete their own resume"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

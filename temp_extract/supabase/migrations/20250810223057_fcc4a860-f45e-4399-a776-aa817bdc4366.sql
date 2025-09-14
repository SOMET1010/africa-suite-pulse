-- Insert profile for current authenticated user with existing org_id
INSERT INTO public.profiles (user_id, org_id)
SELECT auth.uid(), '018e8e1c-74e5-700e-9b90-0b62a5e7ad31'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid());

-- Enable INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable UPDATE policy for profiles  
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Add UPDATE policy for calls table to allow status updates
CREATE POLICY "Users can update their own calls" 
ON calls 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Also add a policy for service role to update call status via webhooks
CREATE POLICY "Service role can update call status" 
ON calls 
FOR UPDATE 
USING (true);
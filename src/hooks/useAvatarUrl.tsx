import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get a signed URL for an avatar image stored in the private avatars bucket.
 * Returns a signed URL that expires after 1 hour.
 * 
 * @param avatarPath - The file path stored in the profiles.avatar_url field
 * @returns Object containing the signed URL, loading state, and any error
 */
export function useAvatarUrl(avatarPath: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!avatarPath) {
      setSignedUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Check if it's already a full URL (legacy data from before private bucket)
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      // For legacy URLs, we need to extract the path and get a new signed URL
      const match = avatarPath.match(/\/avatars\/(.+)$/);
      if (match) {
        const extractedPath = match[1];
        fetchSignedUrl(extractedPath);
      } else {
        // Can't extract path, URL won't work anymore
        setSignedUrl(null);
        setError(new Error("Invalid avatar URL format"));
      }
      return;
    }

    fetchSignedUrl(avatarPath);

    async function fetchSignedUrl(path: string) {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: signedUrlError } = await supabase.storage
          .from("avatars")
          .createSignedUrl(path, 3600); // 1 hour expiry

        if (signedUrlError) {
          throw signedUrlError;
        }

        setSignedUrl(data?.signedUrl || null);
      } catch (err) {
        console.error("Error getting signed avatar URL:", err);
        setError(err instanceof Error ? err : new Error("Failed to get avatar URL"));
        setSignedUrl(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [avatarPath]);

  return { signedUrl, isLoading, error };
}

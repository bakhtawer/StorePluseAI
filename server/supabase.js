import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const isServerSupabaseConfigured = Boolean(
  supabaseUrl && serviceRoleKey && !supabaseUrl.includes("your-project") && !serviceRoleKey.includes("your-service-role-key")
);
const supabaseAdmin = isServerSupabaseConfigured ? createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;
async function verifyUserToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or malformed Authorization header" };
  }
  const token = authHeader.split(" ")[1];
  if (!supabaseAdmin) {
    return {
      user: {
        id: "dev-user-001",
        email: "bakhtawerhashmi@gmail.com",
        user_metadata: { full_name: "StorePulse Admin" }
      },
      error: null,
      isDevMock: true
    };
  }
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || "Invalid token" };
    }
    return { user, error: null, isDevMock: false };
  } catch (err) {
    return { user: null, error: err.message || "Token verification failed" };
  }
}
export {
  isServerSupabaseConfigured,
  supabaseAdmin,
  verifyUserToken
};

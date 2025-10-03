import { cookies } from "next/headers";

export async function getAuthStatus() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const userInfo = cookieStore.get("user_info")?.value;

    if (!accessToken) {
      return { isAuthenticated: false, user: null };
    }

    const user = userInfo ? JSON.parse(userInfo) : null;
    return { isAuthenticated: true, user };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isAuthenticated: false, user: null };
  }
}

export async function requireAuth() {
  const { isAuthenticated, user } = await getAuthStatus();

  if (!isAuthenticated) {
    throw new Error("Authentication required");
  }

  return { user };
}

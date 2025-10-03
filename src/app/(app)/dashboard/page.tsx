import { getAuthStatus } from "@/utils/auth.utils";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { isAuthenticated, user } = await getAuthStatus();

  if (!isAuthenticated) {
    redirect("/");
  }

  const handleLogout = async () => {
    "use server";
    redirect("/api/auth/logout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-black/20 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
              <h1 className="text-2xl font-bold text-white">Dehive</h1>
            </div>
            <form action={handleLogout}>
              <button
                type="submit"
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-gray-400 text-lg">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                User Information
              </h3>
              {user ? (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <pre className="text-sm text-gray-300 overflow-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-400">
                  No user information available
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-all duration-200 text-left">
                  Profile Settings
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-all duration-200 text-left">
                  Security
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-all duration-200 text-left">
                  Preferences
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-black/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Security</span>
                  <span className="text-green-400 font-medium">Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Session</span>
                  <span className="text-green-400 font-medium">Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

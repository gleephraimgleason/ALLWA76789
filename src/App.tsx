import { Suspense, useState, useEffect, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import { AppProvider } from "./contexts/AppContext";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load components for better performance
const Home = lazy(() => import("./components/home"));
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const DebugAuth = lazy(() => import("./components/DebugAuth"));
const InstantTransferTab = lazy(
  () => import("./components/InstantTransferTab"),
);
const AccountVerification = lazy(
  () => import("./components/AccountVerification"),
);
const VerificationManagement = lazy(
  () => import("./components/VerificationManagement"),
);
const EmailVerificationPage = lazy(
  () => import("./components/EmailVerificationPage"),
);
const PasswordResetRequestPage = lazy(
  () => import("./components/PasswordResetRequestPage"),
);
const PasswordResetConfirmPage = lazy(
  () => import("./components/PasswordResetConfirmPage"),
);

function AppContent() {
  const { user, logout, loading } = useAuth();

  const handleSignup = (userData: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    address: string;
    referralCode: string;
  }) => {
    console.log("New user signup:", userData);
  };

  // Show loading spinner while checking authentication with timeout
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setShowLoadingTimeout(true);
        console.log("⏰ انتهت مهلة التحميل - سيتم عرض خيارات إضافية");
      }, 15000); // 15 seconds

      return () => clearTimeout(timeout);
    } else {
      setShowLoadingTimeout(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-spin">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
          </div>
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="w-20 h-20 relative">
            <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-spin">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            </div>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        </div>
      }
    >
      <>
        {/* Tempo routes must come first */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/home" replace />
              ) : (
                <Signup onSignup={handleSignup} />
              )
            }
          />
          <Route path="/debug-auth" element={<DebugAuth />} />
          <Route
            path="/home"
            element={
              user ? (
                <Home onLogout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/instant-transfer"
            element={
              user ? (
                <InstantTransferTab
                  balance={{ dzd: 15000, eur: 75, usd: 85, gbp: 65.5 }}
                  onTransfer={(amount, recipient) =>
                    console.log("Instant Transfer:", amount, recipient)
                  }
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/account-verification"
            element={
              user ? <AccountVerification /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/verification-management"
            element={
              user ? (
                <VerificationManagement />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route
            path="/forgot-password"
            element={<PasswordResetRequestPage />}
          />
          <Route
            path="/reset-password"
            element={<PasswordResetConfirmPage />}
          />

          {/* Add tempo route before catchall */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/login"} replace />}
          />
        </Routes>
      </>
    </Suspense>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

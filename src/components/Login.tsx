import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  Shield,
  Zap,
  Globe,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading, error, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log(
        "🔄 المستخدم مسجل دخول بالفعل، إعادة توجيه إلى الصفحة الرئيسية",
      );
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting || loading) {
      console.log("🚫 منع الإرسال المتكرر - العملية قيد التنفيذ");
      return;
    }

    // Basic validation
    if (!email.trim()) {
      return;
    }

    if (!password) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsSubmitting(true);

    // Add timeout for form submission
    const submitTimeout = setTimeout(() => {
      console.log("⏰ انتهت مهلة إرسال النموذج");
      setIsSubmitting(false);
    }, 25000); // 25 seconds timeout

    try {
      console.log("🔐 بدء عملية تسجيل الدخول...");
      const { data, error: loginError } = await login(email.trim(), password);

      clearTimeout(submitTimeout);

      if (loginError) {
        console.error("❌ خطأ في تسجيل الدخول:", loginError);
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        console.log("✅ تم تسجيل الدخول بنجاح:", {
          userId: data.user.id,
          email: data.user.email,
        });

        if (onLogin) {
          onLogin(email.trim(), password);
        }

        // Navigate using React Router instead of window.location
        console.log("🏠 إعادة توجيه إلى الصفحة الرئيسية بعد تسجيل الدخول");
        navigate("/home", { replace: true });
      }
    } catch (err) {
      clearTimeout(submitTimeout);
      console.error("💥 خطأ غير متوقع في تسجيل الدخول:", err);
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "أمان عالي",
      description: "حماية متقدمة لأموالك",
    },
    {
      icon: Zap,
      title: "سرعة فائقة",
      description: "معاملات فورية",
    },
    {
      icon: Globe,
      title: "عالمي",
      description: "تحويلات دولية",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-3 sm:p-4 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-6xl">
          {/* Mobile Layout - Stack vertically */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center space-y-6 lg:space-y-0">
            {/* Branding & Features - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block text-center lg:text-right space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center lg:justify-end">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    NETLIFY
                  </h1>
                  <p className="text-xl text-gray-300 mb-6">
                    إدارة أموالك بسهولة وأمان
                  </p>
                  <p className="text-gray-400 text-lg">
                    محفظة رقمية متطورة لجميع احتياجاتك المالية
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid gap-6 max-w-md mx-auto lg:mx-0">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <h3 className="text-white font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Header - Only shown on mobile */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                NETLIFY
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                إدارة أموالك بسهولة وأمان
              </p>
            </div>

            {/* Login Form */}
            <div className="w-full">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mx-auto">
                <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
                    تسجيل الدخول
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm sm:text-base">
                    أدخل بياناتك للوصول إلى حسابك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                  {error && (
                    <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-right text-sm leading-relaxed">
                        {error}
                        <div className="mt-2 text-xs text-red-300">
                          {error.includes(
                            "تسجيل الدخول بالبريد الإلكتروني معطل",
                          )
                            ? "📧 يبدو أن تسجيل الدخول بالبريد الإلكتروني معطل في النظام. يرجى التواصل مع الدعم الفني."
                            : "💡 نصيحة: تأكد من صحة البريد الإلكتروني وكلمة المرور، أو تحقق من اتصال الإنترنت"}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-white block text-right"
                      >
                        البريد الإلكتروني
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 sm:h-12 text-right bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                        placeholder="أدخل البريد الإلكتروني"
                        required
                        disabled={loading || isSubmitting}
                        autoComplete="email"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-white block text-right"
                      >
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 sm:h-12 text-right pr-10 sm:pr-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                          placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                          required
                          disabled={loading || isSubmitting}
                          autoComplete="current-password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                          disabled={loading || isSubmitting}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-between">
                      <a
                        href="/forgot-password"
                        className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        نسيت كلمة المرور؟
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        loading ||
                        isSubmitting ||
                        !email.trim() ||
                        !password ||
                        password.length < 6
                      }
                    >
                      {loading || isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        <>
                          تسجيل الدخول
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-3 sm:pt-4 border-t border-white/20">
                    <p className="text-gray-300 text-xs sm:text-sm">
                      ليس لديك حساب؟{" "}
                      <a
                        href="/signup"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        فتح حساب جديد
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Features - Only shown on mobile */}
              <div className="lg:hidden mt-6 grid gap-3 px-2">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                    >
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-right flex-1">
                        <h3 className="text-white font-medium text-sm">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

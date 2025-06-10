import { useState } from "react";
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
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  Shield,
  Zap,
  Globe,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { signUp, createTransaction } from "@/lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface SignupProps {
  onSignup?: (userData: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
  }) => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب";
    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else {
      // More comprehensive email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }
    }
    if (!phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!username.trim()) newErrors.username = "اسم المستخدم مطلوب";
    else if (username.trim().length < 3)
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    if (!address.trim()) newErrors.address = "العنوان مطلوب";
    if (!password) newErrors.password = "كلمة المرور مطلوبة";
    else if (password.length < 6)
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    // Referral code is optional, but if provided, validate format
    if (referralCode.trim() && referralCode.trim().length < 6) {
      newErrors.referralCode = "كود الإحالة يجب أن يكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setMessage("");
    setSuccess(false);

    // Add timeout for form submission
    const submitTimeout = setTimeout(() => {
      console.log("⏰ انتهت مهلة إرسال نموذج التسجيل");
      setIsLoading(false);
      setMessage("انتهت مهلة إنشاء الحساب. يرجى المحاولة مرة أخرى");
    }, 35000); // 35 seconds timeout

    try {
      // Create user using the auth hook which handles database integration
      // Referral code validation will happen automatically in the background
      const { data, error } = await register(email.trim(), password, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        username: username.trim(),
        address: address.trim(),
        referralCode: referralCode.trim() || null,
      });

      if (error) {
        console.error("Signup error details:", error);

        if (
          error.message.includes("User already registered") ||
          error.message.includes("already registered") ||
          error.message.includes("already exists")
        ) {
          setErrors({
            email:
              "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول",
          });
        } else if (
          error.message.includes("Password should be at least") ||
          error.message.includes("Password")
        ) {
          setErrors({ password: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
        } else if (
          error.message.includes("Invalid email") ||
          error.message.includes("email")
        ) {
          setErrors({ email: "البريد الإلكتروني غير صحيح" });
        } else if (
          error.message.includes("Signup is disabled") ||
          error.message.includes("signup is disabled")
        ) {
          setMessage(
            "نظام التسجيل معطل مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني",
          );
        } else if (
          error.message.includes("Email logins are disabled") ||
          error.message.includes("logins are disabled")
        ) {
          setMessage(
            "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى التواصل مع الدعم الفني لتفعيل الحساب",
          );
        } else if (
          error.message.includes("AuthSessionMissingError") ||
          error.message.includes("Auth session missing")
        ) {
          setMessage(
            "خطأ في إعدادات المصادقة. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى",
          );
        } else if (
          error.message.includes("Database error") ||
          error.message.includes("database")
        ) {
          setMessage(
            "خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني",
          );
        } else if (error.message.includes("disabled")) {
          setMessage("الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً");
        } else if (
          error.message.includes("Network") ||
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          setMessage(
            "مشكلة في الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى",
          );
        } else if (error.message.includes("timeout")) {
          setMessage("انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى");
        } else {
          setMessage(
            "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني",
          );
        }
        return;
      }

      if (data.user) {
        setSuccess(true);
        setMessage("تم إنشاء الحساب بنجاح! تم تسجيل دخولك تلقائياً.");

        // Auto redirect or callback after successful signup and login
        setTimeout(() => {
          if (onSignup) {
            onSignup({
              fullName,
              email,
              phone,
              username,
              password,
            });
          }
          // Redirect to email verification page
          window.location.href = "/verify-email";
        }, 2000);

        // Clear form after successful signup
        setTimeout(() => {
          setFullName("");
          setEmail("");
          setPhone("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setAddress("");
          setReferralCode("");
        }, 3000);
      }
    } catch (err: any) {
      clearTimeout(submitTimeout);
      console.error("Signup error:", err);
      setMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      clearTimeout(submitTimeout);
      setIsLoading(false);
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

            {/* Signup Form */}
            <div className="w-full">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mx-auto">
                <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
                    فتح حساب جديد
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm sm:text-base">
                    أدخل بياناتك لإنشاء حساب جديد
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Success/Error Messages */}
                  {(message || success) && (
                    <div
                      className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                        success
                          ? "bg-green-500/20 border border-green-500/30 text-green-300"
                          : "bg-red-500/20 border border-red-500/30 text-red-300"
                      }`}
                    >
                      {success ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-right flex-1">
                        {message?.includes("Signup is disabled") ||
                        message?.includes("signup is disabled")
                          ? "نظام التسجيل معطل مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني"
                          : message?.includes("Email logins are disabled") ||
                              message?.includes("logins are disabled")
                            ? "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى التواصل مع الدعم الفني لتفعيل الحساب"
                            : message?.includes("AuthSessionMissingError") ||
                                message?.includes("Auth session missing")
                              ? "خطأ في إعدادات المصادقة. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى"
                              : message?.includes("Database error") ||
                                  message?.includes("database")
                                ? "خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني"
                                : message?.includes("disabled")
                                  ? "الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً"
                                  : message?.includes("Network") ||
                                      message?.includes("network") ||
                                      message?.includes("fetch")
                                    ? "مشكلة في الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى"
                                    : message?.includes("timeout")
                                      ? "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى"
                                      : message}
                      </span>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-sm font-medium text-white block text-right"
                      >
                        الاسم الكامل
                      </label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-11 sm:h-12 text-right pr-10 sm:pr-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                          placeholder="أدخل اسمك الكامل"
                          required
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-white block text-right"
                      >
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 sm:h-12 text-right pr-10 sm:pr-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                          placeholder="أدخل بريدك الإلكتروني"
                          required
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-white block text-right"
                      >
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-11 sm:h-12 text-right pr-10 sm:pr-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                          placeholder="أدخل رقم هاتفك"
                          required
                        />
                        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {errors.phone && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="username"
                        className="text-sm font-medium text-white block text-right"
                      >
                        اسم المستخدم
                      </label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-11 sm:h-12 text-right bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                        placeholder="اختر اسم مستخدم"
                        required
                      />
                      {errors.username && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="address"
                        className="text-sm font-medium text-white block text-right"
                      >
                        العنوان
                      </label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-11 sm:h-12 text-right bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                        placeholder="أدخل عنوانك الكامل"
                        required
                      />
                      {errors.address && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="referralCode"
                        className="text-sm font-medium text-white block text-right"
                      >
                        كود الإحالة (اختياري)
                      </label>
                      <Input
                        id="referralCode"
                        type="text"
                        value={referralCode}
                        onChange={(e) =>
                          setReferralCode(e.target.value.toUpperCase())
                        }
                        className="h-11 sm:h-12 text-right bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                        placeholder="أدخل كود الإحالة إن وجد"
                        maxLength={8}
                      />
                      {errors.referralCode && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.referralCode}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs text-right">
                        احصل على 500 دج مكافأة عند استخدام كود إحالة صديق (سيتم
                        التحقق تلقائياً)
                      </p>
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
                          placeholder="أدخل كلمة المرور"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-white block text-right"
                      >
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 sm:h-12 text-right pr-10 sm:pr-12 bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
                          placeholder="أعد إدخال كلمة المرور"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs text-right">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || success}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جاري إنشاء الحساب...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          تم إنشاء الحساب بنجاح
                        </>
                      ) : (
                        <>
                          إنشاء حساب جديد
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-3 sm:pt-4 border-t border-white/20">
                    <p className="text-gray-300 text-xs sm:text-sm">
                      لديك حساب بالفعل؟{" "}
                      <a
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        تسجيل الدخول
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

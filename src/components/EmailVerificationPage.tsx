import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  CheckCircle,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EmailVerificationPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendEmailVerification, user } = useAuth();

  // Auto-verify if token is in URL
  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("token_hash");
    const type = searchParams.get("type") || "signup";

    if (token) {
      handleAutoVerification(token, type);
    }
  }, [searchParams]);

  const handleAutoVerification = async (token: string, type: string) => {
    setIsVerifying(true);
    setMessage("");

    try {
      const { error } = await verifyEmail(token, type);

      if (error) {
        setMessage(error.message || "فشل في تأكيد البريد الإلكتروني");
        setSuccess(false);
      } else {
        setMessage("تم تأكيد البريد الإلكتروني بنجاح!");
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    } catch (err) {
      setMessage("حدث خطأ في تأكيد البريد الإلكتروني");
      setSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setMessage("يرجى إدخال رمز التأكيد");
      return;
    }

    setIsVerifying(true);
    setMessage("");

    try {
      const { error } = await verifyEmail(verificationCode.trim());

      if (error) {
        setMessage(error.message || "رمز التأكيد غير صحيح");
        setSuccess(false);
      } else {
        setMessage("تم تأكيد البريد الإلكتروني بنجاح!");
        setSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    } catch (err) {
      setMessage("حدث خطأ في تأكيد البريد الإلكتروني");
      setSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage("");

    try {
      const { error } = await resendEmailVerification();

      if (error) {
        setMessage(error.message || "فشل في إعادة إرسال رسالة التأكيد");
        setSuccess(false);
      } else {
        setMessage("تم إعادة إرسال رسالة التأكيد بنجاح!");
        setSuccess(true);
      }
    } catch (err) {
      setMessage("حدث خطأ في إعادة إرسال رسالة التأكيد");
      setSuccess(false);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                تأكيد البريد الإلكتروني
              </CardTitle>
              <CardDescription className="text-gray-300">
                {searchParams.get("token")
                  ? "جاري تأكيد بريدك الإلكتروني..."
                  : "أدخل رمز التأكيد المرسل إلى بريدك الإلكتروني"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Messages */}
              {message && (
                <Alert
                  className={`${
                    success
                      ? "bg-green-500/20 border-green-500/50 text-green-200"
                      : "bg-red-500/20 border-red-500/50 text-red-200"
                  }`}
                >
                  {success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="text-right">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Auto-verification in progress */}
              {isVerifying && searchParams.get("token") && (
                <div className="flex items-center justify-center space-x-2 text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تأكيد البريد الإلكتروني...</span>
                </div>
              )}

              {/* Manual verification form */}
              {!searchParams.get("token") && !success && (
                <form onSubmit={handleManualVerification} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="verificationCode"
                      className="text-sm font-medium text-white block text-right"
                    >
                      رمز التأكيد
                    </label>
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="h-12 text-right bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                      placeholder="أدخل رمز التأكيد"
                      required
                      disabled={isVerifying}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isVerifying || !verificationCode.trim()}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التأكيد...
                      </>
                    ) : (
                      <>
                        تأكيد البريد الإلكتروني
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Resend verification */}
              {!success && (
                <div className="text-center space-y-3">
                  <p className="text-gray-300 text-sm">
                    لم تستلم رسالة التأكيد؟
                  </p>
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة إرسال رسالة التأكيد
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Success state - redirect info */}
              {success && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </div>
                  <p className="text-white text-lg font-medium">
                    تم تأكيد البريد الإلكتروني بنجاح!
                  </p>
                  <p className="text-gray-300 text-sm">
                    سيتم توجيهك إلى صفحة تسجيل الدخول خلال 3 ثوانٍ...
                  </p>
                </div>
              )}

              {/* Back to login */}
              <div className="text-center pt-4 border-t border-white/20">
                <Button
                  onClick={handleBackToLogin}
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-white/10"
                >
                  العودة إلى تسجيل الدخول
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

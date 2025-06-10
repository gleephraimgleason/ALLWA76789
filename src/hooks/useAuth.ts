import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getUserCredentials,
  getUserProfile,
  getUserBalance,
  resetPassword,
  updatePassword,
  verifyOtp,
  resendVerification,
} from "../lib/supabase";

interface ExtendedUser extends User {
  credentials?: {
    username: string;
    password_hash: string;
  };
  profile?: any;
  balance?: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session with better error handling and timeout
    const getInitialSession = async () => {
      try {
        console.log("🔄 جاري تحميل الجلسة الأولية...");

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 8000),
        );

        const sessionPromise = getCurrentUser();

        const { user, error } = (await Promise.race([
          sessionPromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error("❌ خطأ في تحميل الجلسة الأولية:", error);
          // Don't set error for initial session check - this is normal when not logged in
          console.log("ℹ️ لا توجد جلسة نشطة - هذا طبيعي عند عدم تسجيل الدخول");
        } else if (user) {
          console.log("✅ تم العثور على جلسة نشطة:", user.id);
          setUser(user);
        } else {
          console.log("ℹ️ لا توجد جلسة نشطة");
        }
      } catch (err: any) {
        console.error("💥 خطأ غير متوقع في تحميل الجلسة:", err);
        if (err.message === "Session check timeout") {
          console.log("⏰ انتهت مهلة فحص الجلسة - سيتم المتابعة بدون مستخدم");
        }
        // Don't set error for initial session check
        console.log("ℹ️ خطأ في تحميل الجلسة الأولية - سيتم المحاولة مرة أخرى");
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with improved logging and timeout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 تغيير في حالة المصادقة:", {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
      });

      // Always ensure loading is set to false after auth state change
      const finishLoading = () => {
        setLoading(false);
      };

      // Set a timeout to ensure loading never gets stuck
      const loadingTimeout = setTimeout(() => {
        console.log("⏰ انتهت مهلة تحميل بيانات المستخدم - سيتم إنهاء التحميل");
        finishLoading();
      }, 10000);

      try {
        if (session?.user) {
          // Fetch additional user data when session changes
          try {
            console.log("📊 جاري تحميل بيانات المستخدم الإضافية...");

            // Add timeout for database operations
            const dbTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Database timeout")), 5000),
            );

            const dbPromise = Promise.all([
              getUserCredentials(session.user.id),
              getUserProfile(session.user.id),
              getUserBalance(session.user.id),
            ]);

            const [credentialsResult, profileResult, balanceResult] =
              (await Promise.race([dbPromise, dbTimeout])) as any;

            const extendedUser: ExtendedUser = {
              ...session.user,
              credentials: credentialsResult.data || undefined,
              profile: profileResult.data || undefined,
              balance: balanceResult.data || undefined,
            };

            setUser(extendedUser);
            setError(null); // Clear any previous errors on successful login
            console.log("✅ تم تحميل بيانات المستخدم بنجاح");
          } catch (dbError: any) {
            console.error(
              "❌ خطأ في جلب بيانات المستخدم عند تغيير الجلسة:",
              dbError,
            );
            // Still set the user even if database fetch fails
            setUser(session.user);
            setError(null);

            if (dbError.message === "Database timeout") {
              console.log("⏰ انتهت مهلة تحميل البيانات من قاعدة البيانات");
            } else {
              console.log(
                "⚠️ تم تسجيل الدخول ولكن فشل في تحميل بعض البيانات الإضافية",
              );
            }
          }
        } else {
          console.log("🚪 تم تسجيل الخروج أو انتهت الجلسة");
          setUser(null);
          setError(null); // Clear errors when logging out
        }
      } finally {
        clearTimeout(loadingTimeout);
        finishLoading();
      }
    });

    return () => {
      console.log("🔌 إلغاء الاشتراك في تغييرات المصادقة");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const loginTimeout = setTimeout(() => {
      console.log("⏰ انتهت مهلة تسجيل الدخول");
      setLoading(false);
      setError("انتهت مهلة تسجيل الدخول. يرجى المحاولة مرة أخرى");
    }, 20000); // 20 seconds timeout

    try {
      // Validate inputs before making request
      if (!email?.trim() || !password) {
        const errorMessage = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        const errorMessage = "تنسيق البريد الإلكتروني غير صحيح";
        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      // Validate password length
      if (password.length < 6) {
        const errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      // Enhanced logging for debugging
      console.log("🔐 محاولة تسجيل الدخول:", {
        email: email.trim(),
        timestamp: new Date().toISOString(),
      });
      console.log("🔧 إعدادات Supabase:", {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
        environment: import.meta.env.MODE,
      });

      const { data, error } = await signIn(email.trim(), password);

      if (error) {
        console.error("تفاصيل خطأ تسجيل الدخول:", {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          details: error,
        });

        let errorMessage = "حدث خطأ في تسجيل الدخول";

        // More specific and accurate error handling
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("Invalid credentials") ||
          error.message.includes("invalid_credentials")
        ) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage =
            "يرجى تأكيد البريد الإلكتروني من خلال الرسالة المرسلة إليك";
        } else if (error.message.includes("Too many requests")) {
          errorMessage =
            "محاولات كثيرة جداً. يرجى الانتظار 5 دقائق قبل المحاولة مرة أخرى";
        } else if (error.message.includes("User not found")) {
          errorMessage = "لا يوجد حساب مسجل بهذا البريد الإلكتروني";
        } else if (error.message.includes("Email logins are disabled")) {
          errorMessage =
            "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى التواصل مع الدعم الفني لتفعيل الحساب";
        } else if (error.message.includes("Signup is disabled")) {
          errorMessage =
            "نظام تسجيل الدخول معطل مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني";
        } else if (error.message.includes("disabled")) {
          errorMessage = "الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً";
        } else if (
          error.message.includes("Network") ||
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "مشكلة في الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى";
        } else if (error.message.includes("timeout")) {
          errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى";
        } else if (error.status === 400) {
          errorMessage =
            "بيانات غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور";
        } else if (error.status === 401) {
          errorMessage = "بيانات الدخول غير صحيحة";
        } else if (error.status === 422) {
          errorMessage = "البريد الإلكتروني غير صحيح أو كلمة المرور ضعيفة";
        } else if (error.status === 429) {
          errorMessage =
            "محاولات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى";
        } else if (error.status >= 500) {
          errorMessage = "خطأ في الخادم. يرجى المحاولة لاحقاً";
        }

        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      if (data?.user) {
        console.log("تم تسجيل الدخول بنجاح، معرف المستخدم:", data.user.id);

        // Fetch additional user data from database
        try {
          const [credentialsResult, profileResult, balanceResult] =
            await Promise.all([
              getUserCredentials(data.user.id),
              getUserProfile(data.user.id),
              getUserBalance(data.user.id),
            ]);

          const extendedUser: ExtendedUser = {
            ...data.user,
            credentials: credentialsResult.data || undefined,
            profile: profileResult.data || undefined,
            balance: balanceResult.data || undefined,
          };

          setUser(extendedUser);
          setError(null);

          console.log("تم تحميل بيانات المستخدم بنجاح:", {
            userId: data.user.id,
            email: data.user.email,
            username: credentialsResult.data?.username,
            profile: profileResult.data?.full_name,
            hasBalance: !!balanceResult.data,
          });
        } catch (dbError) {
          console.error(
            "خطأ في جلب بيانات المستخدم من قاعدة البيانات:",
            dbError,
          );
          // Still set the user even if database fetch fails
          setUser(data.user);
          setError(null);
        }
      } else {
        console.error("لم يتم إرجاع بيانات المستخدم من Supabase");
        setError("حدث خطأ في تسجيل الدخول - لم يتم العثور على بيانات المستخدم");
        setLoading(false);
        return { data: null, error: { message: "No user data returned" } };
      }

      clearTimeout(loginTimeout);
      setLoading(false);
      return { data, error: null };
    } catch (err: any) {
      clearTimeout(loginTimeout);
      console.error("خطأ غير متوقع في تسجيل الدخول:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause,
      });

      let errorMessage = "حدث خطأ غير متوقع";

      if (err.message?.includes("fetch")) {
        errorMessage = "مشكلة في الاتصال بالخادم. تأكد من اتصال الإنترنت";
      } else if (err.message?.includes("timeout")) {
        errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى";
      } else if (err.name === "TypeError") {
        errorMessage = "خطأ في إعدادات الاتصال. يرجى إعادة تحميل الصفحة";
      }

      setError(errorMessage);
      setLoading(false);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const registerTimeout = setTimeout(() => {
      console.log("⏰ انتهت مهلة إنشاء الحساب");
      setLoading(false);
      setError("انتهت مهلة إنشاء الحساب. يرجى المحاولة مرة أخرى");
    }, 30000); // 30 seconds timeout

    try {
      // Validate inputs
      if (!email?.trim() || !password) {
        const errorMessage = "يرجى إدخال البريد الإلكتروني وكلمة المرور";
        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      if (password.length < 6) {
        const errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      // إنشاء المستخدم مع إرسال جميع البيانات بما في ذلك كود الإحالة
      // كود الإحالة سيتم معالجته تلقائياً في الخلفية
      const { data, error } = await signUp(email.trim(), password, {
        full_name: userData.fullName || userData.full_name || "مستخدم جديد",
        phone: userData.phone || "",
        username: userData.username || "",
        address: userData.address || "",
        referralCode: userData.referralCode || "", // كود الإحالة سيتم معالجته تلقائياً
      });

      if (error) {
        console.error("Register error details:", error);
        let errorMessage = "حدث خطأ في إنشاء الحساب";

        if (
          error.message.includes("User already registered") ||
          error.message.includes("already registered") ||
          error.message.includes("already exists")
        ) {
          errorMessage =
            "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول";
        } else if (
          error.message.includes("Password should be at least") ||
          error.message.includes("Password")
        ) {
          errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        } else if (
          error.message.includes("Invalid email") ||
          error.message.includes("email")
        ) {
          errorMessage = "البريد الإلكتروني غير صحيح";
        } else if (
          error.message.includes("Signup is disabled") ||
          error.message.includes("signup is disabled")
        ) {
          errorMessage =
            "نظام التسجيل معطل مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني";
        } else if (
          error.message.includes("Email logins are disabled") ||
          error.message.includes("logins are disabled")
        ) {
          errorMessage =
            "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى التواصل مع الدعم الفني";
        } else if (
          error.message.includes("Database error") ||
          error.message.includes("database")
        ) {
          errorMessage =
            "خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني";
        } else if (error.message.includes("disabled")) {
          errorMessage = "الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً";
        } else if (
          error.message.includes("Network") ||
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "مشكلة في الاتصال بالإنترنت. تأكد من اتصالك وحاول مرة أخرى";
        } else if (error.message.includes("timeout")) {
          errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى";
        }

        setError(errorMessage);
        setLoading(false);
        return { data: null, error: { message: errorMessage } };
      }

      if (data?.user) {
        // The user profile and balance will be created automatically by the database trigger
        // Wait a moment for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update user profile with registration data from metadata
        try {
          const { updateUserProfile } = await import("../lib/supabase");

          // Update profile with comprehensive registration information
          if (data.user.user_metadata) {
            const profileData = {
              full_name: data.user.user_metadata.full_name,
              phone: data.user.user_metadata.phone,
              address: data.user.user_metadata.address,
              email: data.user.email,
              username: data.user.user_metadata.username,
              used_referral_code: data.user.user_metadata.used_referral_code, // كود الإحالة المستخدم
              registration_date: new Date().toISOString(),
              profile_completed: true,
            };

            console.log("تحديث ملف المستخدم بالبيانات:", profileData);
            await updateUserProfile(data.user.id, profileData);

            // Also create user credentials entry
            try {
              await supabase.from("user_credentials").upsert({
                user_id: data.user.id,
                username: data.user.user_metadata.username,
                password_hash: "[HASHED]", // This would be properly hashed in production
              });
            } catch (credError) {
              console.error("خطأ في إنشاء بيانات اعتماد المستخدم:", credError);
            }
          }
        } catch (updateError) {
          console.error("خطأ في تحديث ملف المستخدم:", updateError);
        }

        // Fetch additional user data from database for new registration
        try {
          const [credentialsResult, profileResult, balanceResult] =
            await Promise.all([
              getUserCredentials(data.user.id),
              getUserProfile(data.user.id),
              getUserBalance(data.user.id),
            ]);

          const extendedUser: ExtendedUser = {
            ...data.user,
            credentials: credentialsResult.data || undefined,
            profile: profileResult.data || undefined,
            balance: balanceResult.data || undefined,
          };

          setUser(extendedUser);
          setError(null);

          console.log("تم إنشاء الحساب بنجاح مع بيانات المستخدم:", {
            username: credentialsResult.data?.username,
            profile: profileResult.data?.full_name,
            fullName: data.user.user_metadata?.full_name,
          });
        } catch (dbError) {
          console.error("خطأ في جلب بيانات المستخدم الجديد:", dbError);
          // Still set the user even if database fetch fails
          setUser(data.user);
          setError(null);
        }
      }

      clearTimeout(registerTimeout);
      setLoading(false);
      return { data, error: null };
    } catch (err: any) {
      clearTimeout(registerTimeout);
      console.error("Register catch error:", err);
      const errorMessage = "حدث خطأ غير متوقع في الاتصال";
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const logoutTimeout = setTimeout(() => {
      console.log("⏰ انتهت مهلة تسجيل الخروج - سيتم إنهاء الجلسة محلياً");
      setUser(null);
      setError(null);
      setLoading(false);
    }, 10000); // 10 seconds timeout

    try {
      const { error } = await signOut();

      if (error) {
        console.error("Logout error:", error);
        setError("حدث خطأ في تسجيل الخروج");
        setLoading(false);
        return { error };
      }

      clearTimeout(logoutTimeout);
      setUser(null);
      setError(null);
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      clearTimeout(logoutTimeout);
      console.error("Logout catch error:", err);
      const errorMessage = "حدث خطأ في تسجيل الخروج";
      setError(errorMessage);
      setLoading(false);
      return { error: { message: errorMessage } };
    }
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      const errorMessage = "حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      const errorMessage = "حدث خطأ في تحديث كلمة المرور";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string, type: string = "signup") => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await verifyOtp(token, type);

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      const errorMessage = "حدث خطأ في تأكيد البريد الإلكتروني";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await resendVerification();

      if (error) {
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      const errorMessage = "حدث خطأ في إعادة إرسال رسالة التأكيد";
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    resendEmailVerification,
  };
};

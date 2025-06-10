import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Use environment variables for Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log("🔧 Supabase Configuration:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  key: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables:", {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_URL: import.meta.env.SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
      ? "[SET]"
      : "[MISSING]",
    SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY
      ? "[SET]"
      : "[MISSING]",
  });
  throw new Error(
    "Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) are set.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  userData: any,
) => {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        data: null,
        error: { message: "البريد الإلكتروني وكلمة المرور مطلوبان" },
      };
    }

    if (password.length < 6) {
      return {
        data: null,
        error: { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        data: null,
        error: { message: "تنسيق البريد الإلكتروني غير صحيح" },
      };
    }

    console.log("🔐 محاولة إنشاء حساب جديد:", {
      email: email.trim(),
      hasUserData: !!userData,
      username: userData?.username,
      fullName: userData?.full_name || userData?.fullName,
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });

    // إنشاء حساب جديد مع إرسال كود الإحالة إلى قاعدة البيانات
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: userData.full_name || userData.fullName || "مستخدم جديد",
          phone: userData.phone || "",
          username: userData.username || "",
          address: userData.address || "",
          used_referral_code: userData.referralCode
            ? userData.referralCode.trim().toUpperCase()
            : "", // كود الإحالة سيتم معالجته تلقائياً في قاعدة البيانات
        },
      },
    });

    if (error) {
      console.error("❌ خطأ Supabase في إنشاء الحساب:", {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name,
        details: error,
      });

      let errorMessage = "حدث خطأ في إنشاء الحساب";

      // More specific error handling
      if (
        error.message.includes("AuthSessionMissingError") ||
        error.message.includes("Auth session missing")
      ) {
        errorMessage =
          "خطأ في إعدادات المصادقة. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى";
      } else if (
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
      } else if (error.message.includes("disabled")) {
        errorMessage = "الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً";
      } else if (
        error.message.includes("Database error") ||
        error.message.includes("database")
      ) {
        errorMessage =
          "خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني";
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
        errorMessage = "بيانات غير صحيحة. تأكد من جميع الحقول المطلوبة";
      } else if (error.status === 422) {
        errorMessage = "البيانات المدخلة غير صحيحة. يرجى مراجعة جميع الحقول";
      } else if (error.status === 429) {
        errorMessage =
          "محاولات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى";
      } else if (error.status >= 500) {
        errorMessage = "خطأ في الخادم. يرجى المحاولة لاحقاً";
      }

      return { data: null, error: { ...error, message: errorMessage } };
    }

    if (data?.user) {
      console.log("✅ تم إنشاء الحساب بنجاح:", {
        userId: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? "نعم" : "لا",
        hasSession: !!data.session,
      });
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("💥 خطأ غير متوقع في إنشاء الحساب:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause,
    });

    let errorMessage = "حدث خطأ غير متوقع في إنشاء الحساب";

    if (
      err.message?.includes("fetch") ||
      err.message?.includes("Failed to fetch")
    ) {
      errorMessage =
        "مشكلة في الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى";
    } else if (err.name === "TypeError") {
      errorMessage =
        "خطأ في إعدادات الاتصال. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى";
    } else if (err.message?.includes("CORS")) {
      errorMessage = "مشكلة في إعدادات الأمان. يرجى المحاولة لاحقاً";
    }

    return {
      data: null,
      error: { message: errorMessage, originalError: err.message },
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        data: null,
        error: { message: "البريد الإلكتروني وكلمة المرور مطلوبان" },
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        data: null,
        error: { message: "تنسيق البريد الإلكتروني غير صحيح" },
      };
    }

    // Validate password length
    if (password.length < 6) {
      return {
        data: null,
        error: { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
      };
    }

    // Log connection attempt with more details
    console.log("🔐 محاولة تسجيل الدخول:", {
      url: supabaseUrl,
      email: email.trim(),
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey?.length || 0,
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("❌ خطأ Supabase في تسجيل الدخول:", {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        name: error.name,
        details: error,
      });

      let errorMessage = "حدث خطأ غير متوقع";

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
        errorMessage =
          "لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى التسجيل أولاً";
      } else if (
        error.message.includes("Email logins are disabled") ||
        error.message.includes("logins are disabled")
      ) {
        errorMessage =
          "تسجيل الدخول بالبريد الإلكتروني معطل. يرجى التواصل مع الدعم الفني لتفعيل الحساب";
      } else if (
        error.message.includes("Signup is disabled") ||
        error.message.includes("disabled")
      ) {
        errorMessage =
          "الخدمة معطلة مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني";
      } else if (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("Failed to fetch")
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

      return { data: null, error: { ...error, message: errorMessage } };
    }

    if (data?.user) {
      console.log("✅ نجح تسجيل الدخول في Supabase:", {
        userId: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? "نعم" : "لا",
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at,
      });
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("💥 خطأ غير متوقع في Supabase signin:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause,
    });

    let errorMessage = "حدث خطأ غير متوقع في الاتصال";

    if (
      err.message?.includes("fetch") ||
      err.message?.includes("Failed to fetch")
    ) {
      errorMessage =
        "مشكلة في الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى";
    } else if (err.message?.includes("timeout")) {
      errorMessage = "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى";
    } else if (err.name === "TypeError") {
      errorMessage = "خطأ في إعدادات الاتصال. يرجى إعادة تحميل الصفحة";
    } else if (err.message?.includes("CORS")) {
      errorMessage = "مشكلة في إعدادات الأمان. يرجى المحاولة لاحقاً";
    }

    return {
      data: null,
      error: { message: errorMessage, originalError: err.message },
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signout error:", error);
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Signout catch error:", err);
    return {
      error: { message: err.message || "حدث خطأ في تسجيل الخروج" },
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Get user error:", error);
      return { user: null, error };
    }

    return { user, error: null };
  } catch (err: any) {
    console.error("Get user catch error:", err);
    return {
      user: null,
      error: { message: err.message || "حدث خطأ في جلب بيانات المستخدم" },
    };
  }
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
};

export const getUserBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { data, error };
};

export const updateUserBalance = async (userId: string, balances: any) => {
  try {
    // التحقق من صحة مبالغ الأرصدة
    const validatedBalances = {
      dzd:
        balances.dzd !== undefined
          ? Math.max(0, parseFloat(balances.dzd) || 0)
          : undefined,
      eur:
        balances.eur !== undefined
          ? Math.max(0, parseFloat(balances.eur) || 0)
          : undefined,
      usd:
        balances.usd !== undefined
          ? Math.max(0, parseFloat(balances.usd) || 0)
          : undefined,
      gbp:
        balances.gbp !== undefined
          ? Math.max(0, parseFloat(balances.gbp) || 0)
          : undefined,
      investment_balance:
        balances.investment_balance !== undefined
          ? Math.max(0, parseFloat(balances.investment_balance) || 0)
          : undefined,
    };

    // استخدام الدالة المخصصة لتحديث الأرصدة
    const { data, error } = await supabase.rpc("update_user_balance", {
      p_user_id: userId,
      p_dzd: validatedBalances.dzd,
      p_eur: validatedBalances.eur,
      p_usd: validatedBalances.usd,
      p_gbp: validatedBalances.gbp,
      p_investment_balance: validatedBalances.investment_balance,
    });

    if (error) {
      console.error("Error calling update_user_balance function:", error);
      return { data: null, error };
    }

    // إرجاع أول سجل من النتائج
    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    console.error("Error in updateUserBalance:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في تحديث الرصيد" },
    };
  }
};

// Get investment balance for a user
export const getInvestmentBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from("balances")
    .select("investment_balance")
    .eq("user_id", userId)
    .single();
  return { data, error };
};

// Update investment balance using database function
export const updateInvestmentBalance = async (
  userId: string,
  amount: number,
  operation: "add" | "subtract",
) => {
  try {
    // استخدام دالة قاعدة البيانات لمعالجة الاستثمار
    const dbOperation = operation === "add" ? "invest" : "return";

    const { data, error } = await supabase.rpc("process_investment", {
      p_user_id: userId,
      p_amount: amount,
      p_operation: dbOperation,
    });

    if (error) {
      console.error("Error calling process_investment function:", error);
      return { data: null, error };
    }

    const result = data?.[0];
    if (!result?.success) {
      return {
        data: null,
        error: { message: result?.message || "فشل في معالجة الاستثمار" },
      };
    }

    // إرجاع البيانات المحدثة بتنسيق متوافق
    const updatedBalance = {
      user_id: userId,
      dzd: result.new_dzd_balance,
      investment_balance: result.new_investment_balance,
      updated_at: new Date().toISOString(),
    };

    return { data: updatedBalance, error: null };
  } catch (error: any) {
    console.error("Error in updateInvestmentBalance:", error);
    return {
      data: null,
      error: { message: error.message || "خطأ في تحديث رصيد الاستثمار" },
    };
  }
};

export const createTransaction = async (transaction: any) => {
  // التحقق من صحة بيانات المعاملة
  const validatedTransaction = {
    ...transaction,
    amount: Math.abs(parseFloat(transaction.amount) || 0),
    currency: (transaction.currency || "dzd").toLowerCase(),
    type: transaction.type || "transfer",
    status: transaction.status || "completed",
    description: transaction.description || "معاملة",
  };

  // التحقق من أن المبلغ أكبر من صفر
  if (validatedTransaction.amount <= 0) {
    return {
      data: null,
      error: { message: "مبلغ المعاملة يجب أن يكون أكبر من صفر" },
    };
  }

  // التحقق من صحة نوع العملة
  const validCurrencies = ["dzd", "eur", "usd", "gbp"];
  if (!validCurrencies.includes(validatedTransaction.currency)) {
    return { data: null, error: { message: "نوع العملة غير صحيح" } };
  }

  // التحقق من صحة نوع المعاملة
  const validTypes = [
    "recharge",
    "transfer",
    "bill",
    "investment",
    "conversion",
    "withdrawal",
  ];
  if (!validTypes.includes(validatedTransaction.type)) {
    return { data: null, error: { message: "نوع المعاملة غير صحيح" } };
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(validatedTransaction)
    .select()
    .single();
  return { data, error };
};

export const getUserTransactions = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data, error };
};

export const createInvestment = async (investment: any) => {
  // التحقق من صحة بيانات الاستثمار
  const validatedInvestment = {
    ...investment,
    amount: Math.abs(parseFloat(investment.amount) || 0),
    profit_rate: Math.max(
      0,
      Math.min(100, parseFloat(investment.profit_rate) || 0),
    ),
    profit: 0, // يبدأ الربح من صفر
    status: investment.status || "active",
    type: investment.type || "monthly",
  };

  // التحقق من أن المبلغ أكبر من صفر
  if (validatedInvestment.amount <= 0) {
    return {
      data: null,
      error: { message: "مبلغ الاستثمار يجب أن يكون أكبر من صفر" },
    };
  }

  // التحقق من صحة نوع الاستثمار
  const validTypes = ["weekly", "monthly", "quarterly", "yearly"];
  if (!validTypes.includes(validatedInvestment.type)) {
    return { data: null, error: { message: "نوع الاستثمار غير صحيح" } };
  }

  // التحقق من صحة التواريخ
  const startDate = new Date(validatedInvestment.start_date);
  const endDate = new Date(validatedInvestment.end_date);
  if (endDate <= startDate) {
    return {
      data: null,
      error: {
        message: "تاريخ انتهاء الاستثمار يجب أن يكون بعد تاريخ البداية",
      },
    };
  }

  const { data, error } = await supabase
    .from("investments")
    .insert(validatedInvestment)
    .select()
    .single();
  return { data, error };
};

export const getUserInvestments = async (userId: string) => {
  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const updateInvestment = async (investmentId: string, updates: any) => {
  const { data, error } = await supabase
    .from("investments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", investmentId)
    .select()
    .single();
  return { data, error };
};

export const createSavingsGoal = async (goal: any) => {
  // التحقق من صحة بيانات هدف الادخار
  const validatedGoal = {
    ...goal,
    target_amount: Math.abs(parseFloat(goal.target_amount) || 0),
    current_amount: Math.max(0, parseFloat(goal.current_amount) || 0),
    status: goal.status || "active",
    name: goal.name || "هدف ادخار",
    category: goal.category || "عام",
    icon: goal.icon || "target",
    color: goal.color || "#3B82F6",
  };

  // التحقق من أن المبلغ المستهدف أكبر من صفر
  if (validatedGoal.target_amount <= 0) {
    return {
      data: null,
      error: { message: "المبلغ المستهدف يجب أن يكون أكبر من صفر" },
    };
  }

  // التحقق من أن المبلغ الحالي لا يتجاوز المستهدف
  if (validatedGoal.current_amount > validatedGoal.target_amount) {
    return {
      data: null,
      error: { message: "المبلغ الحالي لا يمكن أن يتجاوز المبلغ المستهدف" },
    };
  }

  // التحقق من صحة تاريخ الموعد النهائي
  const deadline = new Date(validatedGoal.deadline);
  if (deadline <= new Date()) {
    return {
      data: null,
      error: { message: "الموعد النهائي يجب أن يكون في المستقبل" },
    };
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .insert(validatedGoal)
    .select()
    .single();
  return { data, error };
};

export const getUserSavingsGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const updateSavingsGoal = async (goalId: string, updates: any) => {
  const { data, error } = await supabase
    .from("savings_goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", goalId)
    .select()
    .single();
  return { data, error };
};

export const getUserCards = async (userId: string) => {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("user_id", userId);
  return { data, error };
};

export const updateCard = async (cardId: string, updates: any) => {
  const { data, error } = await supabase
    .from("cards")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .select()
    .single();
  return { data, error };
};

export const createNotification = async (notification: any) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();
  return { data, error };
};

export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select()
    .single();
  return { data, error };
};

export const createReferral = async (referral: any) => {
  const { data, error } = await supabase
    .from("referrals")
    .insert(referral)
    .select()
    .single();
  return { data, error };
};

export const getUserReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from("referrals")
    .select(
      `
      *,
      referred_user:users!referrals_referred_id_fkey(full_name, email)
    `,
    )
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

// Get referral statistics for a user
export const getReferralStats = async (userId: string) => {
  try {
    // Get total referrals count
    const { count: totalReferrals } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId);

    // Get completed referrals count
    const { count: completedReferrals } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)
      .eq("status", "completed");

    // Get total earnings from referrals
    const { data: userEarnings } = await supabase
      .from("users")
      .select("referral_earnings")
      .eq("id", userId)
      .single();

    // Get this month's referrals
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonthReferrals } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    return {
      data: {
        totalReferrals: totalReferrals || 0,
        completedReferrals: completedReferrals || 0,
        totalEarnings: userEarnings?.referral_earnings || 0,
        thisMonthReferrals: thisMonthReferrals || 0,
        pendingRewards: (totalReferrals || 0) - (completedReferrals || 0),
      },
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: { message: error.message || "خطأ في جلب إحصائيات الإحالة" },
    };
  }
};

// Validate referral code
export const validateReferralCode = async (code: string) => {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: "كود الإحالة مطلوب" };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("referral_code", code.trim().toUpperCase())
    .single();

  if (error || !data) {
    return { isValid: false, error: "كود الإحالة غير صحيح" };
  }

  return { isValid: true, referrer: data };
};

// Get user credentials (username and password)
export const getUserCredentials = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_credentials")
    .select("username, password_hash")
    .eq("user_id", userId)
    .single();
  return { data, error };
};

// Get all user credentials (for admin viewing)
export const getAllUserCredentials = async () => {
  const { data, error } = await supabase.from("user_credentials").select(`
      username,
      password_hash,
      user_id,
      users!inner(email, full_name)
    `);
  return { data, error };
};

// Password reset functions
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return {
        error: { message: "فشل في إرسال رابط إعادة تعيين كلمة المرور" },
      };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Password reset catch error:", err);
    return {
      error: { message: "حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور" },
    };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return { error: { message: "فشل في تحديث كلمة المرور" } };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Password update catch error:", err);
    return { error: { message: "حدث خطأ في تحديث كلمة المرور" } };
  }
};

// Email verification functions
export const verifyOtp = async (token: string, type: string = "signup") => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      console.error("Email verification error:", error);
      return { error: { message: "فشل في تأكيد البريد الإلكتروني" } };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Email verification catch error:", err);
    return { error: { message: "حدث خطأ في تأكيد البريد الإلكتروني" } };
  }
};

export const resendVerification = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { error: { message: "لم يتم العثور على البريد الإلكتروني" } };
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      console.error("Resend verification error:", error);
      return { error: { message: "فشل في إعادة إرسال رسالة التأكيد" } };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Resend verification catch error:", err);
    return { error: { message: "حدث خطأ في إعادة إرسال رسالة التأكيد" } };
  }
};

// Check if user account is verified
export const checkAccountVerification = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("is_verified, verification_status")
    .eq("id", userId)
    .single();
  return { data, error };
};

// Update card balance
export const updateCardBalance = async (cardId: string, amount: number) => {
  const { data, error } = await supabase
    .from("cards")
    .update({
      balance: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .select()
    .single();
  return { data, error };
};

// Support Messages Functions
export const createSupportMessage = async (
  userId: string,
  subject: string,
  message: string,
  category: string = "general",
  priority: string = "normal",
) => {
  try {
    const { data, error } = await supabase.rpc("create_support_message", {
      p_user_id: userId,
      p_subject: subject,
      p_message: message,
      p_category: category,
      p_priority: priority,
    });

    if (error) {
      console.error("Error creating support message:", error);
      return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    console.error("Error in createSupportMessage:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في إرسال رسالة الدعم" },
    };
  }
};

export const getUserSupportMessages = async (
  userId: string,
  limit: number = 50,
) => {
  try {
    const { data, error } = await supabase.rpc("get_user_support_messages", {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error("Error getting support messages:", error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    console.error("Error in getUserSupportMessages:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في جلب رسائل الدعم" },
    };
  }
};

export const updateSupportMessageStatus = async (
  messageId: string,
  status: string,
  adminResponse?: string,
  adminId?: string,
) => {
  try {
    const { data, error } = await supabase.rpc(
      "update_support_message_status",
      {
        p_message_id: messageId,
        p_status: status,
        p_admin_response: adminResponse,
        p_admin_id: adminId,
      },
    );

    if (error) {
      console.error("Error updating support message status:", error);
      return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    console.error("Error in updateSupportMessageStatus:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في تحديث حالة الرسالة" },
    };
  }
};

// Account Verification Functions
export const submitAccountVerification = async (
  userId: string,
  verificationData: any,
) => {
  try {
    const { data, error } = await supabase
      .from("account_verifications")
      .insert({
        user_id: userId,
        country: verificationData.country,
        date_of_birth: verificationData.date_of_birth,
        full_address: verificationData.full_address,
        postal_code: verificationData.postal_code,
        document_type: verificationData.document_type,
        document_number: verificationData.document_number,
        documents: verificationData.documents,
        additional_notes: verificationData.additional_notes,
        status: "pending",
        submitted_at: verificationData.submitted_at,
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting account verification:", error);
      return { data: null, error };
    }

    // Update user verification status
    await supabase
      .from("users")
      .update({
        verification_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return { data, error: null };
  } catch (err: any) {
    console.error("Error in submitAccountVerification:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في إرسال طلب التوثيق" },
    };
  }
};

export const getUserVerificationStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("account_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error getting verification status:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("Error in getUserVerificationStatus:", err);
    return { data: null, error: { message: err.message } };
  }
};

export const updateVerificationStatus = async (
  verificationId: string,
  status: string,
  adminNotes?: string,
  adminId?: string,
) => {
  try {
    const { data, error } = await supabase
      .from("account_verifications")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", verificationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating verification status:", error);
      return { data: null, error };
    }

    // Update user verification status
    if (data) {
      await supabase
        .from("users")
        .update({
          verification_status: status,
          is_verified: status === "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user_id);
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("Error in updateVerificationStatus:", err);
    return {
      data: null,
      error: { message: err.message || "خطأ في تحديث حالة التوثيق" },
    };
  }
};

// Get all verification requests (for admin)
export const getAllVerificationRequests = async (
  limit: number = 100,
  offset: number = 0,
  status?: string,
) => {
  try {
    const { data, error } = await supabase.rpc("get_all_verifications", {
      p_limit: limit,
      p_offset: offset,
      p_status: status || null,
    });

    if (error) {
      console.error("Error getting all verification requests:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    console.error("Error in getAllVerificationRequests:", err);
    return { data: [], error: { message: err.message } };
  }
};

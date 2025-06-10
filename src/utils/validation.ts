// أدوات التحقق من صحة البيانات
// تحتوي على دوال للتحقق من صحة البيانات المالية والمصرفية

// التحقق من صحة مبلغ مالي
export const validateAmount = (
  amount: number | string,
): { isValid: boolean; value: number; error?: string } => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return {
      isValid: false,
      value: 0,
      error: "المبلغ يجب أن يكون رقماً صحيحاً",
    };
  }

  if (numAmount < 0) {
    return { isValid: false, value: 0, error: "المبلغ لا يمكن أن يكون سالباً" };
  }

  if (numAmount === 0) {
    return {
      isValid: false,
      value: 0,
      error: "المبلغ يجب أن يكون أكبر من صفر",
    };
  }

  // التحقق من أن المبلغ لا يتجاوز الحد الأقصى المسموح
  const maxAmount = 1000000000; // مليار
  if (numAmount > maxAmount) {
    return {
      isValid: false,
      value: 0,
      error: "المبلغ يتجاوز الحد الأقصى المسموح",
    };
  }

  return { isValid: true, value: numAmount };
};

// التحقق من صحة رمز العملة
export const validateCurrency = (
  currency: string,
): { isValid: boolean; value: string; error?: string } => {
  const validCurrencies = ["dzd", "eur", "usd", "gbp"];
  const normalizedCurrency = currency.toLowerCase().trim();

  if (!validCurrencies.includes(normalizedCurrency)) {
    return { isValid: false, value: "", error: "رمز العملة غير صحيح" };
  }

  return { isValid: true, value: normalizedCurrency };
};

// التحقق من صحة نوع المعاملة
export const validateTransactionType = (
  type: string,
): { isValid: boolean; value: string; error?: string } => {
  const validTypes = [
    "recharge",
    "transfer",
    "bill",
    "investment",
    "conversion",
    "withdrawal",
  ];
  const normalizedType = type.toLowerCase().trim();

  if (!validTypes.includes(normalizedType)) {
    return { isValid: false, value: "", error: "نوع المعاملة غير صحيح" };
  }

  return { isValid: true, value: normalizedType };
};

// التحقق من صحة نوع الاستثمار
export const validateInvestmentType = (
  type: string,
): { isValid: boolean; value: string; error?: string } => {
  const validTypes = ["weekly", "monthly", "quarterly", "yearly"];
  const normalizedType = type.toLowerCase().trim();

  if (!validTypes.includes(normalizedType)) {
    return { isValid: false, value: "", error: "نوع الاستثمار غير صحيح" };
  }

  return { isValid: true, value: normalizedType };
};

// التحقق من صحة معدل الربح
export const validateProfitRate = (
  rate: number | string,
): { isValid: boolean; value: number; error?: string } => {
  const numRate = typeof rate === "string" ? parseFloat(rate) : rate;

  if (isNaN(numRate)) {
    return {
      isValid: false,
      value: 0,
      error: "معدل الربح يجب أن يكون رقماً صحيحاً",
    };
  }

  if (numRate < 0) {
    return {
      isValid: false,
      value: 0,
      error: "معدل الربح لا يمكن أن يكون سالباً",
    };
  }

  if (numRate > 100) {
    return {
      isValid: false,
      value: 0,
      error: "معدل الربح لا يمكن أن يتجاوز 100%",
    };
  }

  return { isValid: true, value: numRate };
};

// التحقق من صحة التواريخ
export const validateDateRange = (
  startDate: string | Date,
  endDate: string | Date,
): { isValid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { isValid: false, error: "تاريخ البداية غير صحيح" };
  }

  if (isNaN(end.getTime())) {
    return { isValid: false, error: "تاريخ النهاية غير صحيح" };
  }

  if (end <= start) {
    return {
      isValid: false,
      error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    };
  }

  return { isValid: true };
};

// التحقق من صحة رقم الحساب
export const validateAccountNumber = (
  accountNumber: string,
): { isValid: boolean; value: string; error?: string } => {
  const trimmed = accountNumber.trim();

  if (!trimmed) {
    return { isValid: false, value: "", error: "رقم الحساب مطلوب" };
  }

  // التحقق من تنسيق رقم الحساب (يبدأ بـ ACC ويتبعه 9 أرقام)
  const accountPattern = /^ACC\d{9}$/;
  if (!accountPattern.test(trimmed)) {
    return {
      isValid: false,
      value: "",
      error: "تنسيق رقم الحساب غير صحيح (يجب أن يكون ACC متبوعاً بـ 9 أرقام)",
    };
  }

  return { isValid: true, value: trimmed };
};

// التحقق من صحة رقم الهاتف
export const validatePhoneNumber = (
  phone: string,
): { isValid: boolean; value: string; error?: string } => {
  const trimmed = phone.trim();

  if (!trimmed) {
    return { isValid: true, value: "" }; // رقم الهاتف اختياري
  }

  // التحقق من تنسيق رقم الهاتف (يبدأ بـ + ويتبعه أرقام)
  const phonePattern = /^\+\d{10,15}$/;
  if (!phonePattern.test(trimmed)) {
    return {
      isValid: false,
      value: "",
      error: "تنسيق رقم الهاتف غير صحيح (يجب أن يبدأ بـ + ويتبعه 10-15 رقماً)",
    };
  }

  return { isValid: true, value: trimmed };
};

// التحقق من صحة البريد الإلكتروني
export const validateEmail = (
  email: string,
): { isValid: boolean; value: string; error?: string } => {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, value: "", error: "البريد الإلكتروني مطلوب" };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return {
      isValid: false,
      value: "",
      error: "تنسيق البريد الإلكتروني غير صحيح",
    };
  }

  return { isValid: true, value: trimmed };
};

// التحقق من صحة كلمة المرور
export const validatePassword = (
  password: string,
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "كلمة المرور مطلوبة" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "كلمة المرور طويلة جداً (الحد الأقصى 128 حرف)",
    };
  }

  return { isValid: true };
};

// التحقق الشامل من بيانات المعاملة
export const validateTransactionData = (
  transaction: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // التحقق من المبلغ
  const amountValidation = validateAmount(transaction.amount);
  if (!amountValidation.isValid) {
    errors.push(amountValidation.error!);
  }

  // التحقق من العملة
  const currencyValidation = validateCurrency(transaction.currency || "dzd");
  if (!currencyValidation.isValid) {
    errors.push(currencyValidation.error!);
  }

  // التحقق من نوع المعاملة
  const typeValidation = validateTransactionType(transaction.type);
  if (!typeValidation.isValid) {
    errors.push(typeValidation.error!);
  }

  // التحقق من الوصف
  if (!transaction.description || transaction.description.trim().length === 0) {
    errors.push("وصف المعاملة مطلوب");
  }

  return { isValid: errors.length === 0, errors };
};

// التحقق الشامل من بيانات الاستثمار
export const validateInvestmentData = (
  investment: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // التحقق من المبلغ
  const amountValidation = validateAmount(investment.amount);
  if (!amountValidation.isValid) {
    errors.push(amountValidation.error!);
  }

  // التحقق من نوع الاستثمار
  const typeValidation = validateInvestmentType(investment.type);
  if (!typeValidation.isValid) {
    errors.push(typeValidation.error!);
  }

  // التحقق من معدل الربح
  const profitRateValidation = validateProfitRate(investment.profit_rate);
  if (!profitRateValidation.isValid) {
    errors.push(profitRateValidation.error!);
  }

  // التحقق من التواريخ
  const dateValidation = validateDateRange(
    investment.start_date,
    investment.end_date,
  );
  if (!dateValidation.isValid) {
    errors.push(dateValidation.error!);
  }

  return { isValid: errors.length === 0, errors };
};

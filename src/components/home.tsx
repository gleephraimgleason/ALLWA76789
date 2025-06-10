import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Wallet,
  TrendingUp,
  Send,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Eye,
  EyeOff,
  Bell,
  Settings,
  User,
  Star,
  Shield,
  UserCheck,
  Zap,
  Globe,
  ChevronRight,
  Activity,
  PieChart,
  Target,
  Gift,
  Calculator,
  PiggyBank,
  BarChart3,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import BottomNavBar from "./BottomNavBar";
import TopNavBar from "./TopNavBar";
import CurrencyConverter from "./CurrencyConverter";

// Lazy load tab components for better performance
const CardTab = lazy(() => import("./CardTab"));
const SavingsTab = lazy(() => import("./SavingsTab"));
const InstantTransferTab = lazy(() => import("./InstantTransferTab"));
const BillPaymentTab = lazy(() => import("./BillPaymentTab"));
const TransactionsTab = lazy(() => import("./TransactionsTab"));
const RechargeTab = lazy(() => import("./RechargeTab"));
const InvestmentTab = lazy(() => import("./InvestmentTab"));
import {
  createNotification,
  showBrowserNotification,
  type Notification,
} from "../utils/notifications";
import { ConversionResult } from "../utils/currency";
import { validateAmount, maskBalance, isDataLoaded } from "../utils/security";
import { useDatabase } from "../hooks/useDatabase";
import { useAuth } from "../hooks/useAuth";

interface HomeProps {
  onLogout?: () => void;
}

interface Investment {
  id: string;
  type: "weekly" | "monthly";
  amount: number;
  startDate: Date;
  endDate: Date;
  profitRate: number;
  status: "active" | "completed";
  profit: number;
}

function Home({ onLogout }: HomeProps) {
  const { user } = useAuth();
  const {
    balance,
    transactions,
    notifications,
    updateBalance,
    addTransaction,
    addNotification,
    getRecentTransactions,
    loading,
    error,
  } = useDatabase(user?.id || null);

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [showBalance, setShowBalance] = useState(true);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [isCardActivated] = useState(true);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [showBonusDialog, setShowBonusDialog] = useState(false);

  // Use balance from database only when loaded, otherwise show null
  const currentBalance = balance;
  const isBalanceLoaded = !loading && balance !== null;

  // Default fallback only for calculations, not display
  const fallbackBalance = {
    dzd: 0,
    eur: 0,
    usd: 0,
    gbp: 0,
  };

  const safeBalance = currentBalance || fallbackBalance;

  const currentTransactions = transactions || [];
  const currentNotifications = notifications || [];

  // Load recent transactions
  const loadRecentTransactions = async () => {
    if (!user?.id) return;

    setLoadingRecent(true);
    try {
      const { data } = await getRecentTransactions(5);
      if (data) {
        setRecentTransactions(data);
      }
    } catch (error) {
      console.error("Error loading recent transactions:", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Load recent transactions on component mount and when user changes
  useEffect(() => {
    loadRecentTransactions();
  }, [user?.id]);

  const handleSavingsDeposit = async (amount: number, goalId: string) => {
    if (!user?.id) return;

    try {
      console.log("Starting handleSavingsDeposit:", {
        amount,
        goalId,
        currentBalance: currentBalance.dzd,
        userId: user.id,
      });

      // Check if user has sufficient balance
      if (safeBalance.dzd < amount) {
        console.error("Insufficient balance:", {
          required: amount,
          available: safeBalance.dzd,
        });
        return;
      }

      // Calculate new balance after deduction
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd - amount,
      };

      console.log("Calculated new balance:", {
        oldBalance: safeBalance.dzd,
        deductedAmount: amount,
        newBalance: newBalance.dzd,
      });

      // Update balance in database first
      const balanceResult = await updateBalance(newBalance);
      if (balanceResult?.error) {
        console.error("Error updating balance:", balanceResult.error);
        return;
      }

      console.log("Balance updated successfully in database");

      // Add transaction to database
      const transactionData = {
        type: goalId === "investment" ? "investment" : "transfer",
        amount: amount,
        currency: "dzd",
        description: goalId === "investment" ? `استثمار` : `إيداع في الادخار`,
        status: "completed",
      };

      const transactionResult = await addTransaction(transactionData);
      if (transactionResult?.error) {
        console.error("Error adding transaction:", transactionResult.error);
      } else {
        console.log("Transaction added successfully");
      }
    } catch (error) {
      console.error("Error processing savings deposit:", error);
    }
  };

  const handleInvestmentReturn = async (amount: number) => {
    if (!user?.id) return;

    try {
      // Update balance in database
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd + amount,
      };
      await updateBalance(newBalance);

      // Add transaction to database
      const transactionData = {
        type: "investment",
        amount: amount,
        currency: "dzd",
        description: `عائد استثمار`,
        status: "completed",
      };
      await addTransaction(transactionData);
    } catch (error) {
      console.error("Error processing investment return:", error);
    }
  };

  const handleNotification = async (notification: Notification) => {
    if (!user?.id) return;

    try {
      const notificationData = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        is_read: false,
      };
      await addNotification(notificationData);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const handleCurrencyConversion = async (result: ConversionResult) => {
    if (!user?.id) return;

    try {
      let newBalance = { ...safeBalance };

      if (result.fromCurrency === "DZD" && result.toCurrency === "EUR") {
        newBalance = {
          ...newBalance,
          dzd: newBalance.dzd - result.fromAmount,
          eur: newBalance.eur + result.toAmount,
        };
      } else if (result.fromCurrency === "EUR" && result.toCurrency === "DZD") {
        newBalance = {
          ...newBalance,
          dzd: newBalance.dzd + result.toAmount,
          eur: newBalance.eur - result.fromAmount,
        };
      }

      await updateBalance(newBalance);

      const transactionData = {
        type: "conversion",
        amount: result.fromAmount,
        currency: result.fromCurrency.toLowerCase(),
        description: `تحويل ${result.fromCurrency} إلى ${result.toCurrency}`,
        status: "completed",
      };
      await addTransaction(transactionData);
    } catch (error) {
      console.error("Error processing currency conversion:", error);
    }
  };

  const handleAddMoney = () => {
    setShowAddMoneyDialog(true);
  };

  const confirmAddMoney = async () => {
    if (!user?.id || !addMoneyAmount || parseFloat(addMoneyAmount) <= 0) return;

    try {
      const chargeAmount = parseFloat(addMoneyAmount);

      // Update balance in database
      const newBalance = {
        ...safeBalance,
        dzd: safeBalance.dzd + chargeAmount,
      };
      await updateBalance(newBalance);

      // Add transaction to database
      const transactionData = {
        type: "recharge",
        amount: chargeAmount,
        currency: "dzd",
        description: "شحن المحفظة",
        status: "completed",
      };
      await addTransaction(transactionData);

      const notification = createNotification(
        "success",
        "تم الشحن بنجاح",
        `تم شحن ${chargeAmount.toLocaleString()} دج في محفظتك`,
      );
      await handleNotification(notification);
      showBrowserNotification(
        "تم الشحن بنجاح",
        `تم شحن ${chargeAmount.toLocaleString()} دج في محفظتك`,
      );
      setShowAddMoneyDialog(false);
      setAddMoneyAmount("");
    } catch (error) {
      console.error("Error adding money:", error);
    }
  };

  const quickActions = [
    {
      icon: Plus,
      title: "إضافة أموال",
      subtitle: "شحن سريع",
      color: "from-emerald-500 to-teal-600",
      action: () => {
        console.log("Recharge button clicked");
        setActiveTab("recharge");
      },
    },
    {
      icon: TrendingUp,
      title: "الأرباح",
      subtitle: "حقق أهدافك",
      color: "from-green-500 to-emerald-600",
      action: () => {
        console.log("Savings button clicked");
        setActiveTab("savings");
      },
    },
    {
      icon: CreditCard,
      title: "البطاقة",
      subtitle: "إدارة البطاقة",
      color: "from-purple-500 to-pink-600",
      action: () => {
        console.log("Card button clicked");
        setActiveTab("card");
      },
    },
    {
      icon: Calculator,
      title: "محول العملات",
      subtitle: "تحويل سريع",
      color: "from-indigo-500 to-purple-600",
      action: () => {
        console.log("Currency converter button clicked");
        setShowCurrencyConverter(true);
      },
    },
  ];

  // Helper functions for transaction display
  const getTransactionIcon = (
    type: string,
    amount: number,
    isInstant: boolean = false,
  ) => {
    if (isInstant) {
      return (
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
      );
    }

    switch (type) {
      case "recharge":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
        );
      case "instant_transfer_sent":
      case "transfer":
        return amount > 0 ? (
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        );
      case "investment":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        );
      case "bill":
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const getTransactionTitle = (transaction: any) => {
    if (transaction.is_instant) {
      return transaction.type === "instant_transfer_sent"
        ? "تحويل فوري صادر"
        : "تحويل فوري وارد";
    }

    switch (transaction.type) {
      case "recharge":
        return "شحن المحفظة";
      case "transfer":
        return transaction.amount > 0 ? "تحويل مستلم" : "تحويل مرسل";
      case "investment":
        return "استثمار";
      case "bill":
        return "دفع فاتورة";
      case "conversion":
        return "تحويل عملة";
      default:
        return "معاملة مالية";
    }
  };

  const getTransactionDescription = (transaction: any) => {
    if (transaction.is_instant) {
      if (transaction.type === "instant_transfer_sent") {
        return `إلى ${transaction.recipient_name || transaction.recipient}`;
      } else {
        return `من ${transaction.sender_name || transaction.recipient}`;
      }
    }
    return transaction.description;
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

  // Loading fallback component for tabs
  const TabLoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 relative">
        <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-0.5"></div>
        </div>
        <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4 sm:space-y-6 pb-20 px-2 sm:px-0">
            {/* Enhanced Page Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full backdrop-blur-sm mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-white/90 text-sm font-medium">
                  متصل الآن
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                مرحباً بك في محفظتك الرقمية
              </h2>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                إدارة أموالك بسهولة وأمان مع أحدث التقنيات المالية
              </p>
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-4">
                <div className="flex items-center space-x-2 space-x-reverse text-green-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">محمي بالكامل</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-blue-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">معاملات فورية</span>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 text-white relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/20 to-white/5 rounded-full -translate-y-16 sm:-translate-y-20 translate-x-16 sm:translate-x-20 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-white/10 to-white/5 rounded-full translate-y-12 sm:translate-y-16 -translate-x-12 sm:-translate-x-16 animate-pulse animation-delay-2000"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50"></div>
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <span className="text-white/90 text-sm sm:text-base font-medium">
                        الرصيد الإجمالي
                      </span>
                      <p className="text-white/70 text-xs">محدث الآن</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white/80 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                  >
                    {showBalance ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <div className="space-y-6">
                  {/* Primary Balance - DZD */}
                  <div className="space-y-3">
                    <div className="flex items-baseline space-x-3 space-x-reverse">
                      <div className="flex flex-col">
                        <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                          {!showBalance
                            ? "••••••"
                            : !isBalanceLoaded
                              ? ""
                              : safeBalance.dzd.toLocaleString()}
                        </span>
                        <span className="text-white/90 text-2xl sm:text-3xl lg:text-4xl font-medium mt-1">
                          دينار جزائري
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                      <span className="text-white/80 text-sm font-medium">
                        المعادل بالعملات الأخرى
                      </span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-bold">
                          +2.5%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Other Currencies */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full">
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            $
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {!showBalance
                          ? "••••••"
                          : !isBalanceLoaded
                            ? ""
                            : safeBalance.usd.toLocaleString()}
                      </p>
                      <p className="text-sm sm:text-base text-white/70 font-medium">
                        دولار أمريكي
                      </p>
                    </div>
                    <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            €
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {!showBalance
                          ? "••••••"
                          : !isBalanceLoaded
                            ? ""
                            : safeBalance.eur.toLocaleString()}
                      </p>
                      <p className="text-sm sm:text-base text-white/70 font-medium">
                        يورو
                      </p>
                    </div>
                    <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full">
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            £
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {!showBalance
                          ? "••••"
                          : !isBalanceLoaded
                            ? ""
                            : safeBalance.gbp?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-sm sm:text-base text-white/70 font-medium">
                        جنيه إسترليني
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${action.color} border-0 cursor-pointer hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl group relative overflow-hidden backdrop-blur-sm`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log(`Quick action clicked: ${action.title}`);
                      action.action();
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
                    <CardContent className="p-6 sm:p-8 text-center relative z-10">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 backdrop-blur-sm">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <p className="text-white font-bold text-base mb-2">
                        {action.title}
                      </p>
                      <p className="text-white/90 text-sm font-medium">
                        {action.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {/* Recent Transactions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      المعاملات الأخيرة
                    </h2>
                    <p className="text-white/70 text-sm">آخر 5 معاملات</p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveTab("transactions")}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  عرض الكل
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4">
                  {loadingRecent ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400 text-sm">
                        جاري تحميل المعاملات...
                      </p>
                    </div>
                  ) : recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, index) => (
                        <div
                          key={transaction.id || index}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] border border-white/10 hover:border-white/20"
                        >
                          <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                            {getTransactionIcon(
                              transaction.type,
                              transaction.amount,
                              transaction.is_instant,
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-white text-sm truncate">
                                  {getTransactionTitle(transaction)}
                                </p>
                                {transaction.is_instant && (
                                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    ⚡
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-300 truncate">
                                {getTransactionDescription(transaction)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    transaction.created_at,
                                  ).toLocaleDateString("ar-DZ", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {transaction.reference && (
                                  <span className="text-xs text-gray-500 font-mono">
                                    {transaction.reference.slice(-6)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`font-bold text-sm ${
                                transaction.amount > 0
                                  ? "text-green-400"
                                  : "text-orange-400"
                              }`}
                            >
                              {!isBalanceLoaded
                                ? ""
                                : `${transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()} دج`}
                            </p>
                            <div className="flex items-center justify-end mt-1">
                              {transaction.status === "completed" ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : transaction.status === "pending" ? (
                                <Clock className="w-3 h-3 text-yellow-400" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-400" />
                              )}
                              <span className="text-xs text-gray-400 mr-1">
                                {transaction.status === "completed"
                                  ? "مكتملة"
                                  : transaction.status === "pending"
                                    ? "معلقة"
                                    : "فاشلة"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">لا توجد معاملات حتى الآن</p>
                        <p className="text-xs mt-1">
                          ابدأ باستخدام محفظتك لرؤية المعاملات هنا
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "recharge":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <RechargeTab
              balance={safeBalance}
              onRecharge={async (amount, method, rib) => {
                if (!user?.id) return;

                try {
                  // Add transaction to database
                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: `شحن من ${method} - RIB: ${rib}`,
                    status: "pending",
                    reference: rib,
                  };
                  await addTransaction(transactionData);

                  const notification = createNotification(
                    "success",
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج من RIB: ${rib} خلال 5-10 دقائق`,
                  );
                  await handleNotification(notification);
                  showBrowserNotification(
                    "تم استلام طلب الشحن",
                    `سيتم إضافة ${amount.toLocaleString()} دج خلال 5-10 دقائق`,
                  );
                } catch (error) {
                  console.error("Error processing recharge:", error);
                }
              }}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "savings":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <SavingsTab
              balance={safeBalance}
              onSavingsDeposit={handleSavingsDeposit}
              onInvestmentReturn={handleInvestmentReturn}
              onNotification={handleNotification}
              onAddTestBalance={async (amount) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd + amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "recharge",
                    amount: amount,
                    currency: "dzd",
                    description: "إضافة رصيد تجريبي",
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error adding test balance:", error);
                }
              }}
            />
          </Suspense>
        );
      case "card":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <CardTab isActivated={isCardActivated} balance={safeBalance} />
          </Suspense>
        );
      case "instant-transfer":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <InstantTransferTab
              balance={safeBalance}
              onTransfer={async (amount, recipient) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd - amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "instant_transfer",
                    amount: amount,
                    currency: "dzd",
                    description: `تحويل فوري إلى ${recipient}`,
                    recipient: recipient,
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error processing instant transfer:", error);
                }
              }}
            />
          </Suspense>
        );
      case "bills":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <BillPaymentTab
              balance={safeBalance}
              onPayment={async (amount, billType, reference) => {
                if (!user?.id) return;

                try {
                  const newBalance = {
                    ...safeBalance,
                    dzd: safeBalance.dzd - amount,
                  };
                  await updateBalance(newBalance);

                  const transactionData = {
                    type: "bill",
                    amount: amount,
                    currency: "dzd",
                    description: `دفع فاتورة ${billType} - ${reference}`,
                    reference: reference,
                    status: "completed",
                  };
                  await addTransaction(transactionData);
                } catch (error) {
                  console.error("Error processing bill payment:", error);
                }
              }}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "investment":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <InvestmentTab
              balance={safeBalance}
              onSavingsDeposit={handleSavingsDeposit}
              onInvestmentReturn={handleInvestmentReturn}
              onNotification={handleNotification}
            />
          </Suspense>
        );
      case "transactions":
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <TransactionsTab transactions={currentTransactions} />
          </Suspense>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-lg">قريباً...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-indigo-400/30 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/15 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse"></div>
      </div>
      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 bg-black/5">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), 
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: "30px 30px, 30px 30px, 200px 200px, 200px 200px",
          }}
        ></div>
      </div>
      {/* Top Navigation */}
      <TopNavBar className="relative z-20" onLogout={onLogout} />
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 lg:p-8 pt-20">
        <div className="max-w-sm sm:max-w-md lg:max-w-4xl xl:max-w-6xl w-full">
          {renderTabContent()}
          <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
          <CurrencyConverter
            isOpen={showCurrencyConverter}
            onClose={() => setShowCurrencyConverter(false)}
            onConvert={handleCurrencyConversion}
          />

          {/* Add Money Dialog */}
          <Dialog
            open={showAddMoneyDialog}
            onOpenChange={setShowAddMoneyDialog}
          >
            <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border border-white/20 text-white max-w-md mx-auto">
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Plus className="w-6 h-6 text-green-400" />
                  شحن المحفظة
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  أدخل المبلغ الذي تريد إضافته إلى محفظتك
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="addAmount" className="text-white font-medium">
                    مبلغ الشحن (دج)
                  </Label>
                  <Input
                    id="addAmount"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    className="text-center text-lg bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowAddMoneyDialog(false);
                      setAddMoneyAmount("");
                    }}
                    variant="outline"
                    className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60 text-right"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={confirmAddMoney}
                    disabled={
                      !addMoneyAmount || parseFloat(addMoneyAmount) <= 0
                    }
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    شحن المحفظة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bonus Dialog */}
          <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
            <DialogContent className="bg-gradient-to-br from-slate-900/95 via-yellow-900/95 to-slate-900/95 backdrop-blur-md border border-yellow-400/30 text-white max-w-md mx-auto">
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Gift className="w-6 h-6 text-yellow-400" />
                  مكافأة خاصة!
                </DialogTitle>
                <DialogDescription className="text-yellow-200">
                  احصل على 5% مكافأة من رصيدك الحالي
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <p className="text-yellow-200 text-sm mb-2">رصيدك الحالي:</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {!isBalanceLoaded
                      ? ""
                      : `${safeBalance.dzd.toLocaleString()} دج`}
                  </p>
                  <p className="text-yellow-200 text-sm mb-2">ستحصل على:</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {!isBalanceLoaded
                      ? ""
                      : `${Math.floor(safeBalance.dzd * 0.05).toLocaleString()} دج`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowBonusDialog(false)}
                    variant="outline"
                    className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60 text-right"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!user?.id) return;

                      try {
                        const bonusAmount = Math.floor(safeBalance.dzd * 0.05);
                        const newBalance = {
                          ...safeBalance,
                          dzd: safeBalance.dzd + bonusAmount,
                        };
                        await updateBalance(newBalance);

                        const transactionData = {
                          type: "recharge",
                          amount: bonusAmount,
                          currency: "dzd",
                          description: "كافأة خاصة - 5% من الرصيد",
                          status: "completed",
                        };
                        await addTransaction(transactionData);

                        const notification = createNotification(
                          "success",
                          "تم الحصول على المكافأة!",
                          `تم إضافة ${bonusAmount.toLocaleString()} دج ككافأة`,
                        );
                        await handleNotification(notification);
                        showBrowserNotification(
                          "تم الحصول على المكافأة!",
                          `تم إضافة ${bonusAmount.toLocaleString()} دج ككافأة`,
                        );
                        setShowBonusDialog(false);
                      } catch (error) {
                        console.error("Error processing bonus:", error);
                      }
                    }}
                    className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    احصل على المكافأة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default Home;

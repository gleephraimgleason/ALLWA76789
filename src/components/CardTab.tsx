import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  CreditCard,
  CheckCircle,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Key,
  Settings,
  MoreHorizontal,
  Plus,
  Wallet,
  CreditCard as CardIcon,
  MessageCircle,
  Send,
  HelpCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  generateSecureCardNumber,
  maskCardNumber,
  maskBalance,
  isDataLoaded,
} from "../utils/security";
import {
  createNotification,
  showBrowserNotification,
} from "../utils/notifications";
import { useAuth } from "../hooks/useAuth";
import { useDatabase } from "../hooks/useDatabase";

interface CardTabProps {
  isActivated: boolean;
  balance?: {
    dzd: number;
    eur: number;
    usd: number;
    gbp: number;
  };
}

function CardTab({ isActivated, balance: propBalance }: CardTabProps) {
  const { user } = useAuth();
  const {
    cards,
    balance: dbBalance,
    updateCardStatus,
    updateBalance,
    loading,
  } = useDatabase(user?.id || null);

  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [pinStep, setPinStep] = useState(1);
  const [showSolidCardActionsDialog, setShowSolidCardActionsDialog] =
    useState(false);
  const [showVirtualCardActionsDialog, setShowVirtualCardActionsDialog] =
    useState(false);
  const [showSolidCardSettings, setShowSolidCardSettings] = useState(false);
  const [showVirtualCardSettings, setShowVirtualCardSettings] = useState(false);
  const [showSolidCardBalance, setShowSolidCardBalance] = useState(true);
  const [showVirtualCardBalance, setShowVirtualCardBalance] = useState(true);
  const [showChargeCardDialog, setShowChargeCardDialog] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("eur");
  const [isAccountVerified] = useState(false); // This would come from user profile in real app
  const [solidCardBalance, setSolidCardBalance] = useState(0);
  const [virtualCardBalance, setVirtualCardBalance] = useState(0);
  const [solidCardCurrency, setSolidCardCurrency] = useState("dzd");
  const [virtualCardCurrency, setVirtualCardCurrency] = useState("dzd");
  const [ccv] = useState("123"); // This would be generated/stored securely
  const [activeCardType, setActiveCardType] = useState<"solid" | "virtual">(
    "solid",
  );

  // Get user's cards from database
  const solidCard = cards?.find((card) => card.card_type === "solid");
  const virtualCard = cards?.find((card) => card.card_type === "virtual");

  // Use balance from database or props, don't show default values
  const isBalanceLoaded = isDataLoaded(dbBalance || propBalance, loading);
  const balance = isBalanceLoaded ? dbBalance?.dzd || propBalance?.dzd || 0 : 0;
  const fullBalance = isBalanceLoaded
    ? dbBalance || propBalance || { dzd: 0, eur: 0, usd: 0, gbp: 0 }
    : { dzd: 0, eur: 0, usd: 0, gbp: 0 };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "eur":
        return "€";
      case "usd":
        return "$";
      case "gbp":
        return "£";
      case "dzd":
        return "دج";
      default:
        return "دج";
    }
  };

  const copyToClipboard = (text: string, message = "تم نسخ المحتوى بنجاح!") => {
    navigator.clipboard.writeText(text);
    const notification = createNotification("success", "تم النسخ", message);
    showBrowserNotification("تم النسخ", message);
  };

  const copyCardNumber = (cardType: "solid" | "virtual" = "solid") => {
    const card = cardType === "solid" ? solidCard : virtualCard;
    const cardNumber = card?.card_number || generateSecureCardNumber();
    copyToClipboard(cardNumber, "تم نسخ رقم البطاقة بنجاح!");
  };

  const copyCardholderName = () => {
    const profile = user?.profile;
    const fullName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.profile?.username ||
      user?.credentials?.username ||
      "اسم المستخدم";
    copyToClipboard(fullName, "تم نسخ اسم حامل البطاقة بنجاح!");
  };

  const copyExpiryDate = () => {
    copyToClipboard("12/28", "تم نسخ تاريخ انتهاء الصلاحية بنجاح!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20 px-3 sm:px-4">
      <Tabs defaultValue="solid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger
            value="solid"
            className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            البطاقة الصلبة
          </TabsTrigger>
          <TabsTrigger
            value="virtual"
            className="text-white data-[state=active]:bg-gray-600 data-[state=active]:text-white"
          >
            <Wallet className="w-4 h-4 mr-2" />
            البطاقة الافتراضية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-6">
          {/* Solid Card Content */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <CreditCard className="w-6 h-6" />
                البطاقة الصلبة
              </h3>

              {/* Card Balance Display */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 mb-4 border border-white/20 shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <p className="text-white/90 text-base font-medium">
                      رصيد البطاقة الصلبة
                    </p>
                  </div>
                  <p className="text-white text-3xl font-bold mb-1">
                    {isBalanceLoaded
                      ? `${(solidCardBalance || 0).toLocaleString()} ${getCurrencySymbol(solidCardCurrency)}`
                      : "جاري التحميل..."}
                  </p>
                  <p className="text-white/70 text-sm">متاح للاستخدام الفوري</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() =>
                    setShowSolidCardSettings(!showSolidCardSettings)
                  }
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-sm transition-all duration-300"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  إعدادات البطاقة
                </Button>
              </div>

              {showSolidCardSettings && (
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowSolidCardBalance(!showSolidCardBalance);
                    }}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showSolidCardBalance ? "إخفاء الرصيد" : "عرض الرصيد"}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveCardType("solid");
                      setShowChargeCardDialog(true);
                    }}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    شحن البطاقة
                  </Button>
                  <Button
                    onClick={() => setShowSolidCardActionsDialog(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    عمليات البطاقة
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-center px-2">
              <div className="relative w-full max-w-md h-48 sm:h-56">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-600 rounded-2xl blur-2xl opacity-60 animate-pulse"></div>

                <div
                  className={`relative w-full h-full ${solidCard?.is_frozen ? "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800" : "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-700"} rounded-2xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl border border-white/30 overflow-hidden`}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-black bg-opacity-10 rounded-2xl overflow-hidden">
                    {/* Frozen Overlay */}
                    {solidCard?.is_frozen && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                        <div className="text-center">
                          <Lock className="w-12 h-12 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 font-bold text-lg">
                            البطاقة مجمدة
                          </p>
                          <p className="text-gray-300 text-sm">Card Frozen</p>
                        </div>
                      </div>
                    )}
                    {/* Chip */}
                    <div className="absolute top-4 sm:top-5 right-4 sm:right-6 w-12 h-8 sm:w-14 sm:h-10 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg shadow-xl border-2 border-yellow-200/50">
                      <div className="absolute inset-1 bg-gradient-to-br from-yellow-100/30 to-transparent rounded-md"></div>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-100/60 rounded-full"></div>
                    </div>

                    {/* Floating Sparkles - Organized Pattern */}
                    <div className="absolute top-6 sm:top-8 left-6 sm:left-8 animate-bounce">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-70" />
                    </div>
                    <div
                      className="absolute bottom-8 sm:bottom-10 right-8 sm:right-12 animate-bounce"
                      style={{ animationDelay: "1s" }}
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-60" />
                    </div>
                    <div
                      className="absolute top-12 sm:top-16 right-16 sm:right-24 animate-bounce"
                      style={{ animationDelay: "2s" }}
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-50" />
                    </div>

                    {/* Geometric Patterns - Organized Layout */}
                    <div
                      className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-14 h-14 sm:w-18 sm:h-18 border-2 border-white/25 rounded-full animate-spin"
                      style={{ animationDuration: "25s" }}
                    >
                      <div className="absolute inset-2 border border-white/20 rounded-full"></div>
                      <div className="absolute inset-4 border border-white/15 rounded-full"></div>
                    </div>

                    {/* Brand Pattern Elements */}
                    <div className="absolute top-16 sm:top-20 left-8 sm:left-12 w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 rounded-lg rotate-45"></div>
                    <div className="absolute bottom-12 sm:bottom-16 right-20 sm:right-28 w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl backdrop-blur-sm border border-white/30">
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-green-400/30">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* VISA Logo */}
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-lg">
                            VISA
                          </div>
                          <div className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                            PREMIUM
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="my-3 sm:my-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div
                          className="text-sm sm:text-lg font-mono tracking-widest bg-white/95 bg-clip-text text-transparent drop-shadow-md cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 flex-1"
                          onClick={() => copyCardNumber("solid")}
                          title="انقر لنسخ رقم البطاقة"
                        >
                          {showCardDetails
                            ? (
                                solidCard?.card_number ||
                                generateSecureCardNumber()
                              )
                                .replace(/(\d{4})/g, "$1 ")
                                .trim()
                            : !isBalanceLoaded
                              ? ""
                              : maskCardNumber(
                                  solidCard?.card_number ||
                                    generateSecureCardNumber(),
                                )}
                        </div>
                        <Button
                          onClick={() => setShowCardDetails(!showCardDetails)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg"
                        >
                          {showCardDetails ? (
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <div className="text-xs sm:text-sm text-white/70 font-medium mb-1">
                          CARDHOLDER NAME
                        </div>
                        <div
                          className="text-sm sm:text-lg font-mono font-bold bg-white/95 bg-clip-text text-transparent drop-shadow-sm cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10"
                          onClick={copyCardholderName}
                          title="انقر لنسخ اسم حامل البطاقة"
                        >
                          {user?.profile?.full_name ||
                            user?.user_metadata?.full_name ||
                            user?.profile?.username ||
                            user?.credentials?.username ||
                            "اسم المستخدم"}
                        </div>
                      </div>
                      <div className="text-right flex flex-col">
                        <div className="text-xs sm:text-sm text-white/70 font-medium mb-1">
                          VALID THRU
                        </div>
                        <div
                          className="text-sm sm:text-lg font-mono font-bold bg-white/95 bg-clip-text text-transparent drop-shadow-sm cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10"
                          onClick={copyExpiryDate}
                          title="انقر لنسخ تاريخ انتهاء الصلاحية"
                        >
                          12/28
                        </div>
                      </div>
                    </div>

                    {/* Activation Status */}
                    {isActivated && <></>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="virtual" className="space-y-6">
          {/* Virtual Card Content */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <Wallet className="w-6 h-6" />
                البطاقة الافتراضية
              </h3>

              {/* Virtual Card Balance Display */}
              <div className="bg-gradient-to-r from-gray-500/20 to-slate-500/20 backdrop-blur-sm rounded-xl p-6 mb-4 border border-white/20 shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <p className="text-white/90 text-base font-medium">
                      رصيد البطاقة الافتراضية
                    </p>
                  </div>
                  <p className="text-white text-3xl font-bold mb-1">
                    {isBalanceLoaded
                      ? `${(virtualCardBalance || 0).toLocaleString()} ${getCurrencySymbol(virtualCardCurrency)}`
                      : "جاري التحميل..."}
                  </p>
                  <p className="text-white/70 text-sm">للمدفوعات الرقمية</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() =>
                    setShowVirtualCardSettings(!showVirtualCardSettings)
                  }
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-sm transition-all duration-300"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  إعدادات البطاقة
                </Button>
              </div>

              {showVirtualCardSettings && (
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowVirtualCardBalance(!showVirtualCardBalance);
                    }}
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showVirtualCardBalance ? "إخفاء الرصيد" : "عرض الرصيد"}
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveCardType("virtual");
                      setShowChargeCardDialog(true);
                    }}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    شحن البطاقة
                  </Button>
                  <Button
                    onClick={() => setShowVirtualCardActionsDialog(true)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white backdrop-blur-sm transition-all duration-300"
                    size="sm"
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    عمليات البطاقة
                  </Button>
                </div>
              )}
            </div>

            {/* Virtual Card Visual */}
            <div className="flex justify-center px-2 mb-8">
              <div className="relative w-full max-w-md h-48 sm:h-56">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-slate-400 to-gray-600 rounded-2xl blur-2xl opacity-60 animate-pulse"></div>

                <div
                  className={`relative w-full h-full ${virtualCard?.is_frozen ? "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800" : "bg-gradient-to-br from-gray-600 via-slate-600 to-gray-700"} rounded-2xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-3xl border border-white/30 overflow-hidden`}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-black bg-opacity-10 rounded-2xl overflow-hidden">
                    {/* Frozen Overlay */}
                    {virtualCard?.is_frozen && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                        <div className="text-center">
                          <Lock className="w-12 h-12 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 font-bold text-lg">
                            البطاقة مجمدة
                          </p>
                          <p className="text-gray-300 text-sm">Card Frozen</p>
                        </div>
                      </div>
                    )}
                    {/* Chip */}
                    <div className="absolute top-4 sm:top-5 right-4 sm:right-6 w-12 h-8 sm:w-14 sm:h-10 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg shadow-xl border-2 border-yellow-200/50">
                      <div className="absolute inset-1 bg-gradient-to-br from-yellow-100/30 to-transparent rounded-md"></div>
                      <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-100/60 rounded-full"></div>
                    </div>

                    {/* Floating Sparkles */}
                    <div className="absolute top-6 sm:top-8 left-6 sm:left-8 animate-bounce">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-70" />
                    </div>
                    <div
                      className="absolute bottom-8 sm:bottom-10 right-8 sm:right-12 animate-bounce"
                      style={{ animationDelay: "1s" }}
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-60" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl backdrop-blur-sm border border-white/30">
                          <CardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="bg-green-500/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-green-400/30">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* VIRTUAL CARD Logo */}
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-black tracking-wider text-white drop-shadow-lg">
                            VIRTUAL CARD
                          </div>
                          <div className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                            DIGITAL
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="my-3 sm:my-4">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <div
                          className="text-sm sm:text-lg font-mono tracking-widest bg-white/95 bg-clip-text text-transparent drop-shadow-md cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 flex-1"
                          onClick={() => copyCardNumber("virtual")}
                          title="انقر لنسخ رقم البطاقة"
                        >
                          {showCardDetails
                            ? (
                                virtualCard?.card_number ||
                                generateSecureCardNumber()
                              )
                                .replace(/(\d{4})/g, "$1 ")
                                .trim()
                            : !isBalanceLoaded
                              ? ""
                              : maskCardNumber(
                                  virtualCard?.card_number ||
                                    generateSecureCardNumber(),
                                )}
                        </div>
                        <Button
                          onClick={() => setShowCardDetails(!showCardDetails)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg"
                        >
                          {showCardDetails ? (
                            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <div className="text-xs sm:text-sm text-white/70 font-medium mb-1">
                          CARDHOLDER NAME
                        </div>
                        <div
                          className="text-sm sm:text-lg font-mono font-bold bg-white/95 bg-clip-text text-transparent drop-shadow-sm cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10"
                          onClick={copyCardholderName}
                          title="انقر لنسخ اسم حامل البطاقة"
                        >
                          {user?.profile?.full_name ||
                            user?.user_metadata?.full_name ||
                            user?.profile?.username ||
                            user?.credentials?.username ||
                            "اسم المستخدم"}
                        </div>
                      </div>
                      <div className="text-right flex flex-col">
                        <div className="text-xs sm:text-sm text-white/70 font-medium mb-1">
                          VALID THRU
                        </div>
                        <div
                          className="text-sm sm:text-lg font-mono font-bold bg-white/95 bg-clip-text text-transparent drop-shadow-sm cursor-pointer hover:bg-white/80 hover:bg-clip-text transition-all duration-200 p-1.5 sm:p-2 rounded-lg hover:bg-white/10"
                          onClick={copyExpiryDate}
                          title="انقر لنسخ تاريخ انتهاء الصلاحية"
                        >
                          12/28
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Solid Card Actions Dialog */}
      <Dialog
        open={showSolidCardActionsDialog}
        onOpenChange={setShowSolidCardActionsDialog}
      >
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-md border border-blue-400/30 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" />
              عمليات البطاقة الصلبة
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              اختر العملية التي تريد تنفيذها
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={async () => {
                setShowSolidCardActionsDialog(false);
                if (solidCard?.is_frozen) {
                  if (solidCard && updateCardStatus) {
                    await updateCardStatus(solidCard.id, { is_frozen: false });
                    const notification = createNotification(
                      "success",
                      "تم إلغاء تجميد البطاقة الصلبة",
                      "تم إلغاء تجميد البطاقة الصلبة بنجاح. يمكنك الآن استخدامها.",
                    );
                    showBrowserNotification(
                      "تم إلغاء تجميد البطاقة الصلبة",
                      "تم إلغاء تجميد البطاقة الصلبة بنجاح",
                    );
                  }
                } else {
                  setShowFreezeDialog(true);
                }
              }}
              className={`w-full h-14 ${solidCard?.is_frozen ? "bg-green-600/20 hover:bg-green-500/30 border-green-400/30" : "bg-red-600/20 hover:bg-red-500/30 border-red-400/30"} text-white flex items-center justify-center gap-3`}
              variant="outline"
            >
              <Lock className="w-5 h-5" />
              <span className="text-base font-medium">
                {solidCard?.is_frozen ? "إلغاء التجميد" : "تجميد البطاقة"}
              </span>
            </Button>

            <Button
              onClick={() => {
                setShowSolidCardActionsDialog(false);
                setShowLimitDialog(true);
                setNewLimit("");
              }}
              className="w-full h-14 bg-purple-600/20 hover:bg-purple-500/30 border border-purple-400/30 text-white flex items-center justify-center gap-3"
              variant="outline"
            >
              <Settings className="w-5 h-5" />
              <span className="text-base font-medium">حدود الإنفاق</span>
            </Button>

            <Button
              onClick={() => {
                setShowSolidCardActionsDialog(false);
                setShowPinDialog(true);
                setPinStep(1);
                setCurrentPin("");
                setNewPin("");
                setConfirmPin("");
              }}
              className="w-full h-14 bg-yellow-600/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-white flex items-center justify-center gap-3"
              variant="outline"
            >
              <Key className="w-5 h-5" />
              <span className="text-base font-medium">تغيير الرقم السري</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Virtual Card Actions Dialog */}
      <Dialog
        open={showVirtualCardActionsDialog}
        onOpenChange={setShowVirtualCardActionsDialog}
      >
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-md border border-gray-400/30 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6 text-gray-400" />
              عمليات البطاقة الافتراضية
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              اختر العملية التي تريد تنفيذها
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={async () => {
                setShowVirtualCardActionsDialog(false);
                if (virtualCard && updateCardStatus) {
                  const newFrozenState = !virtualCard.is_frozen;
                  await updateCardStatus(virtualCard.id, {
                    is_frozen: newFrozenState,
                  });

                  const notification = createNotification(
                    "success",
                    newFrozenState
                      ? "تم تجميد البطاقة الافتراضية"
                      : "تم إلغاء تجميد البطاقة الافتراضية",
                    newFrozenState
                      ? "تم تجميد البطاقة الافتراضية بنجاح. يمكنك إلغاء التجميد في أي وقت."
                      : "تم إلغاء تجميد البطاقة الافتراضية بنجاح. يمكنك الآن استخدامها.",
                  );
                  showBrowserNotification(
                    newFrozenState
                      ? "تم تجميد البطاقة الافتراضية"
                      : "تم إلغاء تجميد البطاقة الافتراضية",
                    newFrozenState
                      ? "تم تجميد البطاقة الافتراضية بنجاح"
                      : "تم إلغاء تجميد البطاقة الافتراضية بنجاح",
                  );
                }
              }}
              className={`w-full h-14 ${virtualCard?.is_frozen ? "bg-green-600/20 hover:bg-green-500/30 border-green-400/30" : "bg-red-600/20 hover:bg-red-500/30 border-red-400/30"} text-white flex items-center justify-center gap-3`}
              variant="outline"
            >
              <Lock className="w-5 h-5" />
              <span className="text-base font-medium">
                {virtualCard?.is_frozen ? "إلغاء التجميد" : "تجميد البطاقة"}
              </span>
            </Button>

            <Button
              onClick={() => {
                setShowVirtualCardActionsDialog(false);
                setShowLimitDialog(true);
                setNewLimit("");
              }}
              className="w-full h-14 bg-purple-600/20 hover:bg-purple-500/30 border border-purple-400/30 text-white flex items-center justify-center gap-3"
              variant="outline"
            >
              <Settings className="w-5 h-5" />
              <span className="text-base font-medium">حدود الإنفاق</span>
            </Button>

            <Button
              onClick={() => {
                setShowVirtualCardActionsDialog(false);
                setShowPinDialog(true);
                setPinStep(1);
                setCurrentPin("");
                setNewPin("");
                setConfirmPin("");
              }}
              className="w-full h-14 bg-yellow-600/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-white flex items-center justify-center gap-3"
              variant="outline"
            >
              <Key className="w-5 h-5" />
              <span className="text-base font-medium">تغيير الرقم السري</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Freeze Card Dialog */}
      <AlertDialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900/95 via-red-900/95 to-slate-900/95 backdrop-blur-md border border-red-400/30 text-white max-w-md mx-auto">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-red-400" />
              تجميد البطاقة الصلبة
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              هل أنت متأكد من تجميد البطاقة الصلبة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 my-4">
            <p className="text-red-200 text-sm text-center">
              لن تتمكن من استخدام البطاقة الصلبة حتى إلغاء التجميد. يمكنك إلغاء
              التجميد في أي وقت من خلال التطبيق.
            </p>
          </div>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (solidCard && updateCardStatus) {
                  await updateCardStatus(solidCard.id, { is_frozen: true });
                  const notification = createNotification(
                    "success",
                    "تم تجميد البطاقة الصلبة",
                    "تم تجميد البطاقة الصلبة بنجاح. يمكنك إلغاء التجميد في أي وقت.",
                  );
                  showBrowserNotification(
                    "تم تجميد البطاقة الصلبة",
                    "تم تجميد البطاقة الصلبة بنجاح",
                  );
                }
                setShowFreezeDialog(false);
              }}
              className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              تجميد البطاقة الصلبة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Change PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-yellow-900/95 to-slate-900/95 backdrop-blur-md border border-yellow-400/30 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Key className="w-6 h-6 text-yellow-400" />
              تغيير الرقم السري
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {pinStep === 1 && "أدخل الرقم السري الحالي"}
              {pinStep === 2 && "أدخل الرقم السري الجديد"}
              {pinStep === 3 && "أكد الرقم السري الجديد"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="text-white font-medium">
                {pinStep === 1 && "الرقم السري الحالي"}
                {pinStep === 2 && "الرقم السري الجديد"}
                {pinStep === 3 && "تأكيد الرقم السري"}
              </Label>
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={
                  pinStep === 1
                    ? currentPin
                    : pinStep === 2
                      ? newPin
                      : confirmPin
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (pinStep === 1) setCurrentPin(value);
                  else if (pinStep === 2) setNewPin(value);
                  else setConfirmPin(value);
                }}
                className="text-center text-2xl tracking-widest bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-16 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>

            {pinStep === 3 &&
              newPin !== confirmPin &&
              confirmPin.length === 4 && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                  <p className="text-red-200 text-sm text-center">
                    الرقم السري غير متطابق
                  </p>
                </div>
              )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowPinDialog(false);
                  setPinStep(1);
                  setCurrentPin("");
                  setNewPin("");
                  setConfirmPin("");
                }}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (pinStep === 1) {
                    if (currentPin.length === 4) {
                      setPinStep(2);
                    }
                  } else if (pinStep === 2) {
                    if (newPin.length === 4) {
                      setPinStep(3);
                    }
                  } else {
                    if (confirmPin === newPin && confirmPin.length === 4) {
                      const notification = createNotification(
                        "success",
                        "تم تغيير الرقم السري",
                        "تم تغيير الرقم السري بنجاح",
                      );
                      showBrowserNotification(
                        "تم تغيير الرقم السري",
                        "تم تغيير الرقم السري بنجاح",
                      );
                      setShowPinDialog(false);
                      setPinStep(1);
                      setCurrentPin("");
                      setNewPin("");
                      setConfirmPin("");
                    }
                  }
                }}
                disabled={
                  (pinStep === 1 && currentPin.length !== 4) ||
                  (pinStep === 2 && newPin.length !== 4) ||
                  (pinStep === 3 &&
                    (confirmPin.length !== 4 || confirmPin !== newPin))
                }
                className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {pinStep === 3 ? "تأكيد" : "التالي"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Spending Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border border-purple-400/30 text-white max-w-md mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              حدود الإنفاق
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              تعديل الحد اليومي للإنفاق
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
              <p className="text-purple-200 text-sm mb-2 text-center">
                الحد الحالي:
              </p>
              <p className="text-2xl font-bold text-white text-center">0 دج</p>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-medium">الحد الجديد (دج)</Label>
              <Input
                type="number"
                placeholder="أدخل الحد الجديد"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="text-center text-lg bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 focus:border-purple-400 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-400 text-center">
                الحد الأدنى: 1,000 دج | الحد الأقصى:{" "}
                {selectedCurrency === "dzd"
                  ? fullBalance.dzd
                  : selectedCurrency === "eur"
                    ? fullBalance.eur
                    : selectedCurrency === "usd"
                      ? fullBalance.usd
                      : fullBalance.gbp}
              </p>
            </div>

            {newLimit &&
              (parseFloat(newLimit) < 1000 ||
                parseFloat(newLimit) > 500000) && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                  <p className="text-red-200 text-sm text-center">
                    الحد يجب أن يكون بين 1,000 و 500,000 دج
                  </p>
                </div>
              )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowLimitDialog(false);
                  setNewLimit("");
                }}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  const limit = parseFloat(newLimit);
                  if (limit >= 1000 && limit <= 500000) {
                    const notification = createNotification(
                      "success",
                      "تم تحديث حدود الإنفاق",
                      `تم تعيين الحد اليومي إلى ${limit.toLocaleString()} دج`,
                    );
                    showBrowserNotification(
                      "تم تحديث حدود الإنفاق",
                      `الحد الجديد: ${limit.toLocaleString()} دج`,
                    );
                    setShowLimitDialog(false);
                    setNewLimit("");
                  }
                }}
                disabled={
                  !newLimit ||
                  parseFloat(newLimit) < 1000 ||
                  parseFloat(newLimit) > 500000
                }
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                تحديث الحد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Charge Card Dialog */}
      <Dialog
        open={showChargeCardDialog}
        onOpenChange={setShowChargeCardDialog}
      >
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-green-900/95 to-slate-900/95 backdrop-blur-md border border-green-400/30 text-white max-w-lg mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Plus className="w-6 h-6 text-green-400" />
              شحن البطاقة {activeCardType === "solid" ? "الصلبة" : "الافتراضية"}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              حول الأموال من حسابك الرئيسي إلى البطاقة
            </DialogDescription>
          </DialogHeader>

          {/* Current Card Balance Display */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-green-400/30">
            <div className="text-center">
              <p className="text-green-200 text-sm mb-1">
                الرصيد الحالي للبطاقة
              </p>
              <p className="text-white text-2xl font-bold">
                {activeCardType === "solid"
                  ? `${solidCardBalance.toLocaleString()} ${getCurrencySymbol(solidCardCurrency)}`
                  : `${virtualCardBalance.toLocaleString()} ${getCurrencySymbol(virtualCardCurrency)}`}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Currency Selection */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                اختر العملة من حسابك الرئيسي
              </Label>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="bg-white/10 border-white/30 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem
                    value="dzd"
                    className="text-white hover:bg-slate-700 py-3"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>دينار جزائري (DZD)</span>
                      <span className="text-green-400 font-bold">
                        {fullBalance.dzd?.toLocaleString() || 0} دج
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="eur"
                    className="text-white hover:bg-slate-700 py-3"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>يورو (EUR)</span>
                      <span className="text-green-400 font-bold">
                        €{fullBalance.eur?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="usd"
                    className="text-white hover:bg-slate-700 py-3"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>دولار أمريكي (USD)</span>
                      <span className="text-green-400 font-bold">
                        ${fullBalance.usd?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="gbp"
                    className="text-white hover:bg-slate-700 py-3"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>جنيه إسترليني (GBP)</span>
                      <span className="text-green-400 font-bold">
                        £{fullBalance.gbp?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                المبلغ المراد تحويله
              </Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="text-center text-xl bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-14 focus:border-green-400 focus:ring-green-400"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>
                  الحد الأدنى: 10 {getCurrencySymbol(selectedCurrency)}
                </span>
                <span>
                  المتاح:{" "}
                  {selectedCurrency === "dzd"
                    ? fullBalance.dzd?.toLocaleString()
                    : selectedCurrency === "eur"
                      ? fullBalance.eur?.toFixed(2)
                      : selectedCurrency === "usd"
                        ? fullBalance.usd?.toFixed(2)
                        : fullBalance.gbp?.toFixed(2)}{" "}
                  {getCurrencySymbol(selectedCurrency)}
                </span>
              </div>
            </div>

            {/* Transfer Preview */}
            {chargeAmount && parseFloat(chargeAmount) > 0 && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-blue-200 text-sm mb-2">معاينة التحويل</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <p className="text-white/80 text-xs">من الحساب الرئيسي</p>
                      <p className="text-white font-bold">
                        -{chargeAmount} {getCurrencySymbol(selectedCurrency)}
                      </p>
                    </div>
                    <div className="text-blue-400">→</div>
                    <div className="text-center">
                      <p className="text-white/80 text-xs">
                        إلى البطاقة{" "}
                        {activeCardType === "solid" ? "الصلبة" : "الافتراضية"}
                      </p>
                      <p className="text-green-400 font-bold">
                        +{chargeAmount} {getCurrencySymbol(selectedCurrency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setShowChargeCardDialog(false);
                  setChargeAmount("");
                  setSelectedCurrency("dzd");
                }}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                إلغاء
              </Button>
              <Button
                onClick={async () => {
                  const amount = parseFloat(chargeAmount);
                  const availableBalance =
                    selectedCurrency === "dzd"
                      ? fullBalance.dzd
                      : selectedCurrency === "eur"
                        ? fullBalance.eur
                        : selectedCurrency === "usd"
                          ? fullBalance.usd
                          : fullBalance.gbp;

                  if (amount > 0 && amount <= availableBalance) {
                    // Update the selected currency balance in main account
                    const newBalance = { ...fullBalance };
                    if (selectedCurrency === "dzd") {
                      newBalance.dzd = fullBalance.dzd - amount;
                    } else if (selectedCurrency === "eur") {
                      newBalance.eur = fullBalance.eur - amount;
                    } else if (selectedCurrency === "usd") {
                      newBalance.usd = fullBalance.usd - amount;
                    } else {
                      newBalance.gbp = fullBalance.gbp - amount;
                    }

                    // Update balance in database
                    await updateBalance(newBalance);

                    // Add to card balance in the selected currency
                    if (activeCardType === "solid") {
                      setSolidCardBalance((prev) => prev + amount);
                      setSolidCardCurrency(selectedCurrency);
                    } else {
                      setVirtualCardBalance((prev) => prev + amount);
                      setVirtualCardCurrency(selectedCurrency);
                    }

                    // Create notification
                    const notification = createNotification(
                      "success",
                      "تم شحن البطاقة بنجاح",
                      `تم تحويل ${amount.toLocaleString()} ${getCurrencySymbol(selectedCurrency)} إلى البطاقة ${activeCardType === "solid" ? "الصلبة" : "الافتراضية"}`,
                    );
                    showBrowserNotification(
                      "تم شحن البطاقة بنجاح",
                      `تم تحويل ${amount.toLocaleString()} ${getCurrencySymbol(selectedCurrency)} إلى البطاقة`,
                    );

                    setShowChargeCardDialog(false);
                    setChargeAmount("");
                    setSelectedCurrency("dzd");

                    // Show verification message if account is not verified
                    if (!isAccountVerified) {
                      setTimeout(() => {
                        const verificationNotification = createNotification(
                          "info",
                          "توثيق الحساب مطلوب",
                          "يجب توثيق الحساب كي تتمكن من استخدام بطاقاتك",
                        );
                        showBrowserNotification(
                          "توثيق الحساب مطلوب",
                          "يجب توثيق الحساب كي تتمكن من استخدام بطاقاتك",
                        );
                      }, 1500);
                    }
                  }
                }}
                disabled={
                  !chargeAmount ||
                  parseFloat(chargeAmount) <= 0 ||
                  parseFloat(chargeAmount) >
                    (selectedCurrency === "dzd"
                      ? fullBalance.dzd
                      : selectedCurrency === "eur"
                        ? fullBalance.eur
                        : selectedCurrency === "usd"
                          ? fullBalance.usd
                          : fullBalance.gbp)
                }
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold"
              >
                تأكيد الشحن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CardTab;

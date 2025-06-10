import { useState, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Plus,
  CreditCard,
  Building2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Banknote,
  ArrowLeft,
  DollarSign,
  Shield,
  X,
  Wallet,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  createNotification,
  showBrowserNotification,
  type Notification,
} from "../utils/notifications";

interface RechargeTabProps {
  balance: {
    dzd: number;
    eur: number;
    usd: number;
    gbt: number;
  };
  onRecharge: (amount: number, method: string, rib: string) => void;
  onNotification: (notification: Notification) => void;
}

function RechargeTab({
  balance,
  onRecharge,
  onNotification,
}: RechargeTabProps) {
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [senderRib, setSenderRib] = useState("");
  const [amountError, setAmountError] = useState("");
  const [ribError, setRibError] = useState("");

  const validateAmount = () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      setAmountError("يرجى إدخال مبلغ صحيح");
      return false;
    }
    if (parseFloat(rechargeAmount) < 1000) {
      setAmountError("الحد الأدنى: 1000 دج");
      return false;
    }
    setAmountError("");
    return true;
  };

  const validateRib = () => {
    if (!senderRib.trim()) {
      setRibError("يرجى إدخال رقم RIB");
      return false;
    }
    if (senderRib.length < 10) {
      setRibError("رقم RIB غير صحيح");
      return false;
    }
    setRibError("");
    return true;
  };

  const handleAmountSubmit = () => {
    if (validateAmount()) {
      setCurrentStep(2);
    }
  };

  const handlePaymentMethodSelect = () => {
    setCurrentStep(3);
  };

  const handleFinalConfirm = useCallback(() => {
    if (validateRib()) {
      const amount = parseFloat(rechargeAmount);
      onRecharge(amount, "bank", senderRib);

      const notification = createNotification(
        "success",
        "تم إرسال طلب الشحن",
        `سيتم إضافة ${amount.toLocaleString()} دج خلال دقائق`,
      );
      onNotification(notification);
      showBrowserNotification(
        "تم إرسال طلب الشحن",
        `سيتم إضافة ${amount.toLocaleString()} دج خلال دقائق`,
      );

      // Reset dialog
      setShowRechargeDialog(false);
      setCurrentStep(1);
      setRechargeAmount("");
      setSenderRib("");
      setAmountError("");
      setRibError("");
    }
  }, [rechargeAmount, senderRib, onRecharge, onNotification, validateRib]);

  const resetDialog = () => {
    setShowRechargeDialog(false);
    setCurrentStep(1);
    setRechargeAmount("");
    setSenderRib("");
    setAmountError("");
    setRibError("");
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">أدخل المبلغ</h3>
              <p className="text-gray-300 text-sm">المبلغ بالدينار الجزائري</p>
            </div>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="أدخل المبلغ (الحد الأدنى: 1000 دج)"
                value={rechargeAmount}
                onChange={(e) => {
                  setRechargeAmount(e.target.value);
                  if (amountError) setAmountError("");
                }}
                className={`text-center text-lg bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 ${
                  amountError ? "border-red-400" : "focus:border-green-400"
                }`}
              />
              {amountError && (
                <p className="text-red-400 text-sm text-center">
                  {amountError}
                </p>
              )}
            </div>
            <Button
              onClick={handleAmountSubmit}
              disabled={!rechargeAmount || parseFloat(rechargeAmount) < 1000}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              التالي
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                إرسال المبلغ
              </h3>
            </div>
            <Card className="bg-blue-500/20 border border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">N</span>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm font-medium">
                      NETLIFY BANK
                    </p>
                  </div>
                </div>
                <p className="text-white text-sm mb-3">
                  أرسل المبلغ من بريدي موب إلى
                </p>

                <div className="flex items-center space-x-2 space-x-reverse text-yellow-300 text-xs mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>انقر على الرقم لنسخه</span>
                </div>

                <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                  <p className="text-orange-200 text-sm font-medium">
                    المبلغ: {parseFloat(rechargeAmount).toLocaleString()} دج
                  </p>
                </div>

                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mt-3">
                  <div className="flex items-center space-x-2 space-x-reverse text-blue-200 text-xs">
                    <Info className="w-4 h-4" />
                    <span>
                      بعد إرسال المبلغ اضغط على "التالي" وأدخل رقم حسابك للتأكيد
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                السابق
              </Button>
              <Button
                onClick={handlePaymentMethodSelect}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                التالي
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                تأكيد الحساب
              </h3>
              <p className="text-gray-300 text-sm">
                رقم الحساب البنكي الخاص بك (RIB)
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="أدخل رقم RIB الخاص بك"
                value={senderRib}
                onChange={(e) => {
                  setSenderRib(e.target.value);
                  if (ribError) setRibError("");
                }}
                className={`text-center bg-white/10 border-white/30 text-white placeholder:text-gray-400 h-12 ${
                  ribError ? "border-red-400" : "focus:border-green-400"
                }`}
              />
              {ribError && (
                <p className="text-red-400 text-sm text-center">{ribError}</p>
              )}

              <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                <p className="text-orange-200 text-sm font-medium text-center">
                  المبلغ: {parseFloat(rechargeAmount).toLocaleString()} دج
                </p>
              </div>

              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 space-x-reverse text-blue-200 text-xs">
                  <Info className="w-4 h-4" />
                  <span>
                    سيتم التحقق من العملية وإضافة المبلغ إلى محفظتك خلال دقائق
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={goToPreviousStep}
                variant="outline"
                className="flex-1 h-12 bg-gray-600/50 border-gray-500/50 text-white hover:bg-gray-500/60"
              >
                السابق
              </Button>
              <Button
                onClick={handleFinalConfirm}
                disabled={!senderRib.trim()}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                تأكيد الشحن
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 bg-transparent px-2 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {" "}
          شحن المحفظة
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          اختر طريقة الشحن المناسبة لك
        </p>
      </div>
      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-md shadow-xl border border-indigo-400/30 text-white">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <p className="text-indigo-200 text-sm mb-2">رصيدك الحالي</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {balance.dzd.toLocaleString()} دج
          </p>
          <p className="text-gray-300 text-sm mt-2">≈ €{balance.eur}</p>
        </CardContent>
      </Card>
      {/* Quick Recharge Button */}
      <div className="space-y-3">
        <Button
          onClick={() => setShowRechargeDialog(true)}
          className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-lg"
        >
          <Plus className="w-6 h-6 ml-2" />
          شحن المحفظة
        </Button>
      </div>
      {/* Instructions */}
      {/* Recharge Dialog */}
      <Dialog open={showRechargeDialog} onOpenChange={resetDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border border-white/20 text-white max-w-md mx-auto">
          <DialogHeader className="text-center relative">
            <Button
              onClick={resetDialog}
              variant="ghost"
              size="sm"
              className="absolute left-0 top-0 text-white/60 hover:text-white hover:bg-white/10 p-1"
            >
              <X className="w-5 h-5" />
            </Button>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Banknote className="w-6 h-6 text-green-400" />
              شحن المحفظة
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              الخطوة {currentStep} من 3
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">{renderStepContent()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RechargeTab;

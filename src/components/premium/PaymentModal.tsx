import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Star, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  paymentMethods, 
  processPayment, 
  PaymentData,
  PaymentPlan 
} from "@/services/paymentService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PaymentPlan;
  onPaymentSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, plan, onPaymentSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("flutterwave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!paymentData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(paymentData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!paymentData.name) {
      newErrors.name = "Name is required";
    }

    // Card validation for card-based payment methods
    if (['flutterwave', 'paystack', 'stripe'].includes(selectedMethod)) {
      if (!paymentData.cardNumber) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{13,19}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = "Please enter a valid card number";
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }

      if (!paymentData.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentRequest: PaymentData = {
        email: paymentData.email,
        phone: paymentData.phone,
        name: paymentData.name,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        paymentMethodId: selectedMethod,
        planId: plan.id
      };

      const result = await processPayment(paymentRequest);

      if (result.success) {
        if (result.redirectUrl) {
          // Redirect to payment provider
          window.location.href = result.redirectUrl;
        } else {
          // Payment completed (e.g., M-Pesa STK push)
          toast({
            title: "Payment Initiated",
            description: result.message
          });
          
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          onClose();
        }
      } else {
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Upgrade to SereniTree Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="p-4 bg-gradient-to-r from-[hsl(var(--wellness-primary)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[hsl(var(--wellness-primary))]">
                  {plan.price}
                </div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-4">Choose Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Card
                  key={`payment-method-${method.id}`}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-[hsl(var(--wellness-primary))] bg-[hsl(var(--wellness-primary)/0.05)]'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{method.logo}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {method.supported.map((support) => (
                          <Badge key={`support-${method.id}-${support}`} variant="secondary" className="text-xs">
                            {support}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-[hsl(var(--wellness-primary))] mr-2" />
              <h3 className="font-semibold">Payment Details</h3>
              <Badge className="ml-auto bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                SSL Secured
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={paymentData.email}
                        onChange={handleInputChange}
                        required
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+254 700 000 000"
                        value={paymentData.phone}
                        onChange={handleInputChange}
                        required
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
              </div>

              {(selectedMethod === "flutterwave" || selectedMethod === "paystack" || selectedMethod === "stripe") && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Card Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={paymentData.name}
                        onChange={handleInputChange}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        className={errors.cardNumber ? "border-red-500" : ""}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={handleInputChange}
                          className={errors.expiryDate ? "border-red-500" : ""}
                        />
                        {errors.expiryDate && (
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={handleInputChange}
                          className={errors.cvv ? "border-red-500" : ""}
                        />
                        {errors.cvv && (
                          <p className="text-sm text-red-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === "mpesa" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">M-Pesa Information</h4>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You will receive an STK push notification on your phone to complete the payment.
                        Make sure your phone number is correct and has sufficient M-Pesa balance.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedMethod === "airtel-money" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">Airtel Money</h4>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        Airtel Money integration is coming soon. Please use another payment method.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${plan.price} with ${selectedPaymentMethod?.name}`
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-1" />
            Your payment information is encrypted and secure. We don't store your card details.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // If there's no tracking ID, it means the user cancelled or accessed the URL directly
    if (!orderTrackingId) {
      setStatus("error");
      setTimeout(() => {
        window.parent.postMessage({ type: "PESAPAL_PAYMENT_CANCELLED" }, "*");
      }, 3000);
      return;
    }

    // Since this loads inside the iframe, the parent window is waiting to hear if we succeeded
    // Pesapal will hit our backend webhook which actually confirms the order,
    // so here we just assume success based on the redirect and tell the parent window to close the modal.
    setStatus("success");
    
    const timer = setTimeout(() => {
      window.parent.postMessage({ 
        type: "PESAPAL_PAYMENT_COMPLETE", 
        orderTrackingId,
        orderMerchantReference
      }, "*");
    }, 2000);

    return () => clearTimeout(timer);
  }, [orderTrackingId, orderMerchantReference]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-gold-accent mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
        <p className="text-gray-500 mt-2">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Cancelled</h2>
        <p className="text-gray-500 mt-2">You will be redirected back to your cart.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-green-50">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold text-green-800">Payment Successful!</h2>
      <p className="text-green-600 mt-2">Thank you for your purchase.</p>
      <p className="text-sm text-green-500 mt-4 opacity-75">Redirecting you to the dashboard...</p>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-gray-400" />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}

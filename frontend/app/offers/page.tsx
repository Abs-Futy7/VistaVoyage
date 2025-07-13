"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Copy,
  TimerReset,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { promoCodeService, PromoCode } from "@/lib/api/services/promocode";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";


function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        setLoading(true);
        setError(null);
        const promoRes = await promoCodeService.getPromoCodes();
        setPromoCodes(promoRes.promo_codes || []);
      } catch (e: any) {
        setError("Failed to load promo codes.");
        toast.error("Failed to load promo codes", { description: e?.message });
      } finally {
        setLoading(false);
      }
    };
    fetchPromoCodes();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        <p className="mt-2 text-gray-600">Loading promo codes...</p>
      </div>
    );
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-headline font-bold text-gray-800">
              <Tag className="inline-block mr-2" /> Current Promo Codes
            </h2>
            <p className="text-gray-600">
              Use these codes at checkout for extra savings
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCodes.length === 0 && <div className="col-span-3 text-center text-gray-500">No promo codes available.</div>}
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-lg border border-yellow-200 overflow-hidden shadow-md"
              >
                <div className="p-4 border-b border-yellow-100 bg-yellow-50 flex justify-between items-center">
                  <span className="font-mono font-bold text-xl text-yellow-800">
                    {promo.code}
                  </span>
                  <button
                    className={cn(
                      "px-3 py-1 h-auto",
                      copiedCode === promo.code && "bg-green-100 text-green-700"
                    )}
                    onClick={() => copyToClipboard(promo.code)}
                  >
                    {copiedCode === promo.code ? (
                      <>Copied! ✓</>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-1">
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}% off`
                      : `$${promo.discount_value} off`}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Expires:</span>{" "}
                    {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString() : "-"}
                  </p>
                  {promo.description && (
                    <p className="text-xs text-gray-500 mt-1">{promo.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


export default function PromoCodesPageWithAuth() {
  return (
    <ProtectedRoute message="You need to login to view exclusive promo codes">
      <PromoCodesPage />
    </ProtectedRoute>
  );
}

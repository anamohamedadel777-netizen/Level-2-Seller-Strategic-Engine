import React from 'react';
import { ShieldCheck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

interface BrandHeaderProps {
  onReset: () => void;
  onOpenStressTests: () => void;
  hasBlueprint: boolean;
  onPrint?: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onReset,
  onOpenStressTests,
  hasBlueprint,
  onPrint,
}) => {
  return (
    <header className="border-b border-[#4A2F15]/40 bg-[#040405]/95 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5BF1E] to-[#A7690C] flex items-center justify-center shadow-[0_0_15px_rgba(245,191,30,0.2)]">
            <span className="text-[#040405] font-black text-lg tracking-wider font-['Cairo']">MA</span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#C8C5BA]">
              <span className="font-semibold text-[#FCFCFA]">Mohamed Adel</span>
              <span className="text-[#797979]">·</span>
              <span className="text-[#FBD052]">Sales Funnel Architect</span>
            </div>
            <h1 className="text-sm font-bold text-[#FCFCFA] flex items-center gap-1.5">
              <span>مختبر هندسة العرض</span>
              <span className="text-[10px] text-[#A7690C] font-mono tracking-wide">| Level 2 — Seller</span>
            </h1>
          </div>
        </div>

        {/* Strategic ecosystem trail (unboxed text, zero-pill discipline) */}
        <nav aria-label="مسار النظام البيئي" className="hidden lg:flex items-center gap-1.5 text-xs text-[#797979]">
          <span>الخبرة</span>
          <span>←</span>
          <span>المنتج الرقمي</span>
          <span>←</span>
          <span className="text-[#F5BF1E] font-medium">العرض (أنت هنا)</span>
          <span>←</span>
          <span>الفانل</span>
          <span>←</span>
          <span>نظام البيع</span>
          <span>←</span>
          <span>النمو والتوسع</span>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasBlueprint && onPrint && (
            <button
              onClick={onPrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FCFCFA] bg-[#23170D] border border-[#4A2F15] rounded hover:border-[#F5BF1E] transition-colors"
              title="طباعة التقرير الاستراتيجي أو حفظه كـ PDF"
            >
              <FileText className="w-3.5 h-3.5 text-[#F5BF1E]" />
              <span>حفظ / طباعة PDF</span>
            </button>
          )}

          <button
            onClick={onOpenStressTests}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#C8C5BA] bg-[#23170D]/70 border border-[#4A2F15]/60 rounded hover:text-[#FCFCFA] hover:border-[#FBD052]/60 transition-colors"
            title="فحص واختبار سيناريوهات الضغط (Stress Tests A-H)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FBD052]" />
            <span className="hidden sm:inline">فحوصات الجودة</span>
            <span className="sm:hidden">الفحوصات</span>
          </button>

          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#797979] hover:text-[#C8C5BA] hover:bg-[#23170D]/50 rounded transition-colors"
            title="مسح بياناتي المحفوظة محلياً والبدء من جديد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مسح بياناتي من الجهاز</span>
          </button>
        </div>
      </div>
    </header>
  );
};

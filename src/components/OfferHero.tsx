import React from 'react';
import { ArrowLeft, Target, ShieldAlert, Layers, CalendarCheck2 } from 'lucide-react';

interface OfferHeroProps {
  onStart: () => void;
  hasSavedDraft?: boolean;
  onResumeDraft?: () => void;
}

export const OfferHero: React.FC<OfferHeroProps> = ({
  onStart,
  hasSavedDraft,
  onResumeDraft,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#4A2F15]/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#F5BF1E]/5 via-[#4A2F15]/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Discrete badge & author */}
        <div className="inline-flex items-center gap-2 mb-6 text-xs text-[#C8C5BA]">
          <span className="text-[#FBD052] font-medium">مجانًا من Mohamed Adel</span>
          <span className="text-[#797979]">·</span>
          <span>Level 2 — Seller Strategic Engine</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FCFCFA] leading-tight tracking-tight mb-6 font-['Cairo']">
          اعرف المشكلة في عرضك قبل ما تغيّر السعر أو تزود الإعلانات
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#C8C5BA] leading-relaxed mb-8">
          حلّل عرضك من زاوية العميل والقيمة والثقة والاعتراضات والتسعير، واعرف إيه اللي محتاج يتغير فعلًا وإيه اللي لازم تسيبه زي ما هو.
        </p>

        {/* Draft resume alert if draft exists */}
        {hasSavedDraft && onResumeDraft && (
          <div className="mb-6 max-w-lg mx-auto bg-[#23170D] border border-[#F5BF1E]/40 p-3.5 rounded-lg text-right flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#FBD052] font-semibold">عندك تحليل عرض غير مكتمل محفوظ محلياً</p>
              <p className="text-[11px] text-[#C8C5BA]">تحب تكمل من آخر نقطة وقفت عندها؟</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onResumeDraft}
                className="px-3 py-1.5 text-xs font-semibold text-[#040405] bg-[#F5BF1E] rounded hover:bg-[#FBD052] transition-colors"
              >
                كمّل من حيث وقفت
              </button>
            </div>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-[#040405] bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] hover:from-[#FBD052] hover:to-[#F5BF1E] rounded-md shadow-[0_4px_25px_rgba(245,191,30,0.25)] transition-all flex items-center justify-center gap-2.5 cursor-pointer font-['Cairo']"
          >
            <span>ابدأ تشخيص عرضك</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Supporting Note */}
        <p className="text-xs text-[#797979] max-w-md mx-auto mb-14 leading-normal">
          الأداة مش هتحاول تقنعك إن عرضك ممتاز.
          <br />
          الهدف إنك تعرف فين نقطة الضعف الحقيقية قبل ما تغيّر حاجات عشوائيًا.
        </p>

        {/* 4 Compact Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
          <div className="p-4 bg-[#23170D]/60 border border-[#4A2F15]/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-[#F5BF1E]">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#C8C5BA]">قوة العرض</span>
            </div>
            <h3 className="text-sm font-bold text-[#FCFCFA] mb-1">Offer Strength Score</h3>
            <p className="text-xs text-[#797979] leading-relaxed">
              تقييم رقمي موضوعي (0-100) عبر 10 أبعاد حاسمة لقرار الشراء، مفصول تماماً عن التقييم الإنشائي.
            </p>
          </div>

          <div className="p-4 bg-[#23170D]/60 border border-[#4A2F15]/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-[#F5BF1E]">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#C8C5BA]">عنق الزجاجة الأساسي</span>
            </div>
            <h3 className="text-sm font-bold text-[#FCFCFA] mb-1">Primary Bottleneck</h3>
            <p className="text-xs text-[#797979] leading-relaxed">
              تحديد الخلل الدقيق: هل هو في وضوح الوعد؟ في الأدلة؟ في تعقيد القرار؟ أم في نوعية الزيارات؟
            </p>
          </div>

          <div className="p-4 bg-[#23170D]/60 border border-[#4A2F15]/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-[#F5BF1E]">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#C8C5BA]">هندسة العرض</span>
            </div>
            <h3 className="text-sm font-bold text-[#FCFCFA] mb-1">Offer Architecture</h3>
            <p className="text-xs text-[#797979] leading-relaxed">
              إعادة بناء الهيكل: ما الذي يجب حذفه من العرض فوراً؟ وكيف تصاغ الآلية والتموضع دون مبالغة؟
            </p>
          </div>

          <div className="p-4 bg-[#23170D]/60 border border-[#4A2F15]/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-[#F5BF1E]">
              <CalendarCheck2 className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#C8C5BA]">خطة الاختبار</span>
            </div>
            <h3 className="text-sm font-bold text-[#FCFCFA] mb-1">Validation Plan</h3>
            <p className="text-xs text-[#797979] leading-relaxed">
              خطة عمل 7 أيام مبنية على نضج عرضك الفعلي، مع تجربة واحدة رئيسية لحسم القرار دون إهدار إعلانات.
            </p>
          </div>
        </div>

        {/* Brand philosophy statement */}
        <div className="mt-14 pt-8 border-t border-[#4A2F15]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#797979]">
          <p className="text-right">
            فلسفة العمل: <span className="text-[#C8C5BA]">"أنا مش بصمم صفحة وخلاص، أنا بهندس رحلة بيع كاملة."</span>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>فصل المشكلة: منتج · عرض · ثقة · ترافيك</span>
            <span>·</span>
            <span>فحص الأدلة الصارمة</span>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  FullOfferBlueprint,
  LeadCaptureData,
} from '../types';

const STRATEGIC_DECISION_MAP: Record<string, { label: string; desc: string; color: string }> = {
  KEEP_AND_VALIDATE: {
    label: 'حافظ على العرض واختبره',
    desc: 'لا تجرِ تعديلات جذرية، بل ابدأ فوراً باختبار استعداد السوق للدفع.',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
  },
  REFINE_BEFORE_SELLING: {
    label: 'عدّل العرض قبل البيع',
    desc: 'حدد المشكلة والشريحة بدقة أكبر لتفادي إطلاق حل لمشكلة غير ملحة.',
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
  },
  TEST_BEFORE_REBUILDING: {
    label: 'اختبر العائق قبل إعادة البناء',
    desc: 'قم بتشغيل تجربة واحدة موجهة لاختبار العائق الأساسي قبل أي تغيير واسع.',
    color: 'text-[#FBD052] border-[#F5BF1E]/40 bg-[#23170D]/40',
  },
  SIMPLIFY_OFFER: {
    label: 'بسّط العرض واحذف الحشو',
    desc: 'قلل عبء التنفيذ واحذف المكونات الزائدة للتركيز على النتيجة المباشرة.',
    color: 'text-rose-400 border-rose-500/40 bg-rose-950/30',
  },
  STRENGTHEN_PROOF: {
    label: 'ركّز على تقوية الإثبات',
    desc: 'الأولوية القصوى لتوثيق دراسة حالة أو نتيجة ملموسة بالأرقام بدلاً من الإنشائيات.',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
  },
  FIX_TRAFFIC_FIRST: {
    label: 'أصلح جودة الزيارات أولاً',
    desc: 'العرض متماسك، ولا أنصح بإعادة بنائه بالكامل قبل اختباره على جمهور مؤهل يبحث عن الحل.',
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
  },
  OPTIMIZE_CONVERSION: {
    label: 'ركّز على تحسين التحويل',
    desc: 'العرض يولد مبيعات، ولكن هناك نقاط تسرب في اقتصاديات الوحدة وهوامش الربح.',
    color: 'text-blue-400 border-blue-500/40 bg-blue-950/30',
  },
  READY_FOR_FUNNEL_ARCHITECTURE: {
    label: 'العرض جاهز لهندسة الفانل',
    desc: 'العرض مثبت تجارياً وجاهز لبناء فانل متكامل وتوسيع قنوات الاستحواذ بثقة.',
    color: 'text-emerald-300 border-emerald-400/50 bg-emerald-950/50',
  },
};

const FUNNEL_READINESS_MAP: Record<string, { label: string; color: string }> = {
  NOT_READY: { label: 'غير جاهز بعد', color: 'text-[#797979] bg-stone-900 border-stone-700' },
  VALIDATION_FIRST: { label: 'يحتاج تحقق قبل بناء الفانل', color: 'text-amber-400 bg-amber-950/40 border-amber-600/40' },
  OFFER_READY: { label: 'العرض جاهز لبناء فانل', color: 'text-[#F5BF1E] bg-[#23170D] border-[#F5BF1E]/50' },
  OPTIMIZATION_READY: { label: 'جاهز للتحسين والتوسع', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50' },
};

const POSITIONING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  VALIDATED_DIRECTION: { label: 'اتجاه تموضع مدعوم بأدلة', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' },
  STRATEGIC_DIRECTION: { label: 'اتجاه استراتيجي واعد', color: 'text-[#FBD052] bg-[#23170D] border-[#F5BF1E]/40' },
  PROVISIONAL_HYPOTHESIS: { label: 'فرضية تموضع تحتاج اختبار', color: 'text-amber-400 bg-amber-950/40 border-amber-500/40' },
  INSUFFICIENT_EVIDENCE: { label: 'الأدلة غير كافية لاعتماد التموضع', color: 'text-rose-400 bg-rose-950/40 border-rose-500/40' },
};

const VALUE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  SUPPORTED: { label: 'مدعوم بأدلة', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40' },
  PARTIALLY_SUPPORTED: { label: 'مدعوم جزئيًا', color: 'text-[#FBD052] bg-[#23170D] border-[#F5BF1E]/40' },
  HYPOTHESIS: { label: 'فرضية قيمة تحتاج اختبار', color: 'text-amber-400 bg-amber-950/40 border-amber-500/40' },
  INSUFFICIENT_EVIDENCE: { label: 'الأدلة غير كافية', color: 'text-rose-400 bg-rose-950/40 border-rose-500/40' },
};

const DIFFERENTIATION_EVIDENCE_MAP: Record<string, string> = {
  SELLER_BELIEF: 'اعتقاد من البائع — غير متحقق من المشتري',
  BUYER_MENTIONED_DIFFERENCE: 'المشتري لاحظ الفرق',
  BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE: 'الفرق أثّر في قرار الاختيار',
  WIN_LOSS_EVIDENCE: 'مدعوم بقرارات شراء/رفض فعلية',
  REPEATABLE_COMMERCIAL_EVIDENCE: 'مدعوم بأدلة تجارية متكررة',
};

const OBJECTION_EVIDENCE_MAP: Record<string, string> = {
  NO_BUYER_CONVERSATIONS: 'قبل إجراء محادثات مع مشترين',
  ASSUMED_OBJECTIONS_ONLY: 'اعتراضات مفترضة بالحدس فقط',
  SPORADIC_FEEDBACK: 'ملاحظات متفرقة من مشترين',
  REPEATED_ACTUAL_OBJECTIONS: 'اعتراضات متكررة في محادثات حية',
};
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Shield,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface ReportDashboardProps {
  blueprint: FullOfferBlueprint;
  isUnlocked: boolean;
  onUnlock: (lead: LeadCaptureData) => Promise<void>;
  onPrint: () => void;
  onBackToEdit: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  blueprint,
  isUnlocked,
  onUnlock,
  onPrint,
  onBackToEdit,
}) => {
  const { deterministic, aiInterpretation, questionnaire } = blueprint;

  // Lead capture state
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Expandable sections
  const [showAllDimensions, setShowAllDimensions] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setLeadError('يرجى إدخال بريد إلكتروني صحيح لفتح المخطط الكامل.');
      return;
    }

    setIsSubmittingLead(true);
    setLeadError('');

    try {
      await onUnlock({
        firstName,
        email,
        marketingConsent,
        offerStrengthScore: deterministic.offerStrengthScore,
        confidenceScore: deterministic.confidenceScore,
        primaryBottleneck: deterministic.primaryBottleneckNameArabic,
        productType: questionnaire.productType,
        offerStage: deterministic.offerStage,
        recommendedCTA: aiInterpretation.ctaDirection.recommendedCTAArabic,
        pageUrl: window.location.href,
      });
    } catch {
      setLeadError('حدث خطأ أثناء فتح التقرير، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#4A2F15]/30">
        <div>
          <span className="text-xs text-[#F5BF1E] font-medium">Mohamed Adel · Offer Architecture Lab</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FCFCFA] font-['Cairo']">
            تقرير تشخيص وهندسة العرض: {questionnaire.productName || 'العرض التجاري'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToEdit}
            type="button"
            className="px-3 py-1.5 text-xs text-[#C8C5BA] bg-[#23170D] border border-[#4A2F15] rounded hover:border-[#797979] transition-colors"
          >
            تعديل الإجابات
          </button>
          {isUnlocked && (
            <button
              onClick={onPrint}
              type="button"
              className="px-3.5 py-1.5 text-xs font-semibold text-[#040405] bg-[#F5BF1E] hover:bg-[#FBD052] rounded transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TOP RESULT SCREEN: GAUGES & PRIMARY BOTTLENECK */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Offer Strength Score */}
        <div className="p-6 bg-[#23170D]/80 border border-[#F5BF1E]/40 rounded-xl flex flex-col justify-between text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5BF1E]/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2">
              <span className="font-semibold">درجة قوة العرض</span>
              <span className="text-[11px] font-mono text-[#F5BF1E]">0 - 100</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-[#FCFCFA] font-['Cairo'] tracking-tight">
                {deterministic.offerStrengthScore}
              </span>
              <span className="text-sm text-[#797979]">/ 100</span>
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              {deterministic.offerDiagnosisSummaryArabic}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4A2F15]/40 text-[11px] text-[#797979]">
            حساب رقمي حتمي عبر 10 أبعاد لقرار الشراء.
          </div>
        </div>

        {/* Confidence Score (Strictly Independent!) */}
        <div className="p-6 bg-[#23170D]/50 border border-[#4A2F15]/50 rounded-xl flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2">
              <span className="font-semibold">درجة الثقة في التشخيص</span>
              <span
                className={`text-[11px] font-bold ${
                  deterministic.confidenceRating === 'HIGH'
                    ? 'text-emerald-400'
                    : deterministic.confidenceRating === 'MODERATE'
                    ? 'text-[#FBD052]'
                    : 'text-amber-400'
                }`}
              >
                {deterministic.confidenceRating === 'HIGH' && 'ثقة عالية (High)'}
                {deterministic.confidenceRating === 'MODERATE' && 'ثقة متوسطة (Moderate)'}
                {deterministic.confidenceRating === 'LOW' && 'ثقة منخفضة (Low)'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-[#FCFCFA] font-['Cairo'] tracking-tight">
                {deterministic.confidenceScore}
              </span>
              <span className="text-sm text-[#797979]">/ 100</span>
            </div>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              {deterministic.confidenceReasoningArabic}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4A2F15]/40 text-[11px] text-[#797979]">
            {deterministic.offerStrengthScore >= 65 && deterministic.confidenceScore < 50 ? (
              <span className="text-[#FBD052]">
                تنبيه: العرض شكله قوي استراتيجياً، لكن الأدلة الحالية مش كفاية للحكم بثقة.
              </span>
            ) : (
              'تعتمد الثقة على الأدلة السلوكية وعمليات الدفع وليس على بلاغة الكلام.'
            )}
          </div>
        </div>

        {/* Primary Bottleneck Card */}
        <div className="p-6 bg-[#23170D]/60 border border-[#4A2F15]/60 rounded-xl flex flex-col justify-between text-right">
          <div>
            <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2">
              <span className="font-semibold text-rose-300">عنق الزجاجة الأساسي</span>
              <span className="text-[11px] font-mono text-rose-400">
                {deterministic.primaryBottleneckSeverity === 'CRITICAL' && 'حرج جداً'}
                {deterministic.primaryBottleneckSeverity === 'HIGH' && 'مرتفع'}
                {deterministic.primaryBottleneckSeverity === 'MODERATE' && 'متوسط'}
                {deterministic.primaryBottleneckSeverity === 'LOW' && 'بسيط'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#FCFCFA] mb-2 font-['Cairo']">
              {deterministic.primaryBottleneckNameArabic}
            </h3>
            <p className="text-xs text-[#C8C5BA] leading-relaxed">
              {aiInterpretation.primaryBottleneckExplanationArabic}
            </p>
          </div>
          {deterministic.secondaryBottleneckNameArabic && (
            <div className="mt-4 pt-3 border-t border-[#4A2F15]/40 text-[11px] text-[#797979]">
              عنق الزجاجة الثانوي: <span className="text-[#C8C5BA]">{deterministic.secondaryBottleneckNameArabic}</span>
            </div>
          )}
        </div>
      </div>

      {/* Consistency Flags Banner (if repaired) */}
      {deterministic.consistencyFlags.length > 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-600/40 rounded-lg text-right space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Shield className="w-4 h-4" />
            <span>نظام التدقيق الاستراتيجي (Consistency Guard)</span>
          </div>
          {deterministic.consistencyFlags.map((flag, idx) => (
            <p key={idx} className="text-xs text-amber-200/90 leading-relaxed">
              · {flag}
            </p>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. EXECUTIVE DIAGNOSIS (تشخيص العرض في 60 ثانية) */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl space-y-6 text-right">
        <div className="border-b border-[#4A2F15]/40 pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs text-[#F5BF1E] font-medium">Executive Diagnosis</span>
            <h3 className="text-xl font-extrabold text-[#FCFCFA] font-['Cairo']">
              تشخيص العرض في 60 ثانية
            </h3>
          </div>
          <span className="text-xs text-[#797979]">خلاصة قرار استشاري سريع</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>أقوى حاجة في العرض حالياً:</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
              {aiInterpretation.executiveDiagnosis.strongestAssetArabic}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>أكبر نقطة ضعف تعطّل الشراء:</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
              {aiInterpretation.executiveDiagnosis.biggestWeaknessArabic}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#FBD052] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>أكتر حاجة الناس ممكن تفهمها غلط:</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#C8C5BA] leading-relaxed">
              {aiInterpretation.executiveDiagnosis.commonMisunderstandingArabic}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>القرار اللي ما أنصحكش تاخده دلوقتي:</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
              {aiInterpretation.executiveDiagnosis.decisionNotToTakeNowArabic}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#4A2F15]/40 bg-[#040405]/60 p-4 rounded-xl">
          <span className="text-xs text-[#F5BF1E] font-bold block mb-1">
            أول حاجة أصلحها (First Priority Action):
          </span>
          <p className="text-xs sm:text-sm text-[#FCFCFA] leading-relaxed">
            {aiInterpretation.executiveDiagnosis.firstPriorityFixArabic}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DIMENSION BREAKDOWN (10 DIMENSIONS BARS) */}
      {/* ======================================================== */}
      <div className="p-6 bg-[#23170D]/30 border border-[#4A2F15]/40 rounded-xl text-right space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">
            تحليل أبعاد العرض العشرة (10 Dimension Breakdown)
          </h3>
          <button
            onClick={() => setShowAllDimensions(!showAllDimensions)}
            type="button"
            className="text-xs text-[#F5BF1E] hover:text-[#FBD052] flex items-center gap-1"
          >
            <span>{showAllDimensions ? 'إخفاء التفاصيل' : 'عرض كافة الأبعاد'}</span>
            {showAllDimensions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {Object.values(deterministic.dimensionScores)
            .slice(0, showAllDimensions ? 10 : 4)
            .map(dim => (
              <div key={dim.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#C8C5BA]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#FCFCFA]">{dim.nameArabic}</span>
                    <span className="text-[10px] text-[#797979]">({dim.nameEnglish}) · وزن {dim.weight}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#797979]">{dim.epistemicStatus}</span>
                    <span className="font-bold text-[#FBD052]">{dim.score} / 100</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#040405] rounded-full overflow-hidden border border-[#4A2F15]/30">
                  <div
                    className={`h-full transition-all duration-500 ${
                      dim.score >= 70
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : dim.score >= 45
                        ? 'bg-gradient-to-r from-[#A7690C] to-[#F5BF1E]'
                        : 'bg-gradient-to-r from-rose-800 to-rose-500'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#797979]">{dim.notes}</p>
              </div>
            ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. LEAD CAPTURE GATE (VALUE FIRST) */}
      {/* ======================================================== */}
      {!isUnlocked && (
        <div className="p-8 bg-gradient-to-b from-[#23170D] to-[#040405] border-2 border-[#F5BF1E]/50 rounded-2xl text-center space-y-6 shadow-[0_0_30px_rgba(245,191,30,0.1)]">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F5BF1E]/10 border border-[#F5BF1E] flex items-center justify-center text-[#F5BF1E]">
            <Lock className="w-6 h-6" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-[#FCFCFA] font-['Cairo']">
              احفظ تحليل عرضك وخد Offer Architecture Blueprint الكامل
            </h3>
            <p className="text-sm text-[#C8C5BA] leading-relaxed">
              تم تشخيص نقاط القوة والخلفية مجاناً أعلاه. للحصول على المخطط التنفيذي الكامل (إعادة الصياغة، هيكل المكونات، خريطة الاعتراضات، العناوين المقترحة، وخطة اختبار الـ 7 أيام):
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto space-y-4 text-right">
            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1">
                الاسم الأول
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="اسمك الأول"
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1">
                البريد الإلكتروني المهني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            <div className="flex items-start gap-2 pt-1 text-right">
              <input
                type="checkbox"
                id="consentCheck"
                checked={marketingConsent}
                onChange={e => setMarketingConsent(e.target.checked)}
                className="mt-1 rounded bg-[#040405] border-[#4A2F15] text-[#F5BF1E] focus:ring-0"
              />
              <label htmlFor="consentCheck" className="text-[11px] text-[#797979] leading-normal cursor-pointer">
                أوافق على استلام نصائح ودراسات حالة استراتيجية متقدمة في هندسة الفانلز والعروض من Mohamed Adel (اختياري - لا يشترط لفتح التقرير).
              </label>
            </div>

            {leadError && (
              <p className="text-xs text-rose-400 text-center">{leadError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmittingLead}
              className="w-full py-3.5 text-sm font-bold text-[#040405] bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] hover:from-[#FBD052] hover:to-[#F5BF1E] rounded-md transition-all shadow-[0_4px_20px_rgba(245,191,30,0.25)] flex items-center justify-center gap-2 cursor-pointer font-['Cairo'] disabled:opacity-50"
            >
              {isSubmittingLead ? (
                <span>جاري فتح المخطط...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>فتح Offer Architecture Blueprint الكامل</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-[#797979]">
            نحن نحترم خصوصيتك تماماً. لا نشارك بياناتك مع أي طرف ثالث.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FULL UNLOCKED BLUEPRINT SECTIONS */}
      {/* ======================================================== */}
      {isUnlocked && (
        <div className="space-y-12 pt-6 border-t-2 border-[#F5BF1E]/30 animate-fadeIn">
          {/* Top Strategic Decision & Funnel Readiness Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-6 rounded-2xl border text-right space-y-2 md:col-span-2 ${
              STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision]?.color || 'bg-[#23170D] border-[#F5BF1E]/40 text-[#FCFCFA]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider uppercase">القرار الاستراتيجي الآن</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#040405]/70 text-[#F5BF1E] border border-[#F5BF1E]/30 font-['Cairo']">
                  {STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision]?.label || 'توجيه استراتيجي'}
                </span>
              </div>
              <h2 className="text-2xl font-black font-['Cairo'] tracking-tight">
                {STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision]?.label || aiInterpretation.strategicDecision}
              </h2>
              <p className="text-xs leading-relaxed text-[#FCFCFA] font-medium pt-1">
                {aiInterpretation.strategicDecisionExplanationArabic || STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision]?.desc}
              </p>
            </div>

            <div className="p-6 bg-[#23170D]/60 border border-[#4A2F15]/60 rounded-2xl text-right flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#797979] font-semibold block mb-1">تشخيص المسار</span>
                <h4 className="text-sm font-bold text-[#FCFCFA] font-['Cairo'] mb-2">جاهزية الانتقال للفانل</h4>
                <div className={`inline-block px-3 py-1.5 rounded-lg border text-xs font-bold font-['Cairo'] ${
                  FUNNEL_READINESS_MAP[aiInterpretation.funnelReadiness]?.color || 'text-[#F5BF1E] bg-[#040405] border-[#4A2F15]'
                }`}>
                  {FUNNEL_READINESS_MAP[aiInterpretation.funnelReadiness]?.label || aiInterpretation.funnelReadiness}
                </div>
              </div>
              <p className="text-[11px] text-[#797979] mt-3 leading-normal border-t border-[#4A2F15]/40 pt-2">
                تشخيص جاهزية العرض للاستحواذ الموسع وليس دعوة للبيع أو الشراء.
              </p>
            </div>
          </div>

          {/* Prominent Missing Evidence Section */}
          <div className="p-6 bg-[#23170D]/50 border border-[#F5BF1E]/50 rounded-2xl text-right space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#4A2F15]/40 pb-3">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">PRIORITY EVIDENCE GAPS</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  الأدلة اللي لسه ناقصة
                </h3>
              </div>
              <span className="text-xs text-[#FBD052] px-2.5 py-1 bg-[#040405] rounded border border-[#4A2F15]">
                {(aiInterpretation.missingEvidenceArabic || []).length} فجوات محورية
              </span>
            </div>
            <p className="text-xs text-[#FBD052] font-semibold leading-relaxed">
              دي مش قائمة نواقص عامة؛ دي البيانات اللي لو عرفناها ممكن تغيّر القرار الاستراتيجي نفسه.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(aiInterpretation.missingEvidenceArabic || []).map((gap, i) => (
                <div key={i} className="p-3 bg-[#040405] border border-[#4A2F15]/40 rounded-xl text-xs text-[#FCFCFA] flex items-start gap-2.5">
                  <span className="text-[#F5BF1E] font-bold font-mono">0{i + 1}.</span>
                  <span className="leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Offer Architecture Map */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
            <div className="border-b border-[#4A2F15]/40 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">01. ARCHITECTURE MAP</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                خريطة هندسة العرض (Offer Architecture Map)
              </h3>
              <p className="text-xs text-[#797979]">
                التسلسل البنيوي لرحلة قرار الشراء، موضحاً أين تكمن القوة وأين يكمن الخلل.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 overflow-x-auto py-4 text-xs font-semibold text-center">
              {[
                { title: 'المشتري (Buyer)', ok: deterministic.dimensionScores.buyer_offer_fit.score >= 50 },
                { title: 'المشكلة (Problem)', ok: deterministic.dimensionScores.problem_strength.score >= 50 },
                { title: 'النتيجة (Outcome)', ok: deterministic.dimensionScores.outcome_clarity.score >= 50 },
                { title: 'الآلية (Mechanism)', ok: deterministic.dimensionScores.differentiation.score >= 50 },
                { title: 'العرض (Offer)', ok: deterministic.dimensionScores.perceived_value.score >= 50 },
                { title: 'الإثبات (Proof)', ok: deterministic.dimensionScores.proof_strength.score >= 50 },
                { title: 'تقليل المخاطرة (Risk)', ok: deterministic.dimensionScores.risk_and_trust.score >= 50 },
                { title: 'القرار (Decision)', ok: deterministic.dimensionScores.decision_friction.score >= 50 },
              ].map((node, i, arr) => (
                <React.Fragment key={i}>
                  <div
                    className={`px-3 py-2 rounded border min-w-[100px] shrink-0 ${
                      node.ok
                        ? 'bg-[#23170D] border-[#F5BF1E]/70 text-[#FCFCFA]'
                        : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    <div>{node.title}</div>
                    <div className="text-[10px] text-[#797979] mt-0.5">
                      {node.ok ? 'نقطة قوية' : 'نقطة ضعف'}
                    </div>
                  </div>
                  {i < arr.length - 1 && <span className="text-[#4A2F15] hidden sm:inline">←</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 2: Core Offer Rebuild (Full Structured View) */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-6">
            <div className="border-b border-[#4A2F15]/40 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">02. CORE REBUILD</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  إعادة البناء الجوهري للعرض (Core Offer Rebuild)
                </h3>
                <p className="text-xs text-[#797979]">
                  المسودة المنقحة للعرض بعد تنقيته من الغموض والحشو والمبالغات غير المثبتة.
                </p>
              </div>
              <div className="text-xs text-[#797979]">
                الفئة: <span className="text-[#FBD052] font-semibold">{aiInterpretation.offerRebuild.offerCategoryArabic}</span> | نموذج التسليم: <span className="text-[#FBD052] font-semibold">{aiInterpretation.offerRebuild.deliveryModelArabic}</span>
              </div>
            </div>

            {/* Current vs Proposed Core Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#040405] rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h4 className="font-bold text-stone-300 font-['Cairo']">الوضع الحالي</h4>
                  <span className="text-[10px] text-[#797979]">Current Strategic Core</span>
                </div>
                <p className="text-xs text-[#C8C5BA] leading-relaxed">
                  {aiInterpretation.offerRebuild.currentStrategicCoreArabic}
                </p>
              </div>

              <div className="p-4 bg-[#040405] rounded-xl border border-[#F5BF1E]/40 space-y-2">
                <div className="flex items-center justify-between border-b border-[#4A2F15]/40 pb-2">
                  <h4 className="font-bold text-[#FBD052] font-['Cairo']">الهيكل المقترح</h4>
                  <span className="text-[10px] text-[#F5BF1E]/70 font-mono">Recommended Scope</span>
                </div>
                <p className="text-xs text-[#FCFCFA] leading-relaxed font-semibold">
                  {aiInterpretation.offerRebuild.recommendedStrategicCoreArabic}
                </p>
                <div className="pt-2 text-[11px] text-[#C8C5BA] border-t border-[#4A2F15]/20">
                  <span className="text-[#F5BF1E] font-medium">النطاق الموصى به: </span>
                  {aiInterpretation.offerRebuild.recommendedScopeArabic}
                </div>
              </div>
            </div>

            {/* Structured Tactical Actions: Keep, Change, Remove */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Keep */}
              <div className="p-4 bg-[#040405] rounded-xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="font-bold text-emerald-400 font-['Cairo']">حافظ على</span>
                  <span className="text-[10px] text-emerald-500/70">Keep</span>
                </div>
                <ul className="space-y-1.5 text-[#FCFCFA]">
                  {(aiInterpretation.offerRebuild.keepArabic || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Change */}
              <div className="p-4 bg-[#040405] rounded-xl border border-[#F5BF1E]/40 space-y-2">
                <div className="flex items-center justify-between border-b border-[#4A2F15]/40 pb-2">
                  <span className="font-bold text-[#FBD052] font-['Cairo']">غيّر</span>
                  <span className="text-[10px] text-[#F5BF1E]/70">Change</span>
                </div>
                <ul className="space-y-1.5 text-[#FCFCFA]">
                  {(aiInterpretation.offerRebuild.changeArabic || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#FBD052]">⇄</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remove */}
              <div className="p-4 bg-[#040405] rounded-xl border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between border-b border-rose-950 pb-2">
                  <span className="font-bold text-rose-400 font-['Cairo']">احذف أو أجّل</span>
                  <span className="text-[10px] text-rose-500/70">Remove/Delay</span>
                </div>
                <ul className="space-y-1.5 text-rose-200/90">
                  {(aiInterpretation.offerRebuild.removeArabic || []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hypotheses to Validate */}
            <div className="p-4 bg-[#040405] rounded-xl border border-amber-900/40 text-xs space-y-2">
              <span className="font-bold text-amber-400 block font-['Cairo']">
                فرضيات تحتاج اختبار (Hypotheses to Validate)
              </span>
              <ul className="space-y-1 text-[#C8C5BA]">
                {(aiInterpretation.offerRebuild.hypothesesToValidateArabic || []).map((hyp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#F5BF1E] font-mono">·</span>
                    <span>{hyp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Positioning Statement & Value Proposition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
              <div className="flex items-center justify-between border-b border-[#4A2F15]/30 pb-2">
                <div>
                  <span className="text-xs text-[#F5BF1E] font-mono">03. POSITIONING</span>
                  <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">صياغة التموضع (Positioning Statement)</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold border font-['Cairo'] ${
                  POSITIONING_STATUS_MAP[aiInterpretation.positioningStatus]?.color || 'text-[#F5BF1E] bg-[#040405] border-[#4A2F15]'
                }`}>
                  {POSITIONING_STATUS_MAP[aiInterpretation.positioningStatus]?.label || aiInterpretation.positioningStatus}
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#FBD052] font-semibold block mb-1">الصيغة الاستراتيجية الدقيقة:</span>
                  <p className="text-[#FCFCFA] leading-relaxed">
                    "{aiInterpretation.positioningStatement.strategicVersionArabic}"
                  </p>
                </div>
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#C8C5BA] font-semibold block mb-1">الصيغة التسويقية السلسة:</span>
                  <p className="text-[#FCFCFA] leading-relaxed">
                    "{aiInterpretation.positioningStatement.naturalMarketingVersionArabic}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
              <div className="flex items-center justify-between border-b border-[#4A2F15]/30 pb-2">
                <div>
                  <span className="text-xs text-[#F5BF1E] font-mono">04. VALUE PROPOSITION</span>
                  <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">عرض القيمة (Value Proposition)</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold border font-['Cairo'] ${
                    VALUE_STATUS_MAP[aiInterpretation.valuePropositionStatus]?.color || 'text-[#F5BF1E] bg-[#040405] border-[#4A2F15]'
                  }`}>
                    {VALUE_STATUS_MAP[aiInterpretation.valuePropositionStatus]?.label || aiInterpretation.valuePropositionStatus}
                  </span>
                  {aiInterpretation.valueProposition.isHypothesis && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-600/40">
                      فرضية تحتاج تحقق
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#040405] rounded">
                  <span className="text-[#FBD052] font-semibold block mb-0.5">القيمة للعميل:</span>
                  <span className="text-[#C8C5BA] leading-relaxed">{aiInterpretation.valueProposition.customerValueArabic}</span>
                </div>
                <div className="p-2.5 bg-[#040405] rounded">
                  <span className="text-[#FBD052] font-semibold block mb-0.5">القيمة العملية / التجارية:</span>
                  <span className="text-[#C8C5BA] leading-relaxed">{aiInterpretation.valueProposition.businessValueArabic}</span>
                </div>
                <div className="p-2.5 bg-[#040405] rounded">
                  <span className="text-[#FBD052] font-semibold block mb-0.5">لماذا الآن؟:</span>
                  <span className="text-[#C8C5BA] leading-relaxed">{aiInterpretation.valueProposition.whyNowArabic}</span>
                </div>
                {aiInterpretation.valueProposition.whyThisApproachArabic && (
                  <div className="p-2.5 bg-[#040405] rounded">
                    <span className="text-[#FBD052] font-semibold block mb-0.5">لماذا هذا الأسلوب؟:</span>
                    <span className="text-[#C8C5BA] leading-relaxed">{aiInterpretation.valueProposition.whyThisApproachArabic}</span>
                  </div>
                )}
                {aiInterpretation.valueProposition.whyNotAlternativeArabic && (
                  <div className="p-2.5 bg-[#040405] rounded">
                    <span className="text-[#FBD052] font-semibold block mb-0.5">لماذا ليس البديل الحالي؟:</span>
                    <span className="text-[#C8C5BA] leading-relaxed">{aiInterpretation.valueProposition.whyNotAlternativeArabic}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Offer Stack & Bonus Logic */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-6">
            <div className="border-b border-[#4A2F15]/40 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">05. OFFER STACK & BONUSES</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                هندسة مكونات العرض والبونص (Offer Stack Architecture)
              </h3>
              <p className="text-xs text-[#797979]">
                تصنيف المكونات وفق دورها الحقيقي: الجوهري، المساند، وما يُنصح بحذفه فوراً لتقليل التعقيد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-[#040405] rounded-xl border border-emerald-500/40">
                <span className="text-emerald-400 font-bold block mb-2">1. الجوهري (Core)</span>
                <ul className="space-y-1.5 text-[#FCFCFA]">
                  {aiInterpretation.offerStack.coreComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#040405] rounded-xl border border-[#F5BF1E]/40">
                <span className="text-[#FBD052] font-bold block mb-2">2. المساند (Supporting)</span>
                <ul className="space-y-1.5 text-[#C8C5BA]">
                  {aiInterpretation.offerStack.supportingComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]">
                <span className="text-[#797979] font-bold block mb-2">3. الاختياري (Optional)</span>
                <ul className="space-y-1.5 text-[#797979]">
                  {aiInterpretation.offerStack.optionalComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-950/20 rounded-xl border border-rose-500/40">
                <span className="text-rose-400 font-bold block mb-2">4. احذف أو أخّر (Remove/Delay)</span>
                <ul className="space-y-1.5 text-rose-200/90">
                  {aiInterpretation.offerStack.removeOrDelayComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Components To Test (Invented AI items separated from current stack) */}
            {aiInterpretation.offerStack.recommendedComponentsToTest &&
              aiInterpretation.offerStack.recommendedComponentsToTest.length > 0 && (
                <div className="p-4 bg-[#23170D]/50 rounded-xl border border-amber-600/40 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
                    <span className="text-amber-400 font-bold font-['Cairo'] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>مكونات جديدة مقترحة للاختبار — وليست جزءًا من العرض الحالي</span>
                    </span>
                    <span className="text-[10px] bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40">
                      مقترح تجريبي مستقبلي
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C8C5BA] leading-relaxed">
                    هذه المكونات ليست جزءاً من مدخلاتك الحالية، وتطرح هنا كفرضيات إضافية للاختبار المستقبلي في حال أردت توسيع نطاق العرض لاحقاً:
                  </p>
                  <ul className="space-y-1 text-[#FCFCFA] pt-1">
                    {aiInterpretation.offerStack.recommendedComponentsToTest.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">·</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Bonus logic note */}
            <div className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]/40 text-xs">
              <span className="text-[#F5BF1E] font-bold block mb-1">منطق البونص (Bonus Logic):</span>
              <p className="text-[#C8C5BA] mb-2">{aiInterpretation.bonusLogic.bonusStatusVerdictArabic}</p>
              {aiInterpretation.bonusLogic.recommendedBonuses.map((b, i) => (
                <div key={i} className="text-[11px] text-[#797979] mt-1">
                  · <span className="text-[#FCFCFA] font-medium">{b.titleArabic}</span>: يحل عائق ({b.frictionOrObjectionSolvedArabic}).
                </div>
              ))}
            </div>
          </div>

          {/* Section 5.1: Differentiation Matrix (مصفوفة التمايز الاستراتيجية) */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
            <div className="border-b border-[#4A2F15]/40 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">06. DIFFERENTIATION MATRIX</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  مصفوفة التمايز وفصل الفرضيات (Differentiation Matrix)
                </h3>
                <p className="text-xs text-[#797979]">
                  فصل ما هو مكرر مع البدائل عما هو ذو قيمة حقيقية، وتمييز ما إذا كان التمايز مثبتاً أم مجرد اعتقاد شخصي.
                </p>
              </div>
              <div className="px-2.5 py-1 bg-[#040405] rounded border border-[#4A2F15] text-[11px] text-[#C8C5BA]">
                حالة دليل التمايز: <span className="text-[#F5BF1E] font-bold">{DIFFERENTIATION_EVIDENCE_MAP[questionnaire.differentiationEvidenceStatus] || 'قيد التحقق'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Quadrant 1: Same as Alternatives */}
              <div className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#797979] font-bold">1. الشائع والمكرر مع البدائل (Table Stakes)</span>
                  <span className="text-[10px] text-[#797979] font-mono">Commodity</span>
                </div>
                <p className="text-[11px] text-[#797979]">عناصر موجودة في كل حل بديل ولا تصنع سبباً للشراء:</p>
                <ul className="space-y-1 text-[#C8C5BA]">
                  {aiInterpretation.differentiationMap.sameAsAlternativesArabic.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>

              {/* Quadrant 2: Different but Irrelevant */}
              <div className="p-4 bg-[#040405] rounded-xl border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold">2. مختلف لكن غير جوهري (Irrelevant Difference)</span>
                  <span className="text-[10px] text-amber-500/70 font-mono">Distraction</span>
                </div>
                <p className="text-[11px] text-[#797979]">اختلافات يدعيها البائع لكنها لا تهم المشتري في النتيجة:</p>
                <ul className="space-y-1 text-[#C8C5BA]">
                  {aiInterpretation.differentiationMap.differentButIrrelevantArabic.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>

              {/* Quadrant 3: Different and Valuable */}
              <div className="p-4 bg-[#040405] rounded-xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">
                    {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                      ? '3. تمايز محتمل يحتاج تحقق من المشتري (Hypothetical Delta)'
                      : '3. مختلف وذو قيمة مؤكدة (Valuable Delta)'}
                  </span>
                  <span className="text-[10px] text-emerald-400/70 font-mono">
                    {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF' ? 'Hypothesis' : 'Core Value'}
                  </span>
                </div>
                <p className="text-[11px] text-[#797979]">
                  {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                    ? 'عناصر تمايز يظن البائع أنها ذات قيمة ولكنها لم تُختبر بعد بسلوك شرائي أو آراء مشترين:'
                    : 'الفارق الحقيقي الذي يحل المشكلة بطريقة أسرع أو أكثر كفاءة:'}
                </p>
                <ul className="space-y-1 text-[#FCFCFA]">
                  {aiInterpretation.differentiationMap.differentAndValuableArabic.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>

              {/* Quadrant 4: Potentially Defensible */}
              <div className="p-4 bg-[#040405] rounded-xl border border-[#F5BF1E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#FBD052] font-bold">
                    {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                      ? '4. حاجز تنافسي محتمل غير مثبت (Unproven Defensibility)'
                      : '4. القابل للدفاع عنه تنافسياً (Moat / Defense)'}
                  </span>
                  <span className="text-[10px] text-[#F5BF1E]/70 font-mono">
                    {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF' ? 'Unproven' : 'Defensibility'}
                  </span>
                </div>
                <p className="text-[11px] text-[#797979]">
                  {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                    ? 'عناصر يفترض البائع صعوبة تقليدها، بانتظار اختبار رد فعل السوق:'
                    : 'عناصر يصعب على المنافسين نسخها بسهولة:'}
                </p>
                <ul className="space-y-1 text-[#FCFCFA]">
                  {aiInterpretation.differentiationMap.potentiallyDefensibleArabic.map((item, i) => (
                    <li key={i}>· {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5.2: Objection Architecture Map (خريطة الاعتراضات وهندسة الأدلة) */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
            <div className="border-b border-[#4A2F15]/40 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">07. OBJECTION ARCHITECTURE</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  خريطة الاعتراضات وهندسة الأدلة (Objection Architecture Map)
                </h3>
                <p className="text-xs text-[#797979]">
                  فصل صارم بين ما سمعه البائع فعلاً من مشترين، وما يفترضه ذاتياً، والأسئلة العالقة دون إجابة.
                </p>
              </div>
              <div className="px-2.5 py-1 bg-[#040405] rounded border border-[#4A2F15] text-[11px] text-[#C8C5BA]">
                حالة دليل الاعتراضات: <span className="text-[#F5BF1E] font-bold">{OBJECTION_EVIDENCE_MAP[questionnaire.objectionEvidenceStatus] || 'قيد التحقق'}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Actual Objections Heard */}
              <div className="p-4 bg-[#040405] rounded-xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>الاعتراضات الفعلية المرصودة من مشترين حقيقيين (Actual Objections Heard):</span>
                  </span>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/40">
                    دليل واقعي مثبت
                  </span>
                </div>
                {aiInterpretation.objectionMap.actualObjections.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {aiInterpretation.objectionMap.actualObjections.map((obj, i) => (
                      <div key={i} className="p-3 bg-[#23170D]/30 rounded border border-[#4A2F15]/40 space-y-1">
                        <div className="text-[#FCFCFA] font-semibold text-sm">"{obj.objection}"</div>
                        <div className="text-[11px] text-[#C8C5BA]">
                          <span className="text-[#FBD052]">القناعة الكامنة خلف الاعتراض: </span>
                          {obj.belief}
                        </div>
                        <div className="text-[11px] text-[#797979]">
                          <span className="text-emerald-400">الدليل المطلوب لحسمه: </span>
                          {obj.neededEvidence}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#797979] italic p-2 bg-[#23170D]/10 rounded">
                    {questionnaire.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS'
                      ? 'لم يتم تسجيل أي اعتراضات فعلية لعدم إجراء محادثات حقيقية مع مشترين حتى الآن. (لا يتم توليد اعتراضات زائفة).'
                      : 'لا توجد اعتراضات فعلية مسموعة موثقة في هذا الاستبيان؛ المصدر المتاح حالياً هو افتراضات البائع فقط.'}
                  </p>
                )}
              </div>

              {/* Assumed Objections */}
              <div className="p-4 bg-[#040405] rounded-xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>الاعتراضات المتوقعة بالحدس (Seller Assumed Objections):</span>
                  </span>
                  <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/40">
                    فرضية تحتاج تحقق
                  </span>
                </div>
                {aiInterpretation.objectionMap.assumedObjections.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    {aiInterpretation.objectionMap.assumedObjections.map((obj, i) => (
                      <div key={i} className="p-3 bg-[#23170D]/30 rounded border border-[#4A2F15]/40 space-y-1">
                        <div className="text-[#FCFCFA] font-semibold text-sm">"{obj.objection}"</div>
                        <div className="text-[11px] text-[#C8C5BA]">
                          <span className="text-[#FBD052]">ما يفترضه البائع: </span>
                          {obj.belief}
                        </div>
                        <div className="text-[11px] text-[#797979]">
                          <span className="text-amber-400">كيفية التحقق منه عملياً: </span>
                          {obj.neededEvidence}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#797979] italic p-2 bg-[#23170D]/10 rounded">
                    لم يقدم البائع أي اعتراضات مفترضة ذاتياً.
                  </p>
                )}
              </div>

              {/* Unanswered Objections */}
              <div className="p-4 bg-[#040405] rounded-xl border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>الأسئلة والشكوك العالقة دون إجابة (Unanswered Friction):</span>
                  </span>
                  <span className="text-[10px] bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded border border-rose-700/40">
                    نقطة احتكاك خفية
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  {aiInterpretation.objectionMap.unansweredObjections.map((obj, i) => (
                    <div key={i} className="p-3 bg-[#23170D]/30 rounded border border-[#4A2F15]/40 space-y-1">
                      <div className="text-rose-200 font-semibold">"{obj.objection}"</div>
                      <div className="text-[11px] text-[#C8C5BA]">
                        <span className="text-[#F5BF1E]">التوجيه الاستراتيجي: </span>
                        {obj.strategicAdvice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: What NOT to Add & What NOT to Change Yet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-rose-950/15 border border-rose-500/30 rounded-2xl text-right space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>متضيفش إيه؟ (What NOT to Add)</span>
              </div>
              <ul className="space-y-2 text-xs text-[#FCFCFA]">
                {aiInterpretation.whatNotToAddArabic.map((item, i) => (
                  <li key={i} className="p-2.5 bg-[#040405]/80 rounded border border-rose-500/20">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-amber-950/15 border border-amber-500/30 rounded-2xl text-right space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>ما تلمسوش دلوقتي (What NOT to Change Yet)</span>
              </div>
              <ul className="space-y-2 text-xs text-[#FCFCFA]">
                {aiInterpretation.whatNotToChangeYetArabic.map((item, i) => (
                  <li key={i} className="p-2.5 bg-[#040405]/80 rounded border border-amber-500/20">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 6: Pricing Diagnosis & Risk Reduction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
              <span className="text-xs text-[#F5BF1E] font-mono">06. PRICING DIAGNOSIS</span>
              <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">تشخيص التسعير (Pricing Logic)</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#FBD052] font-semibold block mb-1">حكم التسعير:</span>
                  <p className="text-[#FCFCFA]">{aiInterpretation.pricingStrategicAdvice.verdictArabic}</p>
                </div>
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#C8C5BA] font-semibold block mb-1">منطق القيمة مقابل السعر:</span>
                  <p className="text-[#797979]">{aiInterpretation.pricingStrategicAdvice.valueToPriceLogicArabic}</p>
                </div>
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-amber-400 font-semibold block mb-1">ما يجب فعله قبل تغيير السعر:</span>
                  <p className="text-[#C8C5BA]">{aiInterpretation.pricingStrategicAdvice.actionBeforeChangingPriceArabic}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-4">
              <span className="text-xs text-[#F5BF1E] font-mono">07. RISK REDUCTION</span>
              <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">استراتيجية تقليل المخاطرة (Risk Reversal)</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#FBD052] font-semibold block mb-1">النهج الموصى به:</span>
                  <p className="text-[#FCFCFA]">{aiInterpretation.riskReductionStrategy.recommendedApproachArabic}</p>
                </div>
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-[#C8C5BA] font-semibold block mb-1">ملاءمة الضمان (Guarantees):</span>
                  <p className="text-[#797979]">{aiInterpretation.riskReductionStrategy.guaranteeSuitabilityArabic}</p>
                </div>
                <div className="p-3 bg-[#040405] rounded border border-[#4A2F15]/40">
                  <span className="text-emerald-400 font-semibold block mb-1">إجراءات حماية عملية:</span>
                  <ul className="space-y-1 text-[#C8C5BA]">
                    {aiInterpretation.riskReductionStrategy.practicalSafeguardsArabic.map((s, i) => (
                      <li key={i}>· {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Headline Directions (5 angles) & CTA Direction */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-6">
            <div className="border-b border-[#4A2F15]/40 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">08. HEADLINES & CTA</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  اتجاهات العناوين الرئيسية والدعوة للشراء (Headlines & CTA)
                </h3>
              </div>
              <div className="p-2 bg-[#040405] rounded border border-[#F5BF1E]/40 text-xs">
                <span className="text-[#797979]">الـ CTA الموصى به: </span>
                <span className="font-bold text-[#F5BF1E]">{aiInterpretation.ctaDirection.recommendedCTAArabic}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {aiInterpretation.headlineDirections.map((hd, i) => (
                <div key={i} className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FBD052] font-bold text-[11px]">{hd.angleArabic}</span>
                    <span className="text-[10px] text-[#797979] font-mono">{hd.angle}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#FCFCFA] leading-normal font-['Cairo']">
                    "{hd.headlineArabic}"
                  </p>
                  <p className="text-[11px] text-[#797979] leading-relaxed">{hd.rationaleArabic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8.1: Sales Page Skeleton & Message Hierarchy */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-6">
            <div className="border-b border-[#4A2F15]/40 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#F5BF1E] font-mono">09. SALES PAGE SKELETON</span>
                <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                  هيكل صفحة المبيعات وهرم رسائل الإقناع (Sales Conversion Blueprint)
                </h3>
                <p className="text-xs text-[#797979]">
                  تسلسل تدفق الوعي الإقناعي من أول نظرة حتى إتمام الدفع، بما يمنع التشتت والقفز على المراحل.
                </p>
              </div>
            </div>

            {/* Sales Message Hierarchy */}
            <div className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]/40 space-y-2 text-xs">
              <span className="text-[#F5BF1E] font-bold block mb-1">
                الهرم التسلسلي لرسائل الإقناع (Sales Message Hierarchy):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiInterpretation.salesMessageHierarchyArabic.map((msg, i) => (
                  <div key={i} className="p-2.5 bg-[#23170D]/40 rounded border border-[#4A2F15]/30 text-[#C8C5BA]">
                    {msg}
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Page Skeleton Blocks */}
            <div className="space-y-3 text-xs">
              <span className="text-[#FCFCFA] font-bold block">
                مخطط أقسام صفحة العرض (Section-by-Section Wireframe):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiInterpretation.salesPageSkeleton.map((sec, i) => (
                  <div key={i} className="p-4 bg-[#040405] rounded-xl border border-[#4A2F15]/40 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#FBD052] font-bold text-[11px] font-['Cairo']">
                          {sec.sectionTitleArabic}
                        </span>
                        <span className="text-[10px] text-[#797979] font-mono">#{i + 1}</span>
                      </div>
                      <p className="text-[11px] text-[#797979] mb-2">{sec.strategicPurposeArabic}</p>
                    </div>
                    <div className="pt-2 border-t border-[#4A2F15]/30">
                      <span className="text-[10px] text-[#C8C5BA] block mb-1 font-semibold">العناصر الأساسية:</span>
                      <ul className="space-y-0.5 text-[11px] text-[#C8C5BA]">
                        {sec.keyElementsArabic.map((el, elIdx) => (
                          <li key={elIdx}>· {el}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 9: Highest-Priority Experiment & 7-Day Sprint */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-6">
            <div className="border-b border-[#4A2F15]/40 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">10. VALIDATION EXPERIMENT & SPRINT</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
                التجربة ذات الأولوية القصوى وخطة الـ 7 أيام
              </h3>
              <p className="text-xs text-[#797979]">
                تجربة واحدة دقيقة لحسم المشكلة، تليها خطة 7 أيام متكيفة تماماً مع مرحلة نضج عرضك.
              </p>
            </div>

            {/* Primary experiment */}
            <div className="p-5 bg-[#040405] rounded-xl border border-[#F5BF1E]/50 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#4A2F15]/40 pb-2">
                <span className="text-sm font-bold text-[#F5BF1E]">التجربة الأساسية الأولى (Highest-Priority Experiment)</span>
                <span className="text-[10px] text-[#797979]">تغيير واحد فقط لمنع التشويش وحسم القرار</span>
              </div>

              {/* 1. الفرضية */}
              <div className="p-3 bg-[#23170D]/40 rounded-lg border border-[#F5BF1E]/30 space-y-1">
                <span className="text-xs font-bold text-[#F5BF1E] block font-['Cairo']">الفرضية (Hypothesis):</span>
                <p className="text-[#FCFCFA] leading-relaxed text-xs font-semibold">
                  {aiInterpretation.primaryExperiment.hypothesisArabic}
                </p>
              </div>

              {/* 2. ليه بنختبرها؟ & 3. مين يدخل الاختبار؟ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#040405] rounded-lg border border-[#4A2F15]/40 space-y-1">
                  <span className="text-xs font-bold text-[#C8C5BA] block font-['Cairo']">ليه بنختبرها؟ (Why This Matters):</span>
                  <p className="text-[#FCFCFA] leading-relaxed">
                    {aiInterpretation.primaryExperiment.whyThisHypothesisMattersArabic || 'حسم أكبر عائق يعطل نمو المبيعات قبل إهدار الميزانية.'}
                  </p>
                </div>
                <div className="p-3 bg-[#040405] rounded-lg border border-[#4A2F15]/40 space-y-1">
                  <span className="text-xs font-bold text-[#C8C5BA] block font-['Cairo']">مين يدخل الاختبار؟ (Test Audience):</span>
                  <p className="text-[#FCFCFA] leading-relaxed">
                    {aiInterpretation.primaryExperiment.testAudienceArabic || 'عينة محددة من الشريحة المستهدفة الأكثر تأثراً بالمشكلة.'}
                  </p>
                </div>
              </div>

              {/* 4. هنغير إيه؟ & 5. هنثبت إيه؟ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#040405] rounded-lg border border-[#FBD052]/30 space-y-1">
                  <span className="text-xs font-bold text-[#FBD052] block font-['Cairo']">هنغير إيه؟ (What to Change):</span>
                  <p className="text-[#FCFCFA] leading-relaxed">
                    {aiInterpretation.primaryExperiment.whatToChangeArabic}
                  </p>
                </div>
                <div className="p-3 bg-[#040405] rounded-lg border border-[#4A2F15]/40 space-y-1">
                  <span className="text-xs font-bold text-stone-400 block font-['Cairo']">هنثبت إيه؟ (Keep Constant):</span>
                  <p className="text-stone-300 leading-relaxed">
                    {aiInterpretation.primaryExperiment.whatToKeepConstantArabic}
                  </p>
                </div>
              </div>

              {/* 6. هنراقب إيه؟ (Evidence to Collect) */}
              {aiInterpretation.primaryExperiment.evidenceToCollectArabic &&
                aiInterpretation.primaryExperiment.evidenceToCollectArabic.length > 0 && (
                  <div className="p-3 bg-[#040405] rounded-lg border border-cyan-800/40 space-y-1.5">
                    <span className="text-xs font-bold text-cyan-400 block font-['Cairo']">
                      هنراقب إيه؟ (Evidence to Collect):
                    </span>
                    <ul className="space-y-1 text-[#FCFCFA]">
                      {aiInterpretation.primaryExperiment.evidenceToCollectArabic.map((ev, evIdx) => (
                        <li key={evIdx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-cyan-400">·</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* 7. الدليل اللي عندنا حاليًا & 8. قاعدة القرار */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#040405] rounded-lg border border-[#4A2F15]/40 space-y-1">
                  <span className="text-xs font-bold text-[#F5BF1E] block font-['Cairo']">
                    الدليل اللي عندنا حاليًا (Observed Evidence):
                  </span>
                  <p className="text-[#C8C5BA] leading-relaxed">
                    {aiInterpretation.primaryExperiment.observedEvidenceArabic || 'لا توجد بيانات سلوكية كافية حتى اللحظة.'}
                  </p>
                </div>
                <div className="p-3 bg-[#040405] rounded-lg border border-emerald-600/40 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 block font-['Cairo']">
                    قاعدة القرار (Decision Rule):
                  </span>
                  <p className="text-emerald-200 leading-relaxed font-semibold">
                    {aiInterpretation.primaryExperiment.decisionRuleArabic}
                  </p>
                </div>
              </div>

              {/* 9. إيه اللي مينفعش نستنتجه من الاختبار؟ */}
              {aiInterpretation.primaryExperiment.whatNotToConcludeArabic && (
                <div className="p-3 bg-rose-950/20 rounded-lg border border-rose-500/30 space-y-1">
                  <span className="text-xs font-bold text-rose-400 block font-['Cairo'] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>إيه اللي مينفعش نستنتجه من الاختبار؟ (What NOT to Conclude):</span>
                  </span>
                  <p className="text-rose-200/90 leading-relaxed text-[11px]">
                    {aiInterpretation.primaryExperiment.whatNotToConcludeArabic}
                  </p>
                </div>
              )}
            </div>

            {/* 7-day sprint */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-[#FCFCFA] mb-2">
                خطة التحقق على مدار 7 أيام (Sprint: {deterministic.validationSprintMode}):
              </h4>
              <div className="space-y-2">
                {aiInterpretation.sevenDayValidationSprint.map(d => (
                  <div
                    key={d.dayNumber}
                    className="p-3 bg-[#040405] rounded-lg border border-[#4A2F15]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#23170D] border border-[#F5BF1E]/40 text-[#F5BF1E] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                        {d.dayNumber}
                      </span>
                      <div>
                        <span className="font-bold text-[#FCFCFA]">{d.titleArabic}</span>
                        <p className="text-[11px] text-[#C8C5BA] mt-0.5">{d.actionArabic}</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#797979] sm:text-left shrink-0">
                      الدليل المتوقع: <span className="text-[#FBD052]">{d.expectedEvidenceArabic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 9: Next Three Questions */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/50 rounded-2xl text-right space-y-3">
            <span className="text-xs text-[#F5BF1E] font-mono">10. STRATEGIC INQUIRY</span>
            <h3 className="text-base font-bold text-[#FCFCFA] font-['Cairo']">
              الأسئلة الثلاثة التالية لحسم الغموض (Next 3 Questions)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {aiInterpretation.nextThreeQuestionsArabic.map((q, i) => (
                <div key={i} className="p-3 bg-[#040405] rounded-xl border border-[#4A2F15]/40 text-[#C8C5BA] leading-relaxed">
                  <span className="text-[#F5BF1E] font-bold block mb-1">السؤال #{i + 1}:</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

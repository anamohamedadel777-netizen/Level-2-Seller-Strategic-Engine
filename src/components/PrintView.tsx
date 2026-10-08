import React from 'react';
import { FullOfferBlueprint } from '../types';

interface PrintViewProps {
  blueprint: FullOfferBlueprint;
  onClose: () => void;
}

const STRATEGIC_DECISION_MAP: Record<string, string> = {
  KEEP_AND_VALIDATE: 'حافظ على العرض واختبره',
  REFINE_BEFORE_SELLING: 'عدّل العرض قبل البيع',
  TEST_BEFORE_REBUILDING: 'اختبر العائق قبل إعادة البناء',
  SIMPLIFY_OFFER: 'بسّط العرض واحذف الحشو',
  STRENGTHEN_PROOF: 'ركّز على تقوية الإثبات',
  FIX_TRAFFIC_FIRST: 'أصلح جودة الزيارات أولاً',
  OPTIMIZE_CONVERSION: 'ركّز على تحسين التحويل',
  READY_FOR_FUNNEL_ARCHITECTURE: 'العرض جاهز لهندسة الفانل',
};

const FUNNEL_READINESS_MAP: Record<string, string> = {
  NOT_READY: 'غير جاهز بعد',
  VALIDATION_FIRST: 'يحتاج تحقق قبل بناء الفانل',
  OFFER_READY: 'العرض جاهز لبناء فانل',
  OPTIMIZATION_READY: 'جاهز للتحسين والتوسع',
};

const POSITIONING_STATUS_MAP: Record<string, string> = {
  VALIDATED_DIRECTION: 'اتجاه تموضع مدعوم بأدلة',
  STRATEGIC_DIRECTION: 'اتجاه استراتيجي واعد',
  PROVISIONAL_HYPOTHESIS: 'فرضية تموضع تحتاج اختبار',
  INSUFFICIENT_EVIDENCE: 'الأدلة غير كافية لاعتماد التموضع',
};

const VALUE_STATUS_MAP: Record<string, string> = {
  SUPPORTED: 'مدعوم بأدلة',
  PARTIALLY_SUPPORTED: 'مدعوم جزئيًا',
  HYPOTHESIS: 'فرضية قيمة تحتاج اختبار',
  INSUFFICIENT_EVIDENCE: 'الأدلة غير كافية',
};

const DIFFERENTIATION_EVIDENCE_MAP: Record<string, string> = {
  SELLER_BELIEF: 'اعتقاد من البائع — غير متحقق من المشتري',
  BUYER_MENTIONED_DIFFERENCE: 'المشتري لاحظ الفرق',
  BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE: 'الفرق أثّر في قرار الاختيار',
  WIN_LOSS_EVIDENCE: 'مدعوم بقرارات شراء/رفض فعلية',
  REPEATABLE_COMMERCIAL_EVIDENCE: 'مدعوم بأدلة تجارية متكررة',
};

export const PrintView: React.FC<PrintViewProps> = ({ blueprint, onClose }) => {
  const { deterministic, aiInterpretation, questionnaire, generatedAt } = blueprint;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm p-4 sm:p-8 flex justify-center">
      {/* Container */}
      <div className="max-w-4xl w-full bg-[#FCFCFA] text-[#040405] rounded-xl shadow-2xl p-6 sm:p-10 relative print:p-0 print:shadow-none print:m-0 font-['Alexandria',sans-serif] text-right">
        {/* Floating Print Action (Hidden on actual print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="px-5 py-2 text-xs font-bold text-[#FCFCFA] bg-[#040405] rounded hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>طباعة / حفظ PDF الآن</span>
            </button>
            <span className="text-xs text-stone-500">
              مخطط هندسة العرض الكامل (Offer Architecture Blueprint) — جاهز للحفظ كملف PDF استشاري.
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 rounded cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-xs text-stone-800 leading-relaxed">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-[#A7690C] pb-4">
            <div>
              <div className="text-[11px] font-bold text-[#A7690C] tracking-wide mb-0.5 font-['Cairo']">
                MOHAMED ADEL · SALES FUNNEL ARCHITECT
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#040405] font-['Cairo']">
                مخطط هندسة العرض التجاري (Offer Architecture Blueprint)
              </h1>
              <p className="text-[11px] text-stone-600 mt-1">
                المنتج: <span className="font-bold text-stone-900">{questionnaire.productName || 'عرض تجاري'}</span> ({questionnaire.productType || 'منتج'}) · التاريخ: {new Date(generatedAt).toLocaleDateString('ar-EG')}
              </p>
            </div>

            <div className="text-left font-mono text-[11px] text-stone-500">
              <div className="font-bold text-[#A7690C]">Full Blueprint</div>
              <div>Consulting Audit</div>
            </div>
          </div>

          {/* Diagnostic Scores & Strategic Directives */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-lg">
            <div>
              <div className="text-[10px] text-stone-500 font-semibold">قوة العرض (Strength)</div>
              <div className="text-2xl font-black text-[#040405] font-['Cairo']">
                {deterministic.offerStrengthScore} <span className="text-[10px] font-normal text-stone-500">/ 100</span>
              </div>
              <div className="text-[10px] text-stone-600 font-medium">{deterministic.offerDiagnosisCategory}</div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-semibold">درجة الثقة (Confidence)</div>
              <div className="text-2xl font-black text-[#040405] font-['Cairo']">
                {deterministic.confidenceScore} <span className="text-[10px] font-normal text-stone-500">/ 100</span>
              </div>
              <div className="text-[10px] text-stone-600 font-medium">ثقة {deterministic.confidenceRating}</div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-semibold">عنق الزجاجة الأساسي</div>
              <div className="text-xs font-bold text-rose-800 font-['Cairo'] mt-1">
                {deterministic.primaryBottleneckNameArabic}
              </div>
              <div className="text-[10px] text-stone-600">شدة: {deterministic.primaryBottleneckSeverity}</div>
            </div>

            <div>
              <div className="text-[10px] text-stone-500 font-semibold">جاهزية الفانل</div>
              <div className="text-xs font-bold text-stone-900 font-['Cairo'] mt-1">
                {FUNNEL_READINESS_MAP[aiInterpretation.funnelReadiness] || aiInterpretation.funnelReadiness}
              </div>
              <div className="text-[10px] text-[#A7690C] font-semibold mt-0.5">
                {STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision] || aiInterpretation.strategicDecision}
              </div>
            </div>
          </div>

          {/* 1. القرار الاستراتيجي وجاهزية الفانل */}
          <div className="p-3.5 bg-amber-50/40 border border-[#A7690C]/30 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#A7690C] font-['Cairo']">
                1. القرار الاستراتيجي الآن: {STRATEGIC_DECISION_MAP[aiInterpretation.strategicDecision] || aiInterpretation.strategicDecision}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-stone-300 text-stone-700">
                جاهزية الفانل: {FUNNEL_READINESS_MAP[aiInterpretation.funnelReadiness] || aiInterpretation.funnelReadiness}
              </span>
            </div>
            <p className="text-stone-800 leading-relaxed">
              {aiInterpretation.strategicDecisionExplanationArabic}
            </p>
          </div>

          {/* 2. تشخيص العرض في 60 ثانية */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              2. تشخيص العرض في 60 ثانية (Executive Diagnosis)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                <span className="font-bold text-stone-900 block mb-0.5">أقوى نقطة في العرض:</span>
                <p className="text-stone-700 leading-relaxed">{aiInterpretation.executiveDiagnosis.strongestAssetArabic}</p>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                <span className="font-bold text-rose-900 block mb-0.5">أكبر نقطة ضعف:</span>
                <p className="text-stone-700 leading-relaxed">{aiInterpretation.executiveDiagnosis.biggestWeaknessArabic}</p>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                <span className="font-bold text-stone-900 block mb-0.5">أكثر ما يُفهم خطأ:</span>
                <p className="text-stone-700 leading-relaxed">{aiInterpretation.executiveDiagnosis.commonMisunderstandingArabic}</p>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                <span className="font-bold text-amber-900 block mb-0.5">قرار يُحظر اتخاذه الآن:</span>
                <p className="text-stone-700 leading-relaxed">{aiInterpretation.executiveDiagnosis.decisionNotToTakeNowArabic}</p>
              </div>
            </div>
            <div className="p-2 bg-amber-50/60 border border-amber-200 rounded text-[11px]">
              <span className="font-bold text-amber-900">أول إجراء ذو أولوية: </span>
              <span className="text-stone-800">{aiInterpretation.executiveDiagnosis.firstPriorityFixArabic}</span>
            </div>
          </div>

          {/* 3. خريطة هندسة العرض */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              3. خريطة هندسة العرض (Offer Architecture Map)
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center text-[10px]">
              {[
                { label: 'المشتري', score: deterministic.dimensionScores.buyer_offer_fit.score },
                { label: 'المشكلة', score: deterministic.dimensionScores.problem_strength.score },
                { label: 'النتيجة', score: deterministic.dimensionScores.outcome_clarity.score },
                { label: 'الآلية', score: deterministic.dimensionScores.differentiation.score },
                { label: 'العرض', score: deterministic.dimensionScores.perceived_value.score },
                { label: 'الإثبات', score: deterministic.dimensionScores.proof_strength.score },
                { label: 'المخاطرة', score: deterministic.dimensionScores.risk_and_trust.score },
                { label: 'القرار', score: deterministic.dimensionScores.decision_friction.score },
              ].map((dim, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded border ${
                    dim.score >= 50
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="font-bold">{dim.label}</div>
                  <div>{dim.score}/100</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. إعادة البناء الجوهري للعرض */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              4. إعادة البناء الجوهري للعرض (Core Offer Rebuild)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded space-y-1">
                <span className="font-bold text-stone-900 block">الوضع الحالي:</span>
                <p className="text-stone-700">{aiInterpretation.offerRebuild.currentStrategicCoreArabic}</p>
              </div>
              <div className="p-2.5 bg-amber-50/40 border border-amber-300 rounded space-y-1">
                <span className="font-bold text-[#A7690C] block">الهيكل المقترح المنقح:</span>
                <p className="text-stone-900 font-semibold">{aiInterpretation.offerRebuild.recommendedStrategicCoreArabic}</p>
                <div className="text-[10px] text-stone-600 pt-1 border-t border-amber-200">
                  النطاق: {aiInterpretation.offerRebuild.recommendedScopeArabic}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded">
                <span className="font-bold text-emerald-900 block mb-1">حافظ على:</span>
                <ul className="space-y-0.5 text-stone-700">
                  {(aiInterpretation.offerRebuild.keepArabic || []).map((k, i) => (
                    <li key={i}>· {k}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-amber-50/60 border border-amber-200 rounded">
                <span className="font-bold text-amber-900 block mb-1">غيّر:</span>
                <ul className="space-y-0.5 text-stone-700">
                  {(aiInterpretation.offerRebuild.changeArabic || []).map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-rose-50/60 border border-rose-200 rounded">
                <span className="font-bold text-rose-900 block mb-1">احذف أو أجّل:</span>
                <ul className="space-y-0.5 text-stone-700">
                  {(aiInterpretation.offerRebuild.removeArabic || []).map((r, i) => (
                    <li key={i}>· {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 5. التموضع وعرض القيمة الكامل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Positioning */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <span className="font-bold text-stone-900 font-['Cairo']">5. صياغة التموضع (Positioning)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-300 font-bold text-stone-700">
                  {POSITIONING_STATUS_MAP[aiInterpretation.positioningStatus] || aiInterpretation.positioningStatus}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="font-bold text-[#A7690C] block">الصيغة الاستراتيجية:</span>
                  <p className="text-stone-800">"{aiInterpretation.positioningStatement.strategicVersionArabic}"</p>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block">الصيغة التسويقية:</span>
                  <p className="text-stone-800">"{aiInterpretation.positioningStatement.naturalMarketingVersionArabic}"</p>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <span className="font-bold text-stone-900 font-['Cairo']">6. عرض القيمة (Value Proposition)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-300 font-bold text-stone-700">
                  {VALUE_STATUS_MAP[aiInterpretation.valuePropositionStatus] || aiInterpretation.valuePropositionStatus}
                  {aiInterpretation.valueProposition.isHypothesis ? ' (فرضية)' : ''}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div><span className="font-bold text-stone-900">القيمة للعميل: </span>{aiInterpretation.valueProposition.customerValueArabic}</div>
                <div><span className="font-bold text-stone-900">العائد العملي/التجاري: </span>{aiInterpretation.valueProposition.businessValueArabic}</div>
                <div><span className="font-bold text-stone-900">لماذا الآن؟: </span>{aiInterpretation.valueProposition.whyNowArabic}</div>
                {aiInterpretation.valueProposition.whyThisApproachArabic && (
                  <div><span className="font-bold text-stone-900">لماذا هذا الأسلوب؟: </span>{aiInterpretation.valueProposition.whyThisApproachArabic}</div>
                )}
                {aiInterpretation.valueProposition.whyNotAlternativeArabic && (
                  <div><span className="font-bold text-stone-900">لماذا ليس البديل؟: </span>{aiInterpretation.valueProposition.whyNotAlternativeArabic}</div>
                )}
              </div>
            </div>
          </div>

          {/* 7. هيكلة مكونات العرض والمقترحات الجديدة */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              7. هيكلة المكونات والـ Offer Stack
            </h2>
            <div className="grid grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 bg-emerald-50/40 border border-emerald-200 rounded">
                <span className="font-bold text-emerald-900 block mb-1">المكونات الجوهرية (Core):</span>
                <ul className="space-y-0.5 text-stone-700">
                  {aiInterpretation.offerStack.coreComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                <span className="font-bold text-stone-900 block mb-1">المكونات المساندة (Supporting):</span>
                <ul className="space-y-0.5 text-stone-700">
                  {aiInterpretation.offerStack.supportingComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2.5 bg-rose-50/40 border border-rose-200 rounded">
                <span className="font-bold text-rose-900 block mb-1">احذف أو أخّر (Remove/Delay):</span>
                <ul className="space-y-0.5 text-stone-700">
                  {aiInterpretation.offerStack.removeOrDelayComponents.map((c, i) => (
                    <li key={i}>· {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended components to test */}
            {aiInterpretation.offerStack.recommendedComponentsToTest &&
              aiInterpretation.offerStack.recommendedComponentsToTest.length > 0 && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-300 rounded text-[11px]">
                  <span className="font-bold text-amber-900 block mb-1">
                    مكونات جديدة مقترحة للاختبار — وليست جزءًا من العرض الحالي:
                  </span>
                  <ul className="space-y-0.5 text-stone-700">
                    {aiInterpretation.offerStack.recommendedComponentsToTest.map((c, i) => (
                      <li key={i}>· {c}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Bonus logic */}
            <div className="p-2 bg-stone-50 border border-stone-200 rounded text-[11px]">
              <span className="font-bold text-stone-900">منطق البونص (Bonus Logic): </span>
              <span className="text-stone-700">{aiInterpretation.bonusLogic.bonusStatusVerdictArabic}</span>
              {aiInterpretation.bonusLogic.recommendedBonuses.map((b, i) => (
                <div key={i} className="text-stone-600 mt-0.5">
                  · {b.titleArabic} (يحل عائق: {b.frictionOrObjectionSolvedArabic})
                </div>
              ))}
            </div>
          </div>

          {/* 8. ما لا تلمسه وما لا تضيفه */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2.5 bg-rose-50/30 border border-rose-200 rounded">
              <span className="font-bold text-rose-900 block mb-1">إياك أن تضيفه الآن (What NOT to Add):</span>
              <ul className="space-y-0.5 text-stone-700">
                {aiInterpretation.whatNotToAddArabic.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-2.5 bg-amber-50/30 border border-amber-200 rounded">
              <span className="font-bold text-amber-900 block mb-1">ما لا تلمسه الآن (What NOT to Change Yet):</span>
              <ul className="space-y-0.5 text-stone-700">
                {aiInterpretation.whatNotToChangeYetArabic.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 9. مصفوفة التمايز وخريطة الاعتراضات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Differentiation */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <span className="font-bold text-stone-900 font-['Cairo']">9. مصفوفة التمايز</span>
                <span className="text-[10px] text-stone-600">
                  دليل: {DIFFERENTIATION_EVIDENCE_MAP[questionnaire.differentiationEvidenceStatus] || questionnaire.differentiationEvidenceStatus}
                </span>
              </div>
              <div>
                <span className="font-bold text-emerald-800">
                  {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                    ? 'تمايز محتمل يحتاج تحقق من المشتري: '
                    : 'مختلف وذو قيمة مؤكدة: '}
                </span>
                <span className="text-stone-700">{aiInterpretation.differentiationMap.differentAndValuableArabic.join(' | ') || 'قيد التحقق'}</span>
              </div>
              <div>
                <span className="font-bold text-amber-800">
                  {questionnaire.differentiationEvidenceStatus === 'SELLER_BELIEF'
                    ? 'حاجز تنافسي محتمل غير مثبت: '
                    : 'القابل للدفاع عنه تنافسياً: '}
                </span>
                <span className="text-stone-700">{aiInterpretation.differentiationMap.potentiallyDefensibleArabic.join(' | ') || 'قيد التحقق'}</span>
              </div>
              <div>
                <span className="font-bold text-stone-600">الشائع مع البدائل: </span>
                <span className="text-stone-500">{aiInterpretation.differentiationMap.sameAsAlternativesArabic.join(' | ')}</span>
              </div>
            </div>

            {/* Objection Map */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <span className="font-bold text-stone-900 font-['Cairo']">10. خريطة الاعتراضات</span>
                <span className="text-[10px] text-stone-600">
                  حالة: {OBJECTION_EVIDENCE_MAP[questionnaire.objectionEvidenceStatus] || questionnaire.objectionEvidenceStatus}
                </span>
              </div>
              {aiInterpretation.objectionMap.actualObjections.length > 0 ? (
                <div>
                  <span className="font-bold text-emerald-800">اعتراضات فعلية مسموعة: </span>
                  <span className="text-stone-700">
                    {aiInterpretation.objectionMap.actualObjections.map(o => `"${o.objection}"`).join(' | ')}
                  </span>
                </div>
              ) : (
                <div className="text-stone-500 italic">
                  لا توجد اعتراضات فعلية مسموعة (المرحلة تعتمد على افتراضات أو قبل إطلاق المحادثات).
                </div>
              )}
              {aiInterpretation.objectionMap.assumedObjections.length > 0 && (
                <div>
                  <span className="font-bold text-amber-800">اعتراضات مفترضة بالحدس: </span>
                  <span className="text-stone-700">
                    {aiInterpretation.objectionMap.assumedObjections.map(o => `"${o.objection}"`).join(' | ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 11. تشخيص التسعير واستراتيجية تقليل المخاطرة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block font-['Cairo']">11. تشخيص التسعير (Pricing Logic)</span>
              <div><span className="font-bold text-stone-900">الحكم: </span>{aiInterpretation.pricingStrategicAdvice.verdictArabic}</div>
              <div><span className="font-bold text-stone-700">منطق القيمة: </span>{aiInterpretation.pricingStrategicAdvice.valueToPriceLogicArabic}</div>
              <div><span className="font-bold text-amber-900">قبل تغيير السعر: </span>{aiInterpretation.pricingStrategicAdvice.actionBeforeChangingPriceArabic}</div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block font-['Cairo']">12. تقليل المخاطرة (Risk Reversal)</span>
              <div><span className="font-bold text-stone-900">النهج الموصى به: </span>{aiInterpretation.riskReductionStrategy.recommendedApproachArabic}</div>
              <div><span className="font-bold text-stone-700">ملاءمة الضمان: </span>{aiInterpretation.riskReductionStrategy.guaranteeSuitabilityArabic}</div>
              <div><span className="font-bold text-emerald-900">حماية عملية: </span>{aiInterpretation.riskReductionStrategy.practicalSafeguardsArabic.join(' | ')}</div>
            </div>
          </div>

          {/* 13. هرم رسائل الإقناع والعناوين والـ CTA */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              13. رسائل الإقناع والعناوين والدعوة للشراء
            </h2>
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded text-[11px] space-y-1">
              <span className="font-bold text-stone-900 block">هرم رسائل الإقناع (Sales Message Hierarchy):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-stone-700">
                {aiInterpretation.salesMessageHierarchyArabic.map((msg, i) => (
                  <div key={i}>· {msg}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {aiInterpretation.headlineDirections.slice(0, 3).map((h, i) => (
                <div key={i} className="p-2 bg-stone-50 border border-stone-200 rounded">
                  <span className="font-bold text-stone-900 block">[{h.angleArabic}]:</span>
                  <p className="text-stone-800 font-semibold">"{h.headlineArabic}"</p>
                </div>
              ))}
            </div>
            <div className="p-2 bg-amber-50/60 border border-amber-300 rounded text-[11px]">
              <span className="font-bold text-amber-900">الـ CTA الموصى به: </span>
              <span className="text-stone-900 font-bold">{aiInterpretation.ctaDirection.recommendedCTAArabic}</span>
              <span className="text-stone-600 mr-1">({aiInterpretation.ctaDirection.rationaleArabic})</span>
            </div>
          </div>

          {/* 14. مخطط صفحة المبيعات (Sales Page Skeleton) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              14. مخطط صفحة العرض (Sales Page Skeleton)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
              {aiInterpretation.salesPageSkeleton.map((sec, i) => (
                <div key={i} className="p-2 bg-stone-50 border border-stone-200 rounded space-y-0.5">
                  <div className="font-bold text-stone-900">#{i + 1} {sec.sectionTitleArabic}</div>
                  <div className="text-stone-600">{sec.strategicPurposeArabic}</div>
                  <div className="text-stone-500 pt-0.5">العناصر: {sec.keyElementsArabic.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 15. التجربة الأساسية الأولى الكاملة */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              15. التجربة الأساسية الأولى (Highest-Priority Experiment)
            </h2>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5 text-[11px]">
              <div><span className="font-bold text-[#A7690C]">الفرضية: </span>{aiInterpretation.primaryExperiment.hypothesisArabic}</div>
              <div><span className="font-bold text-stone-900">ليه بنختبرها؟: </span>{aiInterpretation.primaryExperiment.whyThisHypothesisMattersArabic}</div>
              <div><span className="font-bold text-stone-900">مين يدخل الاختبار؟: </span>{aiInterpretation.primaryExperiment.testAudienceArabic}</div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200">
                <div><span className="font-bold text-amber-900">هنغير إيه؟: </span>{aiInterpretation.primaryExperiment.whatToChangeArabic}</div>
                <div><span className="font-bold text-stone-700">هنثبت إيه؟: </span>{aiInterpretation.primaryExperiment.whatToKeepConstantArabic}</div>
              </div>
              {aiInterpretation.primaryExperiment.evidenceToCollectArabic && aiInterpretation.primaryExperiment.evidenceToCollectArabic.length > 0 && (
                <div><span className="font-bold text-cyan-900">هنراقب إيه؟: </span>{aiInterpretation.primaryExperiment.evidenceToCollectArabic.join(' | ')}</div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200">
                <div><span className="font-bold text-stone-900">الدليل الحالي: </span>{aiInterpretation.primaryExperiment.observedEvidenceArabic || 'لا توجد بيانات سلوكية كافية.'}</div>
                <div><span className="font-bold text-emerald-900">قاعدة القرار: </span>{aiInterpretation.primaryExperiment.decisionRuleArabic}</div>
              </div>
              {aiInterpretation.primaryExperiment.whatNotToConcludeArabic && (
                <div className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-900 text-[10px]">
                  <span className="font-bold">ما لا تستنتجه: </span>{aiInterpretation.primaryExperiment.whatNotToConcludeArabic}
                </div>
              )}
            </div>
          </div>

          {/* 16. خطة التحقق 7 أيام */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-[#A7690C] border-b border-stone-200 pb-1 font-['Cairo']">
              16. خطة التحقق على مدار 7 أيام (Sprint: {deterministic.validationSprintMode})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
              {aiInterpretation.sevenDayValidationSprint.map(d => (
                <div key={d.dayNumber} className="p-1.5 bg-stone-50 border border-stone-200 rounded flex items-start gap-1.5">
                  <span className="font-bold text-[#A7690C]">يوم {d.dayNumber}:</span>
                  <div>
                    <span className="font-bold text-stone-900">{d.titleArabic} — </span>
                    <span className="text-stone-700">{d.actionArabic}</span>
                    <div className="text-stone-500">الدليل: {d.expectedEvidenceArabic}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 17. الأدلة المفقودة والأسئلة الثلاثة التالية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-amber-50/40 border border-amber-300 rounded space-y-1">
              <span className="font-bold text-amber-900 block font-['Cairo']">17. الأدلة المفقودة ذات الأولوية (Missing Evidence)</span>
              <ul className="space-y-0.5 text-stone-700">
                {(aiInterpretation.missingEvidenceArabic || []).map((m, i) => (
                  <li key={i}>· {m}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block font-['Cairo']">18. الأسئلة الثلاثة التالية لحسم الغموض</span>
              <ul className="space-y-0.5 text-stone-700">
                {aiInterpretation.nextThreeQuestionsArabic.map((q, i) => (
                  <li key={i}>· {q}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-stone-200 text-center text-[10px] text-stone-500 font-mono">
            Mohamed Adel — Sales Funnel Architect · Offer Architecture Lab · Generated for {questionnaire.productName || 'Offer'}
          </div>
        </div>
      </div>
    </div>
  );
};

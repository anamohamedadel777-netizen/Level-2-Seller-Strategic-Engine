import React from 'react';
import { OfferPath, OfferStage } from '../types';
import { ArrowLeft, CheckCircle2, Compass } from 'lucide-react';

interface PathAndMaturitySelectorProps {
  selectedPath: OfferPath;
  selectedStage: OfferStage;
  onSelectPath: (path: OfferPath) => void;
  onSelectStage: (stage: OfferStage) => void;
  onNext: () => void;
}

const PATH_OPTIONS: { id: OfferPath; letter: string; label: string; desc: string }[] = [
  {
    id: 'OFFER_PATH_DIGITAL_PRODUCT',
    letter: 'A',
    label: 'عندي منتج رقمي وبحاول أبيعه',
    desc: 'قوالب، برمجيات، كتب، أدوات تشغيل، أو ملفات رقمية محددة النطاق.',
  },
  {
    id: 'OFFER_PATH_COURSE_PROGRAM',
    letter: 'B',
    label: 'عندي كورس أو برنامج تدريبي',
    desc: 'محتوى تدريبي مسجل أو تفاعلي يسعى لنقل مهارة أو تحقيق نتيجة تعليمية.',
  },
  {
    id: 'OFFER_PATH_SERVICE_CONSULTING',
    letter: 'C',
    label: 'عندي خدمة أو استشارة',
    desc: 'خدمة تنفيذية Done-For-You أو جلسات استشارية متخصصة ومكالمات استراتيجية.',
  },
  {
    id: 'OFFER_PATH_MEMBERSHIP',
    letter: 'D',
    label: 'عندي Membership أو اشتراك متجدد',
    desc: 'عضوية شهرية أو سنوية تعتمد على القيمة المستمرة والمجتمع والتحديثات.',
  },
  {
    id: 'OFFER_PATH_WORKSHOP_COHORT',
    letter: 'E',
    label: 'عندي Workshop / Cohort',
    desc: 'ورشة عمل مركزة أو معسكر تدريبي بمدة محددة وتفاعل مباشر مع مجموعة.',
  },
  {
    id: 'OFFER_PATH_NEW_OFFER',
    letter: 'F',
    label: 'عندي Offer جديد ولسه مجربتش أبيعه',
    desc: 'عرض تم تصميمه للتو وأريد التأكد من تماسكه الاستراتيجي قبل إطلاقه للسوق.',
  },
  {
    id: 'OFFER_PATH_LOW_CONVERSION',
    letter: 'G',
    label: 'عندي مبيعات بالفعل لكن التحويل أقل من المتوقع',
    desc: 'توجد زيارات واهتمام ولكن نسبة المشترين الفعليين ضعيفة مقارنة بالمجهود.',
  },
];

const STAGE_OPTIONS: { id: OfferStage; name: string; criteria: string }[] = [
  {
    id: 'OFFER_STAGE_0_IDEA_ONLY',
    name: 'المرحلة 0: فكرة عرض فقط (Idea Only)',
    criteria: 'مجرد تصور أو مسودة أولية لم تخرج للسوق بعد.',
  },
  {
    id: 'OFFER_STAGE_1_NOT_SOLD',
    name: 'المرحلة 1: عرض متاح لكن بلا تفاعل (Not Sold)',
    criteria: 'العرض موجود على صفحة أو منصة لكن لم يحدث أي تفاعل شرائي حقيقي.',
  },
  {
    id: 'OFFER_STAGE_2_INTEREST',
    name: 'المرحلة 2: اهتمام واستفسارات مؤهلة (Interest)',
    criteria: 'أشخاص يسألون ويهتمون ويسألون عن التفاصيل لكن لم يدفعوا.',
  },
  {
    id: 'OFFER_STAGE_3_COMMITMENT',
    name: 'المرحلة 3: خطوات شراء جادة وعربون (Commitment)',
    criteria: 'تقديم طلبات انضمام، ملء استمارات، أو إبداء نية دفع صريحة وحجز مقعد.',
  },
  {
    id: 'OFFER_STAGE_4_FIRST_SALES',
    name: 'المرحلة 4: أول مبيعات حقيقية (First Sales)',
    criteria: 'دفع 1 إلى 3 عملاء حقيقيين للمرة الأولى وتم تسليم العرض.',
  },
  {
    id: 'OFFER_STAGE_5_REPEATABLE_SALES',
    name: 'المرحلة 5: مبيعات متكررة ومستقرة (Repeatable Sales)',
    criteria: 'دفع عملاء متعددين ومبيعات متتالية تثبت قبول السوق المبدئي.',
  },
  {
    id: 'OFFER_STAGE_6_OPTIMIZATION',
    name: 'المرحلة 6: تحسين الاقتصاديات والتحويل (Optimization)',
    criteria: 'مبيعات مستقرة وجارية بالفعل والمطلوب رفع العائد وتقليل التسرب.',
  },
];

export const PathAndMaturitySelector: React.FC<PathAndMaturitySelectorProps> = ({
  selectedPath,
  selectedStage,
  onSelectPath,
  onSelectStage,
  onNext,
}) => {
  const isPathSelected = selectedPath && selectedPath !== 'OFFER_PATH_UNSELECTED';
  const isStageSelected = selectedStage && selectedStage !== 'OFFER_STAGE_UNSELECTED';
  const canProceed = Boolean(isPathSelected && isStageSelected);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-right">
        <div className="inline-flex items-center gap-2 text-xs text-[#F5BF1E] font-medium mb-2">
          <Compass className="w-4 h-4" />
          <span>تحديد مسار العرض ومستوى النضج التجاري</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FCFCFA] font-['Cairo']">
          إنت جاي تحلل إيه تحديداً؟
        </h2>
        <p className="text-sm text-[#C8C5BA] mt-2">
          اختر نوع العرض ومرحلته الحالية حتى يتكيف التحليل والأسئلة مع سياقك الواقعي دون تعميم.
        </p>
      </div>

      {/* Part 1: Path Selection */}
      <div className="space-y-3 mb-10">
        <p className="text-xs font-semibold text-[#FBD052] tracking-wide mb-2">
          الخطوة 1 من 2: نوع العرض وطبيعته
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {PATH_OPTIONS.map(opt => {
            const isSelected = selectedPath === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectPath(opt.id)}
                className={`w-full text-right p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-[#23170D] border-[#F5BF1E] shadow-[0_0_15px_rgba(245,191,30,0.15)]'
                    : 'bg-[#23170D]/40 border-[#4A2F15]/40 hover:border-[#4A2F15] hover:bg-[#23170D]/70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected ? 'bg-[#F5BF1E] text-[#040405]' : 'bg-[#4A2F15]/50 text-[#C8C5BA]'
                  }`}
                >
                  {opt.letter}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#FCFCFA]' : 'text-[#C8C5BA]'}`}>
                      {opt.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F5BF1E]" />}
                  </div>
                  <p className="text-xs text-[#797979] mt-1 leading-normal">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2: Maturity Stage */}
      <div className="space-y-3 mb-10 pt-6 border-t border-[#4A2F15]/30">
        <p className="text-xs font-semibold text-[#FBD052] tracking-wide mb-2">
          الخطوة 2 من 2: مستوى النضج والمبيعات الحالية (Offer Maturity)
        </p>
        <p className="text-xs text-[#797979] mb-4">
          ملاحظة استراتيجية: حجم المتابعين لا يعني نضج العرض. النضج يُقاس بالأدلة السلوكية وعمليات الدفع الفعلية فقط.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STAGE_OPTIONS.map(stg => {
            const isSelected = selectedStage === stg.id;
            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => onSelectStage(stg.id)}
                className={`text-right p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#23170D] border-[#F5BF1E] shadow-[0_0_12px_rgba(245,191,30,0.12)]'
                    : 'bg-[#23170D]/30 border-[#4A2F15]/30 hover:border-[#4A2F15] hover:bg-[#23170D]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#FBD052]' : 'text-[#FCFCFA]'}`}>
                    {stg.name}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F5BF1E]" />}
                </div>
                <p className="text-[11px] text-[#797979] leading-relaxed">{stg.criteria}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#4A2F15]/30">
        <div>
          {!canProceed && (
            <p className="text-xs text-[#FBD052]/90">
              يرجى اختيار مسار العرض ومرحلة النضج الحالية معاً للمتابعة.
            </p>
          )}
        </div>
        <button
          onClick={onNext}
          type="button"
          disabled={!canProceed}
          className={`px-8 py-3 text-sm font-bold rounded-md transition-all flex items-center gap-2 font-['Cairo'] ${
            canProceed
              ? 'text-[#040405] bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] hover:from-[#FBD052] hover:to-[#F5BF1E] cursor-pointer shadow-[0_4px_15px_rgba(245,191,30,0.2)]'
              : 'text-[#797979] bg-[#23170D] border border-[#4A2F15]/40 cursor-not-allowed opacity-60'
          }`}
        >
          <span>المتابعة إلى استبيان التشخيص</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

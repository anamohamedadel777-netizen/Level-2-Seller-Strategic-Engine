import React, { useState } from 'react';
import {
  QuestionnaireData,
  TriState,
  EvidenceTier,
  ValueDriver,
  ValueEvidenceStatus,
  DifferentiationEvidenceStatus,
  PricingEvidenceContext,
  ObjectionEvidenceStatus,
} from '../types';
import { ArrowLeft, ArrowRight, HelpCircle, Save } from 'lucide-react';
import { validateQuestionnaireStep } from '../lib/questionnaireValidation';

interface QuestionnaireWizardProps {
  data: QuestionnaireData;
  onChange: (data: QuestionnaireData) => void;
  onSubmit: () => void;
  onBackToMaturity: () => void;
}

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  data,
  onChange,
  onSubmit,
  onBackToMaturity,
}) => {
  // 4 Progressive Modules
  // Step 1: Context & Target Buyer (Sections A & B)
  // Step 2: Problem, Outcome & Differentiation (Sections C, D & F)
  // Step 3: Offer Components, Pricing & Decision Friction (Sections E, I & J)
  // Step 4: Proof, Objections, Risk & Traffic (Sections G, H, K & L)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const updateField = <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const currentValidation = validateQuestionnaireStep(data, currentStep);

  const handleNext = () => {
    if (!currentValidation.valid) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToMaturity();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-[#C8C5BA] mb-2.5">
          <span className="font-semibold text-[#FBD052]">
            المرحلة {currentStep} من {totalSteps}:{' '}
            {currentStep === 1 && 'سياق العرض وهوية المشتري'}
            {currentStep === 2 && 'المشكلة والنتيجة والتمايز'}
            {currentStep === 3 && 'هيكل المكونات والتسعير واحتكاك القرار'}
            {currentStep === 4 && 'الأدلة والاعتراضات والمخاطرة ومصدر الزيارات'}
          </span>
          <span className="text-[#797979] flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-[#F5BF1E]" />
            <span>حفظ تلقائي مفعّل</span>
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#23170D] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A7690C] via-[#F5BF1E] to-[#FBD052] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Sections A & B */}
      {currentStep === 1 && (
        <div className="space-y-8">
          {/* SECTION A: OFFER CONTEXT */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION A</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">سياق العرض (Offer Context)</h3>
              <p className="text-xs text-[#797979]">المعلومات الأساسية عن المنتج أو الخدمة التي تريد فحصها.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  اسم العرض أو المنتج التجاري
                </label>
                <input
                  type="text"
                  value={data.productName}
                  onChange={e => updateField('productName', e.target.value)}
                  placeholder="مثلاً: كورس احتراف الفريلانس، استشارة تحسين الفانل..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  نوع المنتج أو فئته التجارية
                </label>
                <input
                  type="text"
                  value={data.productType}
                  onChange={e => updateField('productType', e.target.value)}
                  placeholder="مثلاً: كورس مسجل، خدمة تنفيذية، قالب رقمي، عضوية..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  طريقة التسليم (Delivery Method)
                </label>
                <select
                  value={data.deliveryMethod}
                  onChange={e => updateField('deliveryMethod', e.target.value)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="not_selected">اختر طريقة التسليم...</option>
                  <option value="self-paced">محتوى رقمي ذاتي التعلم (Self-paced)</option>
                  <option value="live-cohort">مجموعة تفاعلية حية (Live Cohort)</option>
                  <option value="1-on-1">جلسات شخصية 1 على 1 (1-on-1 Sessions)</option>
                  <option value="done-for-you">تنفيذ كامل نيابة عن العميل (Done-For-You)</option>
                  <option value="hybrid">هجين (محتوى مسجل + دعم أو مكالمات)</option>
                  <option value="template-access">وصول مباشر لأداة أو قوالب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  حالة العرض الحالية
                </label>
                <input
                  type="text"
                  value={data.versionStatus}
                  onChange={e => updateField('versionStatus', e.target.value)}
                  placeholder="مثلاً: متاح للبيع حالياً، مسودة قيد التجهيز..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            {/* Live status & sales range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#4A2F15]/20">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  هل العرض معروض للبيع حالياً (Live)؟
                </label>
                <div className="flex items-center gap-2">
                  {(['YES', 'NO', 'NOT_SURE'] as TriState[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateField('isLive', st)}
                      className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                        data.isLive === st
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {st === 'YES' && 'نعم'}
                      {st === 'NO' && 'لا'}
                      {st === 'NOT_SURE' && 'غير متأكد'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  عدد العملاء الذين دفعوا بالفعل حتى الآن
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['0', '1-3', '4-10', '11-30', '31+'] as const).map(vol => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => {
                        updateField('salesVolumeRange', vol);
                        updateField('hasPaidCustomers', vol === '0' ? 'NO' : 'YES');
                      }}
                      className={`py-2 text-xs font-semibold rounded border transition-colors ${
                        data.salesVolumeRange === vol
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {vol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: TARGET BUYER */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION B</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">المشتري المستهدف (Target Buyer)</h3>
              <p className="text-xs text-[#797979]">
                مين الشخص اللي المفروض يشتري العرض تحديداً؟ تجنب الوصف العام مثل "الكل" أو "أصحاب الشركات".
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                دور وهوية المشتري بدقة (Role / Identity)
              </label>
              <input
                type="text"
                value={data.buyerRole}
                onChange={e => updateField('buyerRole', e.target.value)}
                placeholder="مثلاً: كوتش أونلاين عنده محتوى بالفعل وبيجيب Leads لكن نسبة الحجز ضعيفة..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
              <p className="text-[11px] text-[#797979] mt-1">
                تنبيه: التقييم لا يقاس بطول النص، بل بمدى خصوصية وتمييز مرحلة وسياق المشتري.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  مرحلته الحالية (Current Stage)
                </label>
                <input
                  type="text"
                  value={data.buyerStage}
                  onChange={e => updateField('buyerStage', e.target.value)}
                  placeholder="مثلاً: بيحقق 2,000$ شهرياً وعايز يستقر، أو لسه بيبدأ..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  إيه البديل اللي بيستخدمه حالياً؟ (Current Alternative)
                </label>
                <input
                  type="text"
                  value={data.buyerCurrentAlternative}
                  onChange={e => updateField('buyerCurrentAlternative', e.target.value)}
                  placeholder="مثلاً: بيعتمد على فيديوهات يوتيوب، أو شيت إكسل يدوي، أو منافس..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                الشرارة المحفزة للبحث عن حل الآن (Buying Trigger)
              </label>
              <textarea
                rows={2}
                value={data.buyerTrigger}
                onChange={e => updateField('buyerTrigger', e.target.value)}
                placeholder="إيه اللحظة أو المشكلة الحرجة اللي بتحصل وبتخليه يدور على حل بدل ما يسكت؟"
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Sections C, D & F */}
      {currentStep === 2 && (
        <div className="space-y-8">
          {/* SECTION C: CORE PROBLEM */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION C</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">المشكلة الجوهرية (Core Problem)</h3>
              <p className="text-xs text-[#797979]">
                إيه المشكلة اللي العرض بيحلها؟ وإيه اللي بيخليها تستحق الدفع بدل ما يتعايش معاها؟
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                وصف المشكلة الرئيسية بلسان العميل
              </label>
              <textarea
                rows={2}
                value={data.coreProblem}
                onChange={e => updateField('coreProblem', e.target.value)}
                placeholder="العميل بيعاني من إيه يومياً؟ ما هو الاختناق الأساسي؟"
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            {/* PROBLEM EVIDENCE STATUS */}
            <div className="p-4 bg-[#040405]/60 border border-[#F5BF1E]/30 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-[#FBD052]">
                إيه أقوى دليل عندك إن المشتري ده فعلًا بيعاني من المشكلة بالشكل اللي وصفته؟
              </label>
              <p className="text-[11px] text-[#C8C5BA]/80 mb-2">
                تنبيه حاسم: الوصف الإنشائي لا يرفع التقييم؛ النظام يميز بصرامة بين الوصف وبين الدليل السلوكي/التجاري المثبت.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'SELLER_ASSUMPTION',
                    label: 'دي فرضية مني ولسه مختبرتهاش',
                    desc: 'تصور شخصي من واقع خبرتي فقط دون اختبار مباشر',
                  },
                  {
                    id: 'BUYER_REPORTED',
                    label: 'سمعتها بشكل متكرر من عملاء محتملين',
                    desc: 'ذكروها في محادثات أو استبيانات دون التزام مالي',
                  },
                  {
                    id: 'OBSERVED_REPEATED_BEHAVIOR',
                    label: 'شايف سلوك متكرر ومحاولات فعلية لحلها',
                    desc: 'مشاركات مجتمعية، أسئلة شراء، استمارات وقوائم انتظار',
                  },
                  {
                    id: 'PAID_PROBLEM_EVIDENCE',
                    label: 'ناس دفعت بالفعل عشان تحل مشكلة قريبة',
                    desc: 'أدلة مبيعات سابقة أو دفع لمنافسين لنفس الغرض',
                  },
                ].map(opt => {
                  const isSelected = data.problemEvidenceStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('problemEvidenceStatus', opt.id as any)}
                      className={`text-right p-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#F5BF1E]/15 border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15] text-[#C8C5BA] hover:border-[#F5BF1E]/50'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between mb-1">
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-[#F5BF1E] font-mono text-[10px]">✓ محدد</span>}
                      </div>
                      <div className="text-[11px] text-[#797979]">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CURRENT WORKAROUND STATUS */}
            <div className="p-4 bg-[#040405]/60 border border-[#4A2F15] rounded-lg space-y-2">
              <label className="block text-xs font-bold text-[#FCFCFA]">
                العميل بيعمل إيه فعليًا دلوقتي عشان يحل المشكلة؟ (Current Workaround Status)
              </label>
              <p className="text-[11px] text-[#797979] mb-2">
                سلوك العميل الحالي يكشف حجم الألم الاقتصادي واستعداده للدفع مقابل حلك.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'NONE_KNOWN',
                    label: 'مش عارف بيعمل إيه حالياً / مفيش بديل معروف',
                    desc: 'لا توجد بيانات واضحة عن محاولاته الحالية',
                  },
                  {
                    id: 'PASSIVE_SUFFERING',
                    label: 'متعايش مع المشكلة بدون محاولة جادة للحل',
                    desc: 'مستسلم للألم ولم يبدأ البحث أو المحاولة',
                  },
                  {
                    id: 'DIY_MANUAL',
                    label: 'بيحاول يحلها بنفسه بطرق بدائية أو شيتات يدوية',
                    desc: 'يبذل جهداً ووقتاً كبيراً في محاولات فردية مرهقة',
                  },
                  {
                    id: 'FREE_CONTENT',
                    label: 'بيعتمد على محتوى مجاني وفيديوهات يوتيوب غير منظمة',
                    desc: 'يبحث ويجمع معلومات لكنه مشتت ويفتقر للمنهجية',
                  },
                  {
                    id: 'COMPETING_PAID',
                    label: 'مشترك في أداة أو خدمة أو كورس مدفوع لكنه غير راضٍ',
                    desc: 'دفع أموالاً بالفعل للحلول البديلة مما يثبت جاهزيته للشراء',
                  },
                  {
                    id: 'HIRING_OR_EXPENSIVE_SERVICE',
                    label: 'بيستعين بموظف أو فريلانسر بتكلفة عالية ومجهود إشرافي',
                    desc: 'يدفع تكلفة مالية مستمرة لحل مؤقت أو مكلف',
                  },
                ].map(opt => {
                  const isSelected = data.currentWorkaroundStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('currentWorkaroundStatus', opt.id as any)}
                      className={`text-right p-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#F5BF1E]/15 border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15] text-[#C8C5BA] hover:border-[#F5BF1E]/50'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between mb-1">
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-[#F5BF1E] font-mono text-[10px]">✓ محدد</span>}
                      </div>
                      <div className="text-[11px] text-[#797979]">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  معدل تكرار المشكلة (Problem Frequency)
                </label>
                <select
                  value={data.problemFrequency}
                  onChange={e => updateField('problemFrequency', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر معدل تكرار المشكلة --</option>
                  <option value="daily">يومية ملحة وتعيقه كل يوم</option>
                  <option value="weekly">أسبوعية متكررة</option>
                  <option value="occasional">تحدث في أوقات متفرقة</option>
                  <option value="not_sure">غير متأكد (مش عارف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  تكلفة عدم الحل (Cost of Inaction)
                </label>
                <input
                  type="text"
                  value={data.costOfInaction}
                  onChange={e => updateField('costOfInaction', e.target.value)}
                  placeholder="إيه اللي بيخسره العميل لو مسابها ومحلهاش؟"
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                نوع الخسارة المباشرة التي يتحملها المشتري
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'time', label: 'وقت مهدور' },
                  { id: 'money', label: 'خسارة مالية مباشرة' },
                  { id: 'missed_opportunity', label: 'فرص ضائعة' },
                  { id: 'stress', label: 'توتر وضغط نفسي' },
                  { id: 'complexity', label: 'فوضى وتعقيد' },
                  { id: 'business_risk', label: 'مخاطرة على البيزنس' },
                ].map(item => {
                  const isChecked = data.lossType.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const current = [...data.lossType];
                        if (isChecked) {
                          updateField('lossType', current.filter(x => x !== item.id) as any);
                        } else {
                          updateField('lossType', [...current, item.id] as any);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                        isChecked
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E] font-semibold'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION D: DESIRED OUTCOME */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION D</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">النتيجة المرجوة (Desired Outcome)</h3>
              <p className="text-xs text-[#797979]">
                الفارق الملموس بين واقع العميل قبل الشراء وبعده، ومدى وضوح وتحكم النتيجة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  حالة ما قبل الشراء (Before State)
                </label>
                <textarea
                  rows={2}
                  value={data.beforeState}
                  onChange={e => updateField('beforeState', e.target.value)}
                  placeholder="الوضع المحبط الحالي للعميل..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  حالة ما بعد النتيجة (After State)
                </label>
                <textarea
                  rows={2}
                  value={data.afterState}
                  onChange={e => updateField('afterState', e.target.value)}
                  placeholder="الوضع الجديد بعد نجاح التطبيق بدقة..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  مدى قابلية النتيجة للملاحظة
                </label>
                <select
                  value={data.outcomeObservability}
                  onChange={e => updateField('outcomeObservability', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر مدى الملاحظة --</option>
                  <option value="immediately_measurable">قابلة للقياس المباشر بالأرقام</option>
                  <option value="visible_over_time">تظهر تدريجياً مع الوقت</option>
                  <option value="subjective">انطباعية / شعورية</option>
                  <option value="not_sure">غير متأكد (مش عارف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  نسبة التحكم في النتيجة
                </label>
                <select
                  value={data.outcomeControllability}
                  onChange={e => updateField('outcomeControllability', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر نسبة التحكم --</option>
                  <option value="fully_controllable">متحكم فيها بالكامل من طرفنا</option>
                  <option value="joint_effort">مجهود مشترك بيننا وبين العميل</option>
                  <option value="highly_dependent_on_buyer">تعتمد بالكامل على التزام العميل</option>
                  <option value="not_sure">غير متأكد (مش عارف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  المدة لظهور أول قيمة ملموسة
                </label>
                <select
                  value={data.timeToValue}
                  onChange={e => updateField('timeToValue', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر المدة لظهور القيمة --</option>
                  <option value="same_day">في نفس اليوم</option>
                  <option value="days">خلال أيام قليلة</option>
                  <option value="weeks">خلال بضعة أسابيع</option>
                  <option value="months">خلال شهور</option>
                  <option value="unknown">غير محدد (مش عارف)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION F: DIFFERENTIATION */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION F</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">التمايز والآلية (Differentiation & Mechanism)</h3>
              <p className="text-xs text-[#797979]">
                لماذا يشتري العميل منك بدلاً من المنافسين أو المحتوى المجاني أو بناء الأمر بنفسه؟
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                نوع الآلية أو المنهجية (Mechanism Type)
              </label>
              <select
                value={data.mechanismType}
                onChange={e => updateField('mechanismType', e.target.value as any)}
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
              >
                <option value="UNSELECTED">-- اختر نوع الآلية أو المنهجية --</option>
                <option value="documented_method">منهجية خاصة موثقة ومجربة (Documented Method)</option>
                <option value="developing_method">منهجية قيد التطوير والتبلور (Developing Method)</option>
                <option value="general_expertise">اعتماد على الخبرة العامة فقط (General Expertise)</option>
                <option value="borrowed_common_method">طريقة شائعة معروفة في السوق (Common Method)</option>
                <option value="not_sure">غير متأكد (مش عارف)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                وصف الآلية الفريدة التي تفسر حدوث النتيجة
              </label>
              <textarea
                rows={2}
                value={data.mechanismDescription}
                onChange={e => updateField('mechanismDescription', e.target.value)}
                placeholder="إيه الإطار أو الخطوات المحددة التي تجعل حلك ينجح حيث تفشل البدائل التقليدية؟"
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                لماذا يختارك المشتري بدلاً من البدائل الأخرى المتاحة؟
              </label>
              <input
                type="text"
                value={data.whyNotAlternatives}
                onChange={e => updateField('whyNotAlternatives', e.target.value)}
                placeholder="مقارنة بالحلول المجانية، المنافسين، التوظيف الداخلي، أو عدم فعل شيء..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                عندك دليل إن الفرق ده مهم للمشتري فعلًا؟
              </label>
              <div className="space-y-2">
                {[
                  {
                    status: 'SELLER_BELIEF' as DifferentiationEvidenceStatus,
                    label: 'دي رؤيتي أنا للفرق ولسه مختبرتهاش',
                    desc: 'اعتقاد وتصور شخصي من جانبي حول تفوق المنهجية لم يتم اختباره مع السوق.',
                  },
                  {
                    status: 'BUYER_MENTIONED_DIFFERENCE' as DifferentiationEvidenceStatus,
                    label: 'عملاء أو محتملين ذكروا الفرق ده بنفسهم',
                    desc: 'المشترون لاحظوا الفرق وذكروه في المحادثات، لكن دون إثبات أنه حسم الشراء.',
                  },
                  {
                    status: 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE' as DifferentiationEvidenceStatus,
                    label: 'عملاء قالوا إن الفرق ده كان سبب اختيارهم',
                    desc: 'المشترون صرحوا بأن هذه الآلية المحددة كانت السبب الرئيسي لاختيار العرض.',
                  },
                  {
                    status: 'WIN_LOSS_EVIDENCE' as DifferentiationEvidenceStatus,
                    label: 'عندي قرارات شراء أو رفض فعلية توضح تأثير الفرق',
                    desc: 'أدلة واضحة من صفقات فازت وخسرت توضح كيف أثر وجود هذا الفارق على قرار الشراء.',
                  },
                  {
                    status: 'REPEATABLE_COMMERCIAL_EVIDENCE' as DifferentiationEvidenceStatus,
                    label: 'عندي دليل متكرر إن الفرق ده بيأثر على قرار الشراء',
                    desc: 'سلوك شراء متكرر ومثبت تجارياً يوضح أن المشترين يدفعون خصيصاً من أجل هذا التمايز.',
                  },
                ].map(opt => {
                  const isSelected = data.differentiationEvidenceStatus === opt.status;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => updateField('differentiationEvidenceStatus', opt.status)}
                      className={`w-full text-right p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15]/50 text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#FBD052]">{opt.label}</div>
                        {isSelected && <span className="text-[10px] text-[#F5BF1E] font-semibold">✓ محدد</span>}
                      </div>
                      <div className="text-[11px] text-[#797979] mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Sections E, I & J */}
      {currentStep === 3 && (
        <div className="space-y-8">
          {/* SECTION E: CURRENT OFFER STRUCTURE */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION E</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">هيكل العرض الحالي (Current Offer Structure)</h3>
              <p className="text-xs text-[#797979]">
                فصل المكونات الجوهرية التي تحقق النتيجة عن الحشو الإضافي الذي قد يربك المشتري.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                ما الذي يستلمه المشتري حالياً؟ (اختر كل ما ينطبق)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'videos', label: 'فيديوهات مسجلة' },
                  { id: 'live_sessions', label: 'جلسات تفاعلية حية' },
                  { id: 'templates', label: 'قوالب ونماذج جاهزة' },
                  { id: 'audits', label: 'تدقيق ومراجعة أعمال' },
                  { id: 'calls', label: 'مكالمات استشارية' },
                  { id: 'community', label: 'مجتمع ومجموعات نقاش' },
                  { id: 'tools', label: 'أدوات وبرمجيات' },
                  { id: 'done_for_you', label: 'عمل تنفيذي كامل DFY' },
                ].map(item => {
                  const isChecked = data.includedComponents.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const current = [...data.includedComponents];
                        if (isChecked) {
                          updateField('includedComponents', current.filter(x => x !== item.id));
                        } else {
                          updateField('includedComponents', [...current, item.id]);
                        }
                      }}
                      className={`p-2.5 text-xs text-right rounded border transition-colors ${
                        isChecked
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E] font-semibold'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                ما هو المكون الجوهري الأساسي الذي يحقق النتيجة؟ (Core Component)
              </label>
              <input
                type="text"
                value={data.coreComponentsDescription}
                onChange={e => updateField('coreComponentsDescription', e.target.value)}
                placeholder="الشيء الوحيد الذي لو حذفته ينهار العرض..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            {/* CORE COMPONENT OUTCOME LINK */}
            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                المكون الأساسي في العرض بيساعد العميل يوصل للنتيجة إزاي؟ (Core Component Link)
              </label>
              <textarea
                rows={2}
                value={data.coreComponentOutcomeLink}
                onChange={e => updateField('coreComponentOutcomeLink', e.target.value)}
                placeholder="اشرح كيف يترجم هذا المكون المباشر إلى تحقيق النتيجة الملموسة للعميل بدقة..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>

            {/* VALUE DRIVERS */}
            <div className="p-4 bg-[#040405]/60 border border-[#4A2F15] rounded-lg space-y-2">
              <label className="block text-xs font-bold text-[#FCFCFA]">
                العرض بيوفر للمشتري قيمة من أي نوع؟ (Value Drivers)
              </label>
              <p className="text-[11px] text-[#797979] mb-2">
                حدد كل محركات القيمة التي يحصل عليها المشتري عبر هذا العرض (يمكن اختيار أكثر من خيار).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'SAVES_TIME', label: 'توفير الوقت والمجهود' },
                  { id: 'REDUCES_COST', label: 'تقليل التكاليف والمصاريف' },
                  { id: 'INCREASES_REVENUE_POTENTIAL', label: 'زيادة فرص الدخل والمبيعات' },
                  { id: 'REDUCES_RISK', label: 'تقليل المخاطر وحماية الاستثمار' },
                  { id: 'REDUCES_COMPLEXITY', label: 'تقليل التعقيد وتسهيل العمليات' },
                  { id: 'IMPROVES_SPEED', label: 'تسريع الوصول للنتيجة' },
                  { id: 'BUILDS_CAPABILITY', label: 'بناء قدرات ومهارات ذاتية' },
                  { id: 'IMPROVES_CONVENIENCE', label: 'راحة وسهولة تامة' },
                  { id: 'IMPROVES_STATUS', label: 'تحسين المكانة والبرستيج' },
                  { id: 'OTHER', label: 'قيمة نوعية أخرى' },
                ].map(item => {
                  const isChecked = (data.valueDrivers || []).includes(item.id as ValueDriver);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const current = data.valueDrivers || [];
                        if (isChecked) {
                          updateField('valueDrivers', current.filter(x => x !== item.id));
                        } else {
                          updateField('valueDrivers', [...current, item.id as ValueDriver]);
                        }
                      }}
                      className={`p-2.5 text-xs text-right rounded border transition-colors ${
                        isChecked
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E] font-semibold'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VALUE EVIDENCE STATUS */}
            <div className="p-4 bg-[#040405]/60 border border-[#4A2F15] rounded-lg space-y-2">
              <label className="block text-xs font-bold text-[#FCFCFA]">
                إيه أقوى دليل عندك إن القيمة دي مهمة فعلًا للمشتري؟ (Value Evidence)
              </label>
              <p className="text-[11px] text-[#797979] mb-2">
                يميز المحرك بين مجرد رؤية وفرضية البائع وبين السلوك الشرائي الفعلي المثبت.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'SELLER_ASSUMPTION',
                    label: 'دي رؤيتي أنا ولسه مختبرتهاش',
                    desc: 'افتراض شخصي من البائع لم يُختبر تجارياً أو سلوكياً (يقيد القيمة بحد أقصى 60)',
                  },
                  {
                    id: 'BUYER_STATED',
                    label: 'مشتريين محتملين قالوا إن القيمة دي مهمة',
                    desc: 'تصريحات شفهية أو ردود استبيانات دون التزام مالي حقيقي',
                  },
                  {
                    id: 'OBSERVED_BEHAVIOR',
                    label: 'شايفهم بيصرفوا وقت أو مجهود أو فلوس للحصول على القيمة دي',
                    desc: 'سلوك مثبت في السوق ومحاولات عملية مدفوعة للوصول لهذه القيمة',
                  },
                  {
                    id: 'PAID_BEHAVIOR',
                    label: 'ناس دفعت بالفعل مقابل قيمة قريبة',
                    desc: 'أقوى دليل تجاري: عملاء دفعوا أموالاً فعلية مقابل هذه النتيجة أو حل مقارب',
                  },
                ].map(opt => {
                  const isSelected = data.valueEvidenceStatus === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('valueEvidenceStatus', opt.id as ValueEvidenceStatus)}
                      className={`text-right p-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#F5BF1E]/15 border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15] text-[#C8C5BA] hover:border-[#F5BF1E]/50'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between mb-1">
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-[#F5BF1E] font-mono text-[10px]">✓ محدد</span>}
                      </div>
                      <div className="text-[11px] text-[#797979]">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                ما هي الأشياء المضافة فقط بهدف تضخيم القيمة أو كـ Bonuses ثانوية؟ (Padding / Bonuses)
              </label>
              <textarea
                rows={2}
                value={data.paddingComponentsDescription}
                onChange={e => updateField('paddingComponentsDescription', e.target.value)}
                placeholder="ملفات إضافية، بونصات، مجتمع، أو أشياء أضفتها لتبرير السعر..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>
          </div>

          {/* SECTION I: PRICING CONTEXT */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION I</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">سياق التسعير (Pricing Context)</h3>
              <p className="text-xs text-[#797979]">
                فحص منطقية السعر، الأدلة على دفعه، وهل هو عائق حقيقي أم مجرد واجهة لضعف القيمة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  السعر الحالي (أو المتوقع)
                </label>
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.priceAmount}
                      onChange={e => updateField('priceAmount', e.target.value)}
                      placeholder="مثلاً: 150، 500، أو مش محدد لسه..."
                      className="flex-1 bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                    />
                    <select
                      value={data.currency}
                      onChange={e => updateField('currency', e.target.value)}
                      className="bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                    >
                      <option value="USD">USD $</option>
                      <option value="EGP">EGP ج.م</option>
                      <option value="SAR">SAR ر.س</option>
                      <option value="AED">AED د.إ</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('priceAmount', 'مش محدد لسه')}
                    className="text-[11px] text-[#FBD052] hover:underline"
                  >
                    السعر غير محدد لسه؟ اضغط هنا
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  كيف تم تحديد هذا السعر؟ (Pricing Rationale)
                </label>
                <select
                  value={data.pricingRationale}
                  onChange={e => updateField('pricingRationale', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر كيف تم تحديد هذا السعر --</option>
                  <option value="value_based">بناءً على العائد المحقق للعميل (Value-based)</option>
                  <option value="previous_sales">بناءً على مبيعات سابقة أثبتت هذا الرقم</option>
                  <option value="competitor_reference">مقارنة بأسعار المنافسين في السوق</option>
                  <option value="cost_based">حساب تكلفة ومجهود التنفيذ والوقت</option>
                  <option value="testing">اختبار استكشافي للسوق (Testing)</option>
                  <option value="intuition">بالحدس والتخمين الشخصي (Intuition)</option>
                  <option value="desired_income">بناءً على الدخل المستهدف الذي أريده</option>
                  <option value="unknown">غير محدد بعد (مش عارف)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#4A2F15]/20">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  هل دفع أي شخص هذا السعر الدقيق من قبل؟
                </label>
                <div className="flex gap-2">
                  {(['YES', 'NO', 'NOT_SURE'] as TriState[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateField('hasAnyonePaidExactPrice', st)}
                      className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                        data.hasAnyonePaidExactPrice === st
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {st === 'YES' && 'نعم'}
                      {st === 'NO' && 'لا'}
                      {st === 'NOT_SURE' && 'غير مجرب'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  هل يعترض الناس صراحة على هذا السعر؟
                </label>
                <select
                  value={data.isPriceRepeatedObjection}
                  onChange={e => updateField('isPriceRepeatedObjection', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2 text-xs text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- حدد موقف اعتراض السعر --</option>
                  <option value="ACTUAL_REPEATED">اعتراض حقيقي متكرر نسمعه صراحة</option>
                  <option value="SOMETIMES">أحياناً يذكره البعض</option>
                  <option value="ASSUMED">افتراض من جانبي فقط (لم يقله العميل صراحة)</option>
                  <option value="NO">لا يعترض أحد على السعر</option>
                  <option value="UNKNOWN">غير معروف / لم يطرح بعد (مش عارف)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#4A2F15]/20">
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                ما هو السياق الواقعي لتحديد أو اختبار هذا السعر مع المشترين؟ (Pricing Evidence Context)
              </label>
              <div className="space-y-2">
                {[
                  {
                    status: 'NO_REAL_BUYER_CONVERSATIONS' as PricingEvidenceContext,
                    label: 'لم أخض محادثات مبيعات حقيقية مع مشترين حول هذا السعر',
                    desc: 'السعر نظري حتى الآن ولم يُطرح في تفاوض أو محادثة شراء مباشرة مع مشترين.',
                  },
                  {
                    status: 'INTEREST_CONVERSATIONS_ONLY' as PricingEvidenceContext,
                    label: 'محادثات اهتمام عام واستفسارات دون إغلاق مبيعات',
                    desc: 'استفسارات عامة وتفاعل مع العرض ولكن لم يدفع أحد هذا المبلغ بعد.',
                  },
                  {
                    status: 'REAL_SALES_CONVERSATIONS' as PricingEvidenceContext,
                    label: 'محادثات مبيعات فعلية تم فيها عرض السعر ومناقشة قرارات الشراء',
                    desc: 'عُرض السعر في مكالمات أو اجتماعات بيعية حقيقية وجرى فحص ردود الأفعال واعتراضات المشتري.',
                  },
                  {
                    status: 'ACTUAL_PURCHASES' as PricingEvidenceContext,
                    label: 'عمليات شراء ودفع حقيقية ومثبتة بهذا السعر',
                    desc: 'قام مشترون بالدفع الفعلي بهذا السعر وتأكد قبول السوق التجاري له.',
                  },
                  {
                    status: 'REPEAT_PURCHASES' as PricingEvidenceContext,
                    label: 'عمليات شراء متكررة وتجديد اشتراكات مستمرة بهذا السعر',
                    desc: 'سلوك شراء متكرر وقوي يؤكد متانة السعر وقبوله التجاري الراسخ.',
                  },
                ].map(opt => {
                  const isSelected =
                    data.pricingEvidenceContext === opt.status ||
                    (opt.status === 'ACTUAL_PURCHASES' && data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE');
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => updateField('pricingEvidenceContext', opt.status)}
                      className={`w-full text-right p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15]/50 text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#FBD052]">{opt.label}</div>
                        {isSelected && <span className="text-[10px] text-[#F5BF1E] font-semibold">✓ محدد</span>}
                      </div>
                      <div className="text-[11px] text-[#797979] mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION J: DECISION FRICTION */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION J</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">احتكاك وسهولة القرار (Decision Friction)</h3>
              <p className="text-xs text-[#797979]">
                ما الخطوات التي تفصل العميل بين رؤية العرض وإتمام الدفع الفعلي؟
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  خطوة الشراء المباشرة (Checkout Step)
                </label>
                <select
                  value={data.checkoutStep}
                  onChange={e => updateField('checkoutStep', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر خطوة الشراء المباشرة --</option>
                  <option value="immediate_checkout">دفع مباشر بالبطاقة في الصفحة (Instant Checkout)</option>
                  <option value="book_call">حجز مكالمة استكشافية / تقييم (Book Call)</option>
                  <option value="application">تقديم استمارة طلب انضمام (Application)</option>
                  <option value="proposal">إرسال عرض أسعار مخصص (Proposal)</option>
                  <option value="dm">محادثة على الرسائل الخاصة / واتساب (DM)</option>
                  <option value="manual_payment">تحويل بنكي / فودافون كاش يدوي</option>
                  <option value="not_sure">غير محدد (مش عارف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  مستوى المجهود المطلوب من المشتري لإتمام القرار
                </label>
                <select
                  value={data.decisionEffortLevel}
                  onChange={e => updateField('decisionEffortLevel', e.target.value as any)}
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
                >
                  <option value="UNSELECTED">-- اختر مستوى المجهود المطلوب --</option>
                  <option value="low">منخفض (قرار سريع وبسيط)</option>
                  <option value="moderate">متوسط (يحتاج تفكيراً واستفساراً)</option>
                  <option value="high">مرتفع (قرار كبير ومعقد)</option>
                  <option value="not_sure">غير متأكد (مش عارف)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#4A2F15]/20">
              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  هل يحتاج المشتري موافقة شريك أو إدارة أو مدير للشراء؟
                </label>
                <div className="flex gap-2">
                  {(['YES', 'NO', 'NOT_SURE'] as TriState[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateField('requiresApproval', st)}
                      className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                        data.requiresApproval === st
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {st === 'YES' && 'نعم (يحتاج موافقة)'}
                      {st === 'NO' && 'لا (قراره بيده)'}
                      {st === 'NOT_SURE' && 'غير متأكد'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                  هل الخطوة التالية واضحة بنسبة 100% للمشتري؟
                </label>
                <div className="flex gap-2">
                  {(['YES', 'NO', 'NOT_SURE'] as TriState[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateField('hasNextStepClear', st)}
                      className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                        data.hasNextStepClear === st
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {st === 'YES' && 'نعم واضحة'}
                      {st === 'NO' && 'فيها غموض'}
                      {st === 'NOT_SURE' && 'غير متأكد'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Sections G, H, K & L */}
      {currentStep === 4 && (
        <div className="space-y-8">
          {/* SECTION G: PROOF */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION G</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">مستويات الإثبات (Proof Strength)</h3>
              <p className="text-xs text-[#797979]">
                تصنيف الأدلة وفق هرم المصداقية. إشارات السوق والآراء لا تعادل مبيعات حقيقية.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                ما هي الأدلة المتوفرة لديك حالياً؟ (اختر ما ينطبق فقط)
              </label>
              <div className="space-y-2">
                {[
                  {
                    tier: 'TIER_1_DIRECT_COMMERCIAL' as EvidenceTier,
                    label: 'Tier 1 — إثبات تجاري مباشر',
                    desc: 'عملاء حقيقيون دفعوا المال بالفعل، أو تكرار شراء، أو تجديد اشتراك، أو عربون.',
                  },
                  {
                    tier: 'TIER_2_OUTCOME_PROOF' as EvidenceTier,
                    label: 'Tier 2 — إثبات نتائج وتغيير ملموس',
                    desc: 'نتائج موثقة بالأرقام أو قبل/بعد لعملاء طبقوا العرض ونجحوا.',
                  },
                  {
                    tier: 'TIER_3_BEHAVIORAL_PROOF' as EvidenceTier,
                    label: 'Tier 3 — إثبات سلوكي جاد',
                    desc: 'استمارات تقديم مكتملة، طلبات ديمو، قائمة انتظار مؤهلة، أو أسئلة شراء مكررة.',
                  },
                  {
                    tier: 'TIER_4_MARKET_SIGNALS' as EvidenceTier,
                    label: 'Tier 4 — إشارات السوق العامة',
                    desc: 'منافسون يبيعون نفس الفكرة بنجاح، طلب عام في السوق، أو منشورات شائعة.',
                  },
                  {
                    tier: 'TIER_5_SELLER_BELIEF' as EvidenceTier,
                    label: 'Tier 5 — قناعة ورأي صاحب العرض فقط',
                    desc: 'أنا متأكد من جودة المنتج ولكن لم يختبره أو يدفع له أحد بعد.',
                  },
                ].map(item => {
                  const isChecked = data.evidenceTiersPresent.includes(item.tier);
                  return (
                    <button
                      key={item.tier}
                      type="button"
                      onClick={() => {
                        const current = [...data.evidenceTiersPresent];
                        if (isChecked) {
                          updateField('evidenceTiersPresent', current.filter(x => x !== item.tier));
                        } else {
                          updateField('evidenceTiersPresent', [...current, item.tier]);
                        }
                      }}
                      className={`w-full text-right p-3 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15]/50 text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#FBD052] mb-0.5">{item.label}</div>
                      <div className="text-[11px] text-[#797979]">{item.desc}</div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => updateField('evidenceTiersPresent', ['TIER_5_SELLER_BELIEF'])}
                  className="w-full text-center py-2 text-xs text-[#FBD052] border border-dashed border-[#4A2F15] rounded hover:border-[#F5BF1E] transition-colors"
                >
                  معنديش دليل أو مبيعات سابقة حالياً (صراحة وأمانة)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                تفاصيل الإثبات المتوفر لديك
              </label>
              <textarea
                rows={2}
                value={data.proofDetails}
                onChange={e => updateField('proofDetails', e.target.value)}
                placeholder="اذكر الشواهد الحقيقية: عدد العملاء، نماذج النجاح، أو اذكر بصراحة أنه لا توجد أدلة بعد..."
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
              />
            </div>
          </div>

          {/* SECTION H: OBJECTIONS */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION H</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">خريطة الاعتراضات (Objections)</h3>
              <p className="text-xs text-[#797979]">
                الفصل الصارم بين الاعتراضات التي قالها عملاء حقيقيون والاعتراضات المفترضة من طرفك.
              </p>
            </div>

            {/* Objection Evidence Status Question */}
            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                إيه مستوى الدليل اللي عندك على اعتراضات المشترين؟
              </label>
              <div className="space-y-2">
                {[
                  {
                    status: 'NO_BUYER_CONVERSATIONS' as ObjectionEvidenceStatus,
                    label: 'لسه محصلتش محادثات بيع كفاية',
                    desc: 'لم نخض نقاشات ومحادثات تفاوض حقيقية كافية مع مشترين لسماع اعتراضات موثقة.',
                  },
                  {
                    status: 'ASSUMED_OBJECTIONS_ONLY' as ObjectionEvidenceStatus,
                    label: 'دي اعتراضات أنا متوقعها لكن العملاء ما قالوهاش',
                    desc: 'افتراضات وتوقعات من جانبي لمخاوف المشتري، لكن لم يذكرها عميل حقيقي صراحة.',
                  },
                  {
                    status: 'ACTUAL_OBJECTIONS_HEARD' as ObjectionEvidenceStatus,
                    label: 'سمعت اعتراضات فعلية من عملاء أو محتملين',
                    desc: 'محادثات أو رسائل رفض مباشرة ذكر فيها مشترون محتملون أسباب ترددهم بوضوح.',
                  },
                  {
                    status: 'REPEATED_ACTUAL_OBJECTIONS' as ObjectionEvidenceStatus,
                    label: 'نفس الاعتراض اتكرر بوضوح في أكتر من محادثة بيع',
                    desc: 'اعتراض نمطي متكرر سُمع في عدة محادثات بيعية ويشكل نمطاً حقيقياً واضحاً في السوق.',
                  },
                ].map(item => {
                  const isSelected = data.objectionEvidenceStatus === item.status;
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => updateField('objectionEvidenceStatus', item.status)}
                      className={`w-full text-right p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#23170D] border-[#F5BF1E] text-[#FCFCFA]'
                          : 'bg-[#040405] border-[#4A2F15]/50 text-[#C8C5BA] hover:border-[#4A2F15]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#FBD052] mb-0.5">{item.label}</div>
                      <div className="text-[11px] text-[#797979]">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#FBD052] mb-1.5">
                  اعتراضات قالها المشترون صراحة (Actual Objections Heard)
                </label>
                <textarea
                  rows={2}
                  value={data.actualObjectionsHeard}
                  onChange={e => updateField('actualObjectionsHeard', e.target.value)}
                  placeholder="الكلمات الحقيقية التي سمعتها في المحادثات أو رسائل الرفض..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                  اعتراضات تتوقع أنهم يفكرون فيها (Assumed Objections)
                </label>
                <textarea
                  rows={2}
                  value={data.assumedObjections}
                  onChange={e => updateField('assumedObjections', e.target.value)}
                  placeholder="مخاوف تفترض وجودها ولكن لم يصرح بها عميل بعد..."
                  className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3.5 py-2.5 text-sm text-[#FCFCFA] placeholder-[#797979] focus:outline-none focus:border-[#F5BF1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                التصنيف الأساسي لأكبر عائق يمنع الشراء
              </label>
              <select
                value={data.primaryObjectionCategory}
                onChange={e => updateField('primaryObjectionCategory', e.target.value as any)}
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
              >
                <option value="UNSELECTED">-- اختر تصنيف أكبر عائق يمنع الشراء --</option>
                <option value="price">السعر والتكلفة المالية (Price)</option>
                <option value="trust">عدم تصديق الوعود أو انعدام الثقة (Trust)</option>
                <option value="time">ضيق الوقت وصعوبة التفرغ (Time)</option>
                <option value="implementation">صعوبة التطبيق والخوف من الفشل (Implementation)</option>
                <option value="need">عدم الشعور بالحاجة الملحة الآن (Urgency / Need)</option>
                <option value="complexity">تعقيد العرض وكثرة تفاصيله (Complexity)</option>
                <option value="fit">عدم التأكد هل يناسب حالتي الخاصة (Fit)</option>
                <option value="not_sure">غير متأكد (مش عارف)</option>
              </select>
            </div>
          </div>

          {/* SECTION K: RISK & TRUST */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION K</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">المخاطرة وعوامل الأمان (Risk & Trust)</h3>
              <p className="text-xs text-[#797979]">
                ما الذي يشعر المشتري بأنه يخاطر به؟ وما العناصر التي تنزع فتيل هذا الخوف؟
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-1.5">
                أكبر مخاطرة مدركة يشعر بها المشتري
              </label>
              <select
                value={data.primaryPerceivedRisk}
                onChange={e => updateField('primaryPerceivedRisk', e.target.value as any)}
                className="w-full bg-[#040405] border border-[#4A2F15] rounded-md px-3 py-2.5 text-sm text-[#FCFCFA] focus:outline-none focus:border-[#F5BF1E]"
              >
                <option value="UNSELECTED">-- اختر أكبر مخاطرة مدركة --</option>
                <option value="outcome_uncertainty">عدم اليقين من حدوث النتيجة (Outcome Uncertainty)</option>
                <option value="financial">الخسارة المالية وضياع الاستثمار (Financial Risk)</option>
                <option value="time">إهدار الوقت والجهد في محاولة فاشلة (Time Risk)</option>
                <option value="implementation">العجز عن التنفيذ والتعثر التقني (Implementation Risk)</option>
                <option value="credibility">المخاطرة بالسمعة أمام الفريق أو العائلة (Credibility Risk)</option>
                <option value="not_sure">غير متأكد (مش عارف)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                عناصر تقليل المخاطرة المتوفرة حالياً في عرضك
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'CLEAR_SCOPE', label: 'نطاق عمل ومخرجات محددة بدقة (Clear Scope)' },
                  { id: 'TRANSPARENT_EXPECTATIONS', label: 'توقعات شفافة لمن يناسبه ومن لا يناسبه (Transparent Expectations)' },
                  { id: 'COMMERCIAL_PROOF', label: 'إثبات تجاري مباشر وحالات نجاح سابقة (Commercial Proof)' },
                  { id: 'OUTCOME_PROOF', label: 'إثبات نتائج موثقة بالأرقام (Outcome Proof)' },
                  { id: 'SAMPLE', label: 'عينة مجانية أو جزء تجريبي لفحص الجودة (Sample)' },
                  { id: 'DEMO', label: 'ديمو حي أو جولة استعراضية (Demo)' },
                  { id: 'PILOT', label: 'تجربة مصغرة باشتراك أولي منخفض (Pilot)' },
                  { id: 'TRIAL', label: 'فترة تجربة مجانية أو استرداد مشروط (Trial)' },
                  { id: 'GUARANTEE', label: 'ضمان مشروط بالتطبيق الفعلي (Appropriate Guarantee)' },
                  { id: 'PAYMENT_STRUCTURE', label: 'هيكل دفعات أو مرحلي مرتبط بالإنجاز (Payment Structure)' },
                  { id: 'REFUND_POLICY', label: 'سياسة استرجاع وإلغاء واضحة (Clear Refund Policy)' },
                  { id: 'OTHER', label: 'عنصر نزع مخاطرة آخر (Other)' },
                  { id: 'none', label: 'لا توجد عناصر نزع مخاطرة حالياً (None)' },
                ].map(item => {
                  const isChecked =
                    data.currentRiskReversals.includes(item.id) ||
                    (item.id === 'CLEAR_SCOPE' && data.currentRiskReversals.includes('clear_scope')) ||
                    (item.id === 'TRANSPARENT_EXPECTATIONS' && data.currentRiskReversals.includes('transparent_faq')) ||
                    (item.id === 'DEMO' && data.currentRiskReversals.includes('demo')) ||
                    (item.id === 'PILOT' && data.currentRiskReversals.includes('pilot')) ||
                    (item.id === 'GUARANTEE' && data.currentRiskReversals.includes('guarantee'));
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        let current = [...data.currentRiskReversals];
                        if (item.id === 'none') {
                          current = ['none'];
                        } else {
                          current = current.filter(x => x !== 'none');
                          if (isChecked) {
                            current = current.filter(
                              x =>
                                x !== item.id &&
                                !(item.id === 'CLEAR_SCOPE' && x === 'clear_scope') &&
                                !(item.id === 'TRANSPARENT_EXPECTATIONS' && x === 'transparent_faq') &&
                                !(item.id === 'DEMO' && x === 'demo') &&
                                !(item.id === 'PILOT' && x === 'pilot') &&
                                !(item.id === 'GUARANTEE' && x === 'guarantee')
                            );
                          } else {
                            current.push(item.id);
                          }
                        }
                        updateField('currentRiskReversals', current);
                      }}
                      className={`p-2.5 text-right text-xs rounded border transition-colors ${
                        isChecked
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E] font-semibold'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION L: TRAFFIC CONTEXT */}
          <div className="p-6 bg-[#23170D]/40 border border-[#4A2F15]/40 rounded-xl space-y-6">
            <div className="border-b border-[#4A2F15]/30 pb-3">
              <span className="text-xs text-[#F5BF1E] font-mono">SECTION L</span>
              <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">سياق الزيارات والجمهور (Traffic Context)</h3>
              <p className="text-xs text-[#797979]">
                هل الأشخاص الذين يرون العرض مؤهلون أصلاً للشراء؟ يتيح هذا فحص هل المشكلة في العرض أم في جودة الزيارات.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                مصادر الزيارات الأساسية التي ترى العرض
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'organic', label: 'محتوى أورجانيك (سوشيال ميديا)' },
                  { id: 'paid_ads', label: 'إعلانات ممولة (Paid Ads)' },
                  { id: 'email', label: 'قائمة بريدية (Email List)' },
                  { id: 'referrals', label: 'ترشيحات وتوصيات (Referrals)' },
                  { id: 'outbound', label: 'تواصل مباشر مع عملاء (Outbound / DMs)' },
                  { id: 'community', label: 'مجتمع خاص أو جروب' },
                  { id: 'none', label: 'لا توجد زيارات مستمرة حالياً' },
                ].map(item => {
                  const isChecked = data.trafficSources.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        let current = [...data.trafficSources];
                        if (item.id === 'none') {
                          current = ['none'];
                        } else {
                          current = current.filter(x => x !== 'none');
                          if (isChecked) {
                            current = current.filter(x => x !== item.id);
                          } else {
                            current.push(item.id);
                          }
                        }
                        updateField('trafficSources', current);
                      }}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                        isChecked
                          ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E] font-semibold'
                          : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C5BA] mb-2">
                هل هؤلاء الزوار مؤهلون ولديهم ميزانية وحاجة حقيقية للحل؟ (Traffic Qualification)
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'YES', label: 'نعم مؤهلون' },
                  { id: 'PARTIALLY', label: 'مؤهلون جزئياً / خليط' },
                  { id: 'NO', label: 'غير مؤهلين (طلاب أو فضوليون)' },
                  { id: 'NOT_SURE', label: 'غير متأكد' },
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateField('isTrafficQualified', st.id as any)}
                    className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                      data.isTrafficQualified === st.id
                        ? 'bg-[#F5BF1E] text-[#040405] border-[#F5BF1E]'
                        : 'bg-[#040405] text-[#C8C5BA] border-[#4A2F15] hover:border-[#FBD052]/50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation helper notice */}
      {!currentValidation.valid && (
        <div className="mt-8 p-3.5 bg-amber-950/20 border border-amber-600/30 rounded-lg text-right text-xs">
          <span className="font-semibold text-amber-400 block mb-1">
            يرجى استكمال البيانات الضرورية التالية للمتابعة:
          </span>
          <div className="flex flex-wrap gap-2 text-amber-200/90 text-[11px]">
            {currentValidation.missing.map((m, idx) => (
              <span key={idx} className="bg-amber-900/40 px-2 py-0.5 rounded">
                · {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 pt-6 border-t border-[#4A2F15]/40 flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          type="button"
          className="px-5 py-2.5 text-xs font-semibold text-[#C8C5BA] bg-[#23170D] border border-[#4A2F15] rounded hover:text-[#FCFCFA] hover:border-[#797979] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>السابق</span>
        </button>

        <button
          onClick={handleNext}
          type="button"
          disabled={!currentValidation.valid}
          className={`px-8 py-3 text-sm font-bold text-[#040405] rounded-md transition-all flex items-center gap-2 font-['Cairo'] ${
            currentValidation.valid
              ? 'bg-gradient-to-r from-[#F5BF1E] to-[#FBD052] hover:from-[#FBD052] hover:to-[#F5BF1E] cursor-pointer shadow-[0_4px_15px_rgba(245,191,30,0.25)]'
              : 'bg-[#797979] opacity-50 cursor-not-allowed'
          }`}
        >
          <span>{currentStep === totalSteps ? 'تشغيل التحليل وهندسة العرض' : 'التالي'}</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

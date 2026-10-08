import { QuestionnaireData } from '../types';

export interface StepValidationResult {
  valid: boolean;
  missing: string[];
}

export interface FullValidationResult {
  valid: boolean;
  missing: string[];
  stepErrors: Record<number, string[]>;
}

export function isNonEmpty(str: unknown): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Validates a single step of the questionnaire wizard (1, 2, 3, or 4).
 * Distinguishes explicit user choices ('not_sure', 'unknown', 'NOT_SURE')
 * from unanswered defaults ('UNSELECTED', empty strings, empty arrays).
 */
export function validateQuestionnaireStep(data: QuestionnaireData, step: number): StepValidationResult {
  const missing: string[] = [];

  if (step === 1) {
    if (!isNonEmpty(data.productName)) missing.push('اسم العرض أو المنتج');
    if (!isNonEmpty(data.productType)) missing.push('نوع المنتج التجاري');
    if (!isNonEmpty(data.buyerRole)) missing.push('دور وهوية المشتري');
    if (!isNonEmpty(data.buyerStage)) missing.push('مرحلة المشتري الحالية');
    if (!isNonEmpty(data.buyerSituation)) missing.push('سياق معاناة المشتري اليومية');
  } else if (step === 2) {
    if (!isNonEmpty(data.coreProblem)) missing.push('المشكلة الجوهرية');
    if (!data.problemEvidenceStatus || data.problemEvidenceStatus === 'UNSELECTED') {
      missing.push('مستوى الدليل على المشكلة (فرضية أم إثبات سلوكي/تجاري)');
    }
    if (!data.currentWorkaroundStatus || data.currentWorkaroundStatus === 'UNSELECTED') {
      missing.push('طريقة تعامل العميل مع المشكلة حالياً');
    }
    if (!data.problemFrequency || data.problemFrequency === 'UNSELECTED') {
      missing.push('معدل تكرار المشكلة (Problem Frequency)');
    }
    if (!isNonEmpty(data.beforeState)) missing.push('حالة ما قبل الشراء');
    if (!isNonEmpty(data.afterState)) missing.push('حالة ما بعد النتيجة');
    if (!data.outcomeObservability || data.outcomeObservability === 'UNSELECTED') {
      missing.push('مدى قابلية النتيجة للملاحظة');
    }
    if (!data.outcomeControllability || data.outcomeControllability === 'UNSELECTED') {
      missing.push('نسبة التحكم في النتيجة');
    }
    if (!data.timeToValue || data.timeToValue === 'UNSELECTED') {
      missing.push('المدة لظهور أول قيمة ملموسة');
    }
    if (!data.mechanismType || data.mechanismType === 'UNSELECTED') {
      missing.push('نوع الآلية أو المنهجية (Mechanism Type)');
    }
    if (data.mechanismType === 'documented_method' && !isNonEmpty(data.mechanismDescription)) {
      missing.push('وصف الآلية الموثقة');
    }
    if (!data.differentiationEvidenceStatus || data.differentiationEvidenceStatus === 'UNSELECTED') {
      missing.push('مستوى الدليل على أهمية التمايز والفرق للمشتري');
    }
  } else if (step === 3) {
    if (!data.includedComponents || data.includedComponents.length === 0) {
      missing.push('اختيار مكون واحد على الأقل يستلمه العميل');
    }
    if (!isNonEmpty(data.coreComponentsDescription)) {
      missing.push('المكون الجوهري الأساسي الذي يحقق النتيجة');
    }
    if (!isNonEmpty(data.coreComponentOutcomeLink)) {
      missing.push('الرابط بين المكون الأساسي وتحقيق النتيجة المرجوة (Core Component Outcome Link)');
    }
    if (!data.valueDrivers || data.valueDrivers.length === 0) {
      missing.push('نوع القيمة التي يوفرها العرض (Value Drivers)');
    }
    if (!data.valueEvidenceStatus || data.valueEvidenceStatus === 'UNSELECTED') {
      missing.push('مستوى الدليل على أهمية القيمة للمشتري');
    }
    if (!data.pricingRationale || data.pricingRationale === 'UNSELECTED') {
      missing.push('كيف تم تحديد السعر (Pricing Rationale)');
    }
    if (!data.pricingEvidenceContext || data.pricingEvidenceContext === 'UNSELECTED') {
      missing.push('سياق تحديد أو اختبار السعر (Pricing Evidence Context)');
    }
    if (!data.hasAnyonePaidExactPrice || data.hasAnyonePaidExactPrice === 'UNSELECTED') {
      missing.push('هل دفع أي شخص هذا السعر الدقيق من قبل');
    }
    if (!data.isPriceRepeatedObjection || data.isPriceRepeatedObjection === 'UNSELECTED') {
      missing.push('موقف اعتراض السعر من المشترين');
    }
    if (!data.checkoutStep || data.checkoutStep === 'UNSELECTED') {
      missing.push('خطوة الشراء المباشرة (Checkout Step)');
    }
    if (!data.decisionEffortLevel || data.decisionEffortLevel === 'UNSELECTED') {
      missing.push('مستوى المجهود لإتمام القرار (Decision Effort)');
    }
    if (!data.requiresApproval || data.requiresApproval === 'UNSELECTED') {
      missing.push('هل يحتاج المشتري موافقة شريك أو إدارة');
    }
    if (!data.hasNextStepClear || data.hasNextStepClear === 'UNSELECTED') {
      missing.push('وضوح الخطوة التالية للمشتري بنسبة 100%');
    }
  } else if (step === 4) {
    if (!data.evidenceTiersPresent || data.evidenceTiersPresent.length === 0) {
      missing.push('تحديد مستوى الإثبات (أو اختيار "معنديش دليل حالياً")');
    }
    if (!data.objectionEvidenceStatus || data.objectionEvidenceStatus === 'UNSELECTED') {
      missing.push('مستوى الدليل على اعتراضات المشترين (Objection Evidence Status)');
    }
    if (
      (data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD' ||
        data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS') &&
      !isNonEmpty(data.actualObjectionsHeard)
    ) {
      missing.push('نصوص الاعتراضات الفعلية التي سمعتها صراحة من المشترين');
    }
    if (
      data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY' &&
      !isNonEmpty(data.assumedObjections)
    ) {
      missing.push('تفاصيل الاعتراضات المتوقعة أو المفترضة من طرفك');
    }
    // When objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS', neither actual nor assumed text is required (valid explicit state)
    if (!data.primaryObjectionCategory || data.primaryObjectionCategory === 'UNSELECTED') {
      missing.push('التصنيف الأساسي لأكبر عائق يمنع الشراء');
    }
    if (!data.primaryPerceivedRisk || data.primaryPerceivedRisk === 'UNSELECTED') {
      missing.push('أكبر مخاطرة مدركة يشعر بها المشتري');
    }
    if (!data.trafficSources || data.trafficSources.length === 0) {
      missing.push('مصدر الزيارات (أو اختيار "لا توجد زيارات حالياً")');
    }
    if (!data.isTrafficQualified || data.isTrafficQualified === 'UNSELECTED') {
      missing.push('مدى تأهيل الزوار');
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Validates the full questionnaire including global context (offerPath & offerStage)
 * and all 4 steps of the wizard.
 * Returns complete status and breakdown per step (step 0 for global context).
 */
export function validateFullQuestionnaire(data: QuestionnaireData): FullValidationResult {
  const stepErrors: Record<number, string[]> = {};
  const allMissing: string[] = [];

  // GLOBAL CONTEXT VALIDATION: offerPath & offerStage
  const globalMissing: string[] = [];
  if (!data.offerPath || data.offerPath === 'OFFER_PATH_UNSELECTED') {
    globalMissing.push('نوع العرض');
  }
  if (!data.offerStage || data.offerStage === 'OFFER_STAGE_UNSELECTED') {
    globalMissing.push('مرحلة نضج العرض');
  }

  if (globalMissing.length > 0) {
    stepErrors[0] = globalMissing;
    allMissing.push(...globalMissing);
  }

  // PROGRESSIVE STEPS VALIDATION: Steps 1 through 4
  for (let s = 1; s <= 4; s++) {
    const res = validateQuestionnaireStep(data, s);
    if (!res.valid) {
      stepErrors[s] = res.missing;
      allMissing.push(...res.missing);
    }
  }

  return {
    valid: allMissing.length === 0,
    missing: allMissing,
    stepErrors,
  };
}

/**
 * Production source of truth for whether a questionnaire can be submitted.
 */
export function canSubmitQuestionnaire(data: QuestionnaireData): boolean {
  return validateFullQuestionnaire(data).valid;
}

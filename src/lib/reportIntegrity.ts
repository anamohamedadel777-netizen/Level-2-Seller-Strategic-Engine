import {
  QuestionnaireData,
  DeterministicDiagnosis,
  AIStrategicInterpretation,
  ReportIntegrityViolation,
  ReportIntegrityResult,
  StrategicDecision,
  FunnelReadiness,
  PositioningStatus,
  ValuePropositionStatus,
} from '../types';

/**
 * Deterministically derives the core Strategic Decision based on quantitative bottlenecks,
 * evidence status, and maturity stage.
 */
export function deriveStrategicDecision(
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): { decision: StrategicDecision; explanationArabic: string } {
  // Rule 1: Traffic is the true bottleneck
  if (
    diagnosis.trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK' ||
    diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
  ) {
    return {
      decision: 'FIX_TRAFFIC_FIRST',
      explanationArabic:
        'العرض متماسك بدرجة كافية، ولا أنصح بإعادة بناء العرض بالكامل قبل اختباره على جمهور مؤهل يبحث بنشاط عن الحل ويمتلك ميزانية حقيقية.',
    };
  }

  // Rule 2: Lack of empirical proof
  if (diagnosis.primaryBottleneck === 'PROOF') {
    return {
      decision: 'STRENGTHEN_PROOF',
      explanationArabic:
        'المشتري يستوعب العرض لكنه يشك في واقعية النتيجة؛ الأولوية القصوى هي توثيق أول دراسة حالة أو إثبات ملموس بدلاً من تضخيم الوعود الإنشائية.',
    };
  }

  // Rule 3: High complexity / friction
  if (diagnosis.primaryBottleneck === 'OFFER_COMPLEXITY') {
    return {
      decision: 'SIMPLIFY_OFFER',
      explanationArabic:
        'العرض محشو بمكونات ترفع من مجهود التنفيذ المتصور لدى المشتري؛ يجب اختصار النطاق وحذف الحشو للتركيز على نتيجة واحدة واضحة.',
    };
  }

  // Rule 4: Mature offer with solid metrics
  if (
    data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES' ||
    data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION'
  ) {
    if (diagnosis.offerStrengthScore >= 75) {
      return {
        decision: 'READY_FOR_FUNNEL_ARCHITECTURE',
        explanationArabic:
          'العرض مثبت تجارياً ويملك أدلة مبيعات متكررة؛ أصبح جاهزاً لبناء فانل متكامل وتوسيع حملات الاستحواذ بثقة.',
      };
    }
    return {
      decision: 'OPTIMIZE_CONVERSION',
      explanationArabic:
        'العرض يولد مبيعات ولكن هناك نقاط تسرب في اقتصاديات التحويل؛ التركيز الآن على تحسين هوامش الربح ومعالجة الاعتراضات المتكررة.',
    };
  }

  // Rule 5: Early ideation / no sales
  if (
    data.offerStage === 'OFFER_STAGE_0_IDEA_ONLY' ||
    data.offerStage === 'OFFER_STAGE_1_NOT_SOLD'
  ) {
    if (
      diagnosis.primaryBottleneck === 'BUYER_CLARITY' ||
      diagnosis.primaryBottleneck === 'PROBLEM_VALUE'
    ) {
      return {
        decision: 'REFINE_BEFORE_SELLING',
        explanationArabic:
          'الشريحة المستهدفة أو المشكلة بحاجة إلى تحديد أكثر دقة قبل طرح العرض للبيع، لتجنب استنزاف الوقت في عرض حل لمشكلة غير ملحة.',
      };
    }
    return {
      decision: 'KEEP_AND_VALIDATE',
      explanationArabic:
        'حافظ على هيكل العرض البسيط وابدأ فوراً اختبار الرغبة الحقيقية للشراء عبر محادثات اكتشافية وطلب عربون رمزي.',
    };
  }

  // Rule 6: Testing / first sales with bottlenecks
  return {
    decision: 'TEST_BEFORE_REBUILDING',
    explanationArabic:
      'لا تعيد صياغة العرض عشوائياً؛ قم بتشغيل تجربة واحدة موجهة لاختبار العائق الأساسي قبل إجراء أي تغييرات جذرية.',
  };
}

/**
 * Deterministically derives Funnel Readiness based on commercial validation and stage.
 */
export function deriveFunnelReadiness(
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): FunnelReadiness {
  if (
    data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES' ||
    data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION'
  ) {
    return diagnosis.offerStrengthScore >= 70 && diagnosis.confidenceRating === 'HIGH'
      ? 'OPTIMIZATION_READY'
      : 'OFFER_READY';
  }

  if (
    data.offerStage === 'OFFER_STAGE_3_COMMITMENT' ||
    data.offerStage === 'OFFER_STAGE_4_FIRST_SALES'
  ) {
    return diagnosis.offerStrengthScore >= 65 ? 'OFFER_READY' : 'VALIDATION_FIRST';
  }

  return data.hasPaidCustomers === 'YES' ? 'VALIDATION_FIRST' : 'NOT_READY';
}

/**
 * Deterministically derives Positioning Status based on buyer clarity & commercial fit.
 */
export function derivePositioningStatus(
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): PositioningStatus {
  const buyerFitScore = diagnosis.dimensionScores.buyer_offer_fit?.score ?? 0;
  if (buyerFitScore >= 75 && data.hasPaidCustomers === 'YES') {
    return 'VALIDATED_DIRECTION';
  }
  if (buyerFitScore >= 50) {
    return 'STRATEGIC_DIRECTION';
  }
  if (buyerFitScore >= 25) {
    return 'PROVISIONAL_HYPOTHESIS';
  }
  return 'INSUFFICIENT_EVIDENCE';
}

/**
 * Deterministically derives Value Proposition Status based on value evidence.
 */
export function deriveValuePropositionStatus(
  data: QuestionnaireData
): ValuePropositionStatus {
  if (data.valueEvidenceStatus === 'PAID_BEHAVIOR') {
    return 'SUPPORTED';
  }
  if (
    data.valueEvidenceStatus === 'BUYER_STATED' ||
    data.valueEvidenceStatus === 'OBSERVED_BEHAVIOR'
  ) {
    return 'PARTIALLY_SUPPORTED';
  }
  if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') {
    return 'HYPOTHESIS';
  }
  return 'INSUFFICIENT_EVIDENCE';
}

/**
 * Derives prioritized list of top 3 to 5 critical missing evidence gaps.
 */
export function deriveMissingEvidence(
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): string[] {
  const list: string[] = [];

  // Objections gap
  if (data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS') {
    list.push('غياب محادثات حقيقية مع مشترين محتملين لرصد الاعتراضات الميدانية الفعلية.');
  } else if (data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') {
    list.push('الاعتراضات الحالية مبنية على افتراضات البائع الذاتية ولم يتم تأكيدها في السوق.');
  }

  // Pricing gap
  if (
    data.pricingEvidenceContext === 'NO_REAL_BUYER_CONVERSATIONS' ||
    data.hasAnyonePaidExactPrice !== 'YES'
  ) {
    list.push('عدم وجود أي مشتري دفع هذا السعر الدقيق حتى الآن (السعر ما زال فرضية غير مثبتة).');
  }

  // Differentiation gap
  if (data.differentiationEvidenceStatus === 'SELLER_BELIEF') {
    list.push('التمايز يعتمد على اعتقاد شخصي للبائع دون تأكيد صريح من المشترين بأنه سبب اختيارهم.');
  }

  // Proof gap
  const hasProof =
    data.evidenceTiersPresent &&
    data.evidenceTiersPresent.length > 0 &&
    data.evidenceTiersPresent.some(t => t.includes('TIER_1') || t.includes('TIER_2'));
  if (!hasProof) {
    list.push('غياب إثبات تجاري أو نتائج عملاء سابقة موثقة بالأرقام (Tier 1 أو Tier 2 Proof).');
  }

  // Value gap
  if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') {
    list.push('عرض القيمة والعائد المتوقع فرضية نظرية لم تُختبر بعد بسلوك شرائي حقيقي.');
  }

  // Problem gap
  if (data.problemEvidenceStatus === 'SELLER_ASSUMPTION') {
    list.push('شدة المشكلة واستعداد السوق للدفع لحلها لم يتم التحقق منهما ميدانياً.');
  }

  // Traffic gap
  if (data.isTrafficQualified === 'NO' || data.isTrafficQualified === 'NOT_SURE') {
    list.push('نوعية ومصدر الزيارات الحالية غير مؤكدة، مما يشوش على قياس قبول العرض.');
  }

  return list.slice(0, 5);
}

/**
 * Validates any AI-generated report against the empirical evidence and deterministic diagnosis,
 * catching violations and safely repairing them into an evidence-compliant output.
 */
export function validateReportAgainstEvidence(
  aiReport: AIStrategicInterpretation,
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): ReportIntegrityResult {
  const violations: ReportIntegrityViolation[] = [];

  // Deep clone to create pristine repaired report
  const repaired: AIStrategicInterpretation = JSON.parse(JSON.stringify(aiReport));

  // ----------------------------------------------------
  // 1. Enforce Objection Evidence Integrity
  // ----------------------------------------------------
  if (data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS') {
    if (repaired.objectionMap?.actualObjections && repaired.objectionMap.actualObjections.length > 0) {
      violations.push({
        code: 'FAKE_ACTUAL_OBJECTION',
        severity: 'CRITICAL',
        field: 'objectionMap.actualObjections',
        message: 'تم توليد اعتراضات فعلية مع أن البائع لم يجرِ أي محادثات مع مشترين.',
        recommendedAction: 'تفريغ مصفوفة الاعتراضات الفعلية تماماً.',
      });
      repaired.objectionMap.actualObjections = [];
    }
    repaired.objectionMap.assumedObjections = [];
    if (!repaired.objectionMap.unansweredObjections || repaired.objectionMap.unansweredObjections.length === 0) {
      repaired.objectionMap.unansweredObjections = [
        {
          objection: 'لم يتم رصد أي اعتراضات بعد لعدم إجراء محادثات حقيقية مع مشترين محتملين.',
          strategicAdvice: 'إجراء ما لا يقل عن 5 محادثات استكشافية حية لتسجيل الشكوك والتردد الحقيقي بدلاً من التخمين.',
        },
      ];
    }
  } else if (data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') {
    if (repaired.objectionMap?.actualObjections && repaired.objectionMap.actualObjections.length > 0) {
      violations.push({
        code: 'ASSUMPTION_CONVERTED_TO_FACT',
        severity: 'CRITICAL',
        field: 'objectionMap.actualObjections',
        message: 'تم تحويل اعتراض مفترض بالحدس إلى اعتراض فعلي مؤكد من عملاء.',
        recommendedAction: 'نقل المحتوى إلى الاعتراضات المفترضة وتفريغ الاعتراضات الفعلية.',
      });
      // Move any real text to assumed if assumed was empty
      if (
        (!repaired.objectionMap.assumedObjections || repaired.objectionMap.assumedObjections.length === 0) &&
        repaired.objectionMap.actualObjections[0]?.objection
      ) {
        repaired.objectionMap.assumedObjections = [
          {
            ...repaired.objectionMap.actualObjections[0],
            belief: 'افتراض ذاتي من البائع حول تردد المشتري، يحتاج إلى تحقق سلوكي في السوق.',
          },
        ];
      }
      repaired.objectionMap.actualObjections = [];
    }
  }

  // ----------------------------------------------------
  // 2. Enforce Differentiation Evidence Integrity
  // ----------------------------------------------------
  if (data.differentiationEvidenceStatus === 'SELLER_BELIEF') {
    const forbiddenDiffKeywords = [
      'حاجز تنافسي مؤكد',
      'ميزة مثبتة تجارياً',
      'مثبت تجارياً',
      'ميزة مثبتة',
      'دفاعي قوي',
      'حاجز منيع',
      'مؤكد',
      'مثبت',
    ];

    let hadForbiddenDiffClaim = false;
    if (repaired.differentiationMap?.differentAndValuableArabic) {
      repaired.differentiationMap.differentAndValuableArabic = repaired.differentiationMap.differentAndValuableArabic.map(
        item => {
          let cleaned = item;
          for (const kw of forbiddenDiffKeywords) {
            if (cleaned.includes(kw)) {
              hadForbiddenDiffClaim = true;
              cleaned = cleaned.replace(new RegExp(kw, 'g'), 'فرضية');
            }
          }
          if (!cleaned.includes('فرضية') && !cleaned.includes('يحتاج تحقق') && !cleaned.includes('قيد الاختبار')) {
            cleaned = `${cleaned} [فرضية تمايز تحتاج تحققاً من المشتري]`;
          }
          return cleaned;
        }
      );
    }

    if (repaired.differentiationMap?.potentiallyDefensibleArabic) {
      repaired.differentiationMap.potentiallyDefensibleArabic = repaired.differentiationMap.potentiallyDefensibleArabic.map(
        item => {
          let cleaned = item;
          for (const kw of forbiddenDiffKeywords) {
            if (cleaned.includes(kw)) {
              hadForbiddenDiffClaim = true;
              cleaned = cleaned.replace(new RegExp(kw, 'g'), 'غير مثبت بعد');
            }
          }
          if (!cleaned.includes('اعتقاد') && !cleaned.includes('غير مثبت') && !cleaned.includes('يحتاج')) {
            cleaned = 'عنصر التمايز المطروح يعتمد حالياً على اعتقاد البائع الذاتي ولم يثبت بعد كحاجز تنافسي في السوق.';
          }
          return cleaned;
        }
      );
    }

    if (hadForbiddenDiffClaim) {
      violations.push({
        code: 'UNSUPPORTED_BUYER_VALUED_DIFFERENTIATION',
        severity: 'HIGH',
        field: 'differentiationMap',
        message: 'تم وصف التمايز بأنه ذو قيمة مثبتة أو قابل للدفاع مع أن دليله اعتقاد شخصي للبائع فقط.',
        recommendedAction: 'إعادة صياغة التمايز كفرضية هيكلية تحتاج اختباراً من المشتري.',
      });
    }
  }

  // ----------------------------------------------------
  // 3. Enforce Value Evidence Integrity & General Fabricated Metric Check
  // ----------------------------------------------------
  const derivedValStatus = deriveValuePropositionStatus(data);
  if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') {
    repaired.valuePropositionStatus = 'HYPOTHESIS';
    repaired.valueProposition.isHypothesis = true;
  } else {
    repaired.valuePropositionStatus = derivedValStatus;
  }

  // General Fabricated Metric Scanner across strategic fields
  const qEvidenceText = [
    data.proofDetails || '',
    String(data.priceAmount || ''),
    data.coreProblem || '',
    data.afterState || '',
    data.coreComponentsDescription || '',
  ].join(' ');

  const fieldsToScanForMetrics: { path: string; text: string; setter: (val: string) => void }[] = [
    {
      path: 'valueProposition.customerValueArabic',
      text: repaired.valueProposition?.customerValueArabic || '',
      setter: val => { repaired.valueProposition.customerValueArabic = val; },
    },
    {
      path: 'valueProposition.businessValueArabic',
      text: repaired.valueProposition?.businessValueArabic || '',
      setter: val => { repaired.valueProposition.businessValueArabic = val; },
    },
    {
      path: 'offerRebuild.corePromiseDirectionArabic',
      text: repaired.offerRebuild?.corePromiseDirectionArabic || '',
      setter: val => { repaired.offerRebuild.corePromiseDirectionArabic = val; },
    },
    {
      path: 'pricingStrategicAdvice.verdictArabic',
      text: repaired.pricingStrategicAdvice?.verdictArabic || '',
      setter: val => { repaired.pricingStrategicAdvice.verdictArabic = val; },
    },
  ];

  const fabricatedRegex = /(\d{1,3}%|\d+(\.\d+)?\s*[xX]|\d+\s*أضعاف|أرباح مضاعفة|عائد مؤكد|وفر \d+%)/gi;

  for (const item of fieldsToScanForMetrics) {
    const matches = item.text.match(fabricatedRegex);
    if (matches && matches.length > 0) {
      let isFabricated = false;
      for (const m of matches) {
        if (!qEvidenceText.includes(m.trim())) {
          isFabricated = true;
          break;
        }
      }

      if (isFabricated) {
        violations.push({
          code: 'FABRICATED_METRIC',
          severity: 'HIGH',
          field: item.path,
          message: `تم ادعاء نسب أو مضاعفات كمية مصطنعة (${matches.join(', ')}) دون وجود دليل مالي أو سلوكي مثبت في الاستبيان.`,
          recommendedAction: 'إزالة النسب والمضاعفات وتأطير القيمة كفرضية نفعية نوعية.',
        });

        // Clean out fabricated metrics into qualitative phrasing
        let cleaned = item.text
          .replace(fabricatedRegex, 'نتائج نوعية ملموسة')
          .replace(/أرباح مضاعفة/g, 'تحسين العائد')
          .replace(/عائد مؤكد/g, 'قيمة تجارية مرجوة');

        if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION' && !cleaned.includes('فرضية')) {
          cleaned = `[فرضية قيد التحقق]: ${cleaned}`;
        }
        item.setter(cleaned);
      }
    }
  }

  if (
    data.valueEvidenceStatus === 'SELLER_ASSUMPTION' &&
    !repaired.valueProposition.customerValueArabic.includes('فرضية') &&
    !repaired.valueProposition.customerValueArabic.includes('قيد')
  ) {
    repaired.valueProposition.customerValueArabic = `[فرضية قيد التحقق]: ${repaired.valueProposition.customerValueArabic}`;
  }

  // ----------------------------------------------------
  // 4. Enforce Problem Evidence Integrity
  // ----------------------------------------------------
  if (data.problemEvidenceStatus === 'SELLER_ASSUMPTION') {
    if (
      repaired.offerRebuild?.coreProblemArabic &&
      !repaired.offerRebuild.coreProblemArabic.includes('الفرضية') &&
      !repaired.offerRebuild.coreProblemArabic.includes('افتراض')
    ) {
      // Gentle prefix
      repaired.offerRebuild.coreProblemArabic = `الفرضية الحالية: ${repaired.offerRebuild.coreProblemArabic}`;
    }
  }

  // ----------------------------------------------------
  // 5. Enforce Pricing Diagnosis Consistency
  // ----------------------------------------------------
  if (diagnosis.pricingDiagnosisCategory === 'PRICE_NOT_YET_DIAGNOSABLE') {
    const invalidPriceClaims = ['السعر مناسب تماماً', 'السعر ممتاز ومثبت', 'السعر مرتفع جداً', 'السعر رخيص'];
    let hasInvalidPriceClaim = false;
    for (const claim of invalidPriceClaims) {
      if (repaired.pricingStrategicAdvice?.verdictArabic?.includes(claim)) {
        hasInvalidPriceClaim = true;
      }
    }
    if (hasInvalidPriceClaim) {
      violations.push({
        code: 'UNSUPPORTED_PRICE_VALIDATION',
        severity: 'HIGH',
        field: 'pricingStrategicAdvice.verdictArabic',
        message: 'الحكم على السعر بأنه مناسب أو مرتفع مع أن حالة التشخيص PRICE_NOT_YET_DIAGNOSABLE.',
        recommendedAction: 'إعادة الحكم إلى التأكيد على أن السعر لم يُختبر بعد بما يكفي للحكم عليه.',
      });
      repaired.pricingStrategicAdvice.verdictArabic =
        'السعر لم يُختبر بعد بما يكفي في محادثات أو مبيعات حقيقية للحكم عليه، فلا تغيره بناءً على انطباعات عابرة.';
    }
  }

  // ----------------------------------------------------
  // 6. Enforce Guarantee Safety
  // ----------------------------------------------------
  const isHighBuyerDependency =
    data.outcomeControllability === 'highly_dependent_on_buyer' ||
    data.outcomeControllability === 'not_sure';
  const hasStrongProof =
    data.evidenceTiersPresent &&
    data.evidenceTiersPresent.some(t => t.includes('TIER_1') || t.includes('TIER_2'));

  if (isHighBuyerDependency || !hasStrongProof) {
    const unsafeGuaranteeWords = ['ضمان استرداد نقدي كامل', 'ضمان استرداد بدون شروط', 'ضمان نتيجة 100%', 'ضمان تحقيق النتيجة'];
    let hadUnsafeGuarantee = false;
    for (const ug of unsafeGuaranteeWords) {
      if (
        repaired.riskReductionStrategy?.guaranteeSuitabilityArabic?.includes(ug) ||
        repaired.riskReductionStrategy?.recommendedApproachArabic?.includes(ug)
      ) {
        hadUnsafeGuarantee = true;
      }
    }

    if (hadUnsafeGuarantee || repaired.riskReductionStrategy?.guaranteeSuitabilityArabic?.includes('Action-Based Guarantee')) {
      violations.push({
        code: 'UNSUPPORTED_GUARANTEE',
        severity: 'HIGH',
        field: 'riskReductionStrategy',
        message: 'التوصية بضمان نتيجة أو استرداد نقدي لعرض يعتمد بشدة على المشتري أو يفتقر للإثبات الكافي.',
        recommendedAction: 'توجيه نزع المخاطرة نحو النطاق الواضح والعينات بدلاً من الضمان المالي الخطير.',
      });
      repaired.riskReductionStrategy.guaranteeSuitabilityArabic =
        'لا أنصح بضمان النتيجة حاليًا. قلل المخاطرة من خلال نطاق واضح، توقعات واضحة، Demo، Pilot، Sample أو Proof مناسب.';
      repaired.riskReductionStrategy.recommendedApproachArabic =
        'تقليل المخاطرة من خلال توضيح ما بداخل العرض بشفافية وفلترة من لا يناسبه العرض، بدلاً من إطلاق ضمانات مالية خطرة.';
    }
  }

  // ----------------------------------------------------
  // 7. Enforce Bonus Contradiction Safety
  // ----------------------------------------------------
  const noBonusVerdict =
    repaired.bonusLogic?.bonusStatusVerdictArabic?.includes('مش محتاج') ||
    repaired.bonusLogic?.bonusStatusVerdictArabic?.includes('لا يحتاج') ||
    repaired.bonusLogic?.bonusStatusVerdictArabic?.includes('التوقف عن إضافة') ||
    diagnosis.complexityLevel === 'HIGH' ||
    diagnosis.complexityLevel === 'VERY_HIGH';

  if (noBonusVerdict && repaired.bonusLogic?.recommendedBonuses?.length > 0) {
    violations.push({
      code: 'BONUS_CONTRADICTION',
      severity: 'WARNING',
      field: 'bonusLogic.recommendedBonuses',
      message: 'العرض حُكم عليه بأنه لا يحتاج بونص، ومع ذلك تم إرجاع بونص مقترح.',
      recommendedAction: 'تفريغ مصفوفة البونصات الموصى بها تماماً.',
    });
    repaired.bonusLogic.recommendedBonuses = [];
    if (!repaired.bonusLogic.bonusStatusVerdictArabic?.includes('مش محتاج')) {
      repaired.bonusLogic.bonusStatusVerdictArabic =
        'العرض لا يحتاج أي Bonus إضافي حالياً؛ الأولوية لتركيز المشتري على العرض الجوهري وتقليل عبء التنفيذ.';
    }
  }

  // ----------------------------------------------------
  // 7.1 Enforce Invented Component Integrity (Offer Stack)
  // ----------------------------------------------------
  const COMPONENT_KEYWORDS_MAP: Record<string, string[]> = {
    videos: ['فيديو', 'تسجيل', 'مسجل', 'فيديوهات', 'محاضر'],
    live_sessions: ['جلسات', 'مباشر', 'لايف', 'تفاعلية'],
    templates: ['نماذج', 'قوالب', 'تمبلت', 'شيت', 'ملفات'],
    audits: ['مراجعة', 'تدقيق', 'أوديت', 'فحص'],
    calls: ['مكالمات', 'استشارات', 'مكالمة', 'جلسة'],
    community: ['مجتمع', 'جروب', 'كوميونيتي', 'تواصل'],
    tools: ['أدوات', 'برامج', 'سوفتوير', 'تول'],
    done_for_you: ['تنفيذ بالنيابة', 'تنفيذ كامل', 'dfy', 'خدمة'],
    support: ['دعم', 'متابعة', 'خدمة عملاء'],
  };

  const userEvidenceTokens: string[] = [
    ...(data.includedComponents || []).flatMap(c => COMPONENT_KEYWORDS_MAP[c] || [c]),
    data.coreComponentsDescription || '',
    data.paddingComponentsDescription || '',
    data.productName || '',
    data.productType || '',
    data.deliveryMethod || '',
    data.mechanismDescription || '',
  ]
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);

  if (repaired.offerStack) {
    const isComponentInvented = (comp: string): boolean => {
      if (!comp || comp.trim().length === 0) return false;
      const compLower = comp.toLowerCase();
      // Check for clearly invented offerings unmentioned by user
      const isSuspicious =
        compLower.includes('معسكر') ||
        compLower.includes('إقامة') ||
        compLower.includes('تطبيق جوال') ||
        compLower.includes('نظام سحابي') ||
        compLower.includes('برنامج 8 أسابيع') ||
        compLower.includes('برنامج تدريبي متقدم') ||
        compLower.includes('مخترع') ||
        compLower.includes('invented');

      const matchesEvidence = userEvidenceTokens.some(tok => compLower.includes(tok));
      return isSuspicious && !matchesEvidence;
    };

    const coreComps = repaired.offerStack.coreComponents || [];
    const suppComps = repaired.offerStack.supportingComponents || [];
    const optComps = repaired.offerStack.optionalComponents || [];

    const inventedInCore = coreComps.filter(isComponentInvented);
    const inventedInSupp = suppComps.filter(isComponentInvented);
    const inventedInOpt = optComps.filter(isComponentInvented);
    const allInvented = [...inventedInCore, ...inventedInSupp, ...inventedInOpt];

    if (allInvented.length > 0) {
      violations.push({
        code: 'INVENTED_EXISTING_COMPONENT',
        severity: 'WARNING',
        field: 'offerStack',
        message: `تم رصد مكون (${allInvented.join(', ')}) غير موجود في مدخلات الاستبيان الحالية.`,
        recommendedAction: 'نقل المكون إلى المكونات المقترحة للاختبار المستقبلي (recommendedComponentsToTest) أو حذفه لعدم تضخيم العرض.',
      });

      const validCore = coreComps.filter(c => !isComponentInvented(c));
      repaired.offerStack.coreComponents = validCore.length > 0
        ? validCore
        : [data.coreComponentsDescription?.trim() || data.productType || 'المكون الرئيسي لتسليم النتيجة'];
      repaired.offerStack.supportingComponents = suppComps.filter(c => !isComponentInvented(c));
      repaired.offerStack.optionalComponents = optComps.filter(c => !isComponentInvented(c));
      repaired.offerStack.recommendedComponentsToTest = [
        ...(repaired.offerStack.recommendedComponentsToTest || []),
        ...allInvented,
      ];
    }
  }

  // ----------------------------------------------------
  // 8. Enforce Strategic Decision & Funnel Readiness Alignment
  // ----------------------------------------------------
  const { decision: expectedDecision, explanationArabic: expectedExplanation } =
    deriveStrategicDecision(data, diagnosis);
  const expectedReadiness = deriveFunnelReadiness(data, diagnosis);
  const expectedPositioningStatus = derivePositioningStatus(data, diagnosis);

  if (repaired.strategicDecision !== expectedDecision) {
    violations.push({
      code: 'STRATEGIC_DECISION_MISMATCH',
      severity: 'HIGH',
      field: 'strategicDecision',
      message: `القرار المقترح من الذكاء الاصطناعي (${repaired.strategicDecision}) يخالف القرار الحتمي (${expectedDecision}).`,
      recommendedAction: `تصحيح القرار الاستراتيجي ليكون ${expectedDecision}.`,
    });
    repaired.strategicDecision = expectedDecision;
    repaired.strategicDecisionExplanationArabic = expectedExplanation;
  }

  if (repaired.funnelReadiness !== expectedReadiness) {
    violations.push({
      code: 'FUNNEL_READINESS_MISMATCH',
      severity: 'WARNING',
      field: 'funnelReadiness',
      message: `جاهزية الفانل (${repaired.funnelReadiness}) غير متطابقة مع واقع الأدلة الحتمية (${expectedReadiness}).`,
      recommendedAction: `تصحيح جاهزية الفانل لتكون ${expectedReadiness}.`,
    });
    repaired.funnelReadiness = expectedReadiness;
  }

  repaired.positioningStatus = expectedPositioningStatus;

  // ----------------------------------------------------
  // 9. Enforce Missing Evidence Count & Relevance
  // ----------------------------------------------------
  const expectedMissingEvidence = deriveMissingEvidence(data, diagnosis);
  if (!repaired.missingEvidenceArabic || repaired.missingEvidenceArabic.length === 0) {
    repaired.missingEvidenceArabic = expectedMissingEvidence;
  } else if (repaired.missingEvidenceArabic.length > 5) {
    repaired.missingEvidenceArabic = repaired.missingEvidenceArabic.slice(0, 5);
  }

  // ----------------------------------------------------
  // 10. Enforce Offer Rebuild Extended Fields & Consistency
  // ----------------------------------------------------
  if (!repaired.offerRebuild?.currentStrategicCoreArabic) {
    repaired.offerRebuild.currentStrategicCoreArabic =
      `${data.productType || 'منتج'} موجه لـ (${data.buyerRole || 'الشريحة'}) لحل (${data.coreProblem || 'المشكلة'}) بسعر ${data.priceAmount || ''} ${data.currency || ''}.`;
  }

  // Decision consistency guard for FIX_TRAFFIC_FIRST
  if (expectedDecision === 'FIX_TRAFFIC_FIRST') {
    const recCore = repaired.offerRebuild?.recommendedStrategicCoreArabic || '';
    if (recCore.includes('إعادة بناء') || recCore.includes('تغيير جذري') || !recCore.includes('لا أوصي بإعادة بناء')) {
      violations.push({
        code: 'TRAFFIC_FIRST_OFFER_REBUILD_MISMATCH',
        severity: 'WARNING',
        field: 'offerRebuild.recommendedStrategicCoreArabic',
        message: 'عندما يكون عنق الزجاجة في الزيارات، لا يجوز التوصية بإعادة بناء العرض بل المحافظة على الجوهر.',
        recommendedAction: 'تثبيت جوهر العرض الحالي وتوجيه الاختبار نحو استهداف جمهور مؤهل.',
      });
      repaired.offerRebuild.recommendedStrategicCoreArabic =
        'لا أوصي بإعادة بناء الجوهر الحالي للعرض الآن. حافظ على الوعد والآلية الأساسية، واختبرهما على جمهور مؤهل قبل إجراء تعديل هيكلي.';
    }
  } else if (!repaired.offerRebuild?.recommendedStrategicCoreArabic) {
    repaired.offerRebuild.recommendedStrategicCoreArabic =
      repaired.offerRebuild?.corePromiseDirectionArabic ||
      `إعادة صياغة العرض ليركز على النتيجة المحددة (${data.afterState || 'النتيجة'}) عبر آلية واضحة دون تعقيد.`;
  }

  if (!repaired.offerRebuild?.keepArabic || repaired.offerRebuild.keepArabic.length === 0) {
    repaired.offerRebuild.keepArabic = [
      data.mechanismDescription?.trim()
        ? `الآلية والمنهجية المطروحة (${data.mechanismDescription.trim()}).`
        : 'التركيز على المشكلة المحددة دون تشتيت.',
      data.priceAmount ? `نقطة التسعير الحالية (${data.priceAmount} ${data.currency}) لاختبارها ميدانياً.` : 'نموذج التسليم الرقمي المباشر.',
    ];
  }
  if (!repaired.offerRebuild?.changeArabic || repaired.offerRebuild.changeArabic.length === 0) {
    repaired.offerRebuild.changeArabic = [
      `معالجة عنق الزجاجة الأساسي (${diagnosis.primaryBottleneckNameArabic}).`,
      'صياغة الوعد بكلمات العميل بدلاً من المصطلحات الفنية.',
    ];
  }
  if (!repaired.offerRebuild?.removeArabic || repaired.offerRebuild.removeArabic.length === 0) {
    repaired.offerRebuild.removeArabic =
      repaired.offerStack?.removeOrDelayComponents && repaired.offerStack.removeOrDelayComponents.length > 0
        ? repaired.offerStack.removeOrDelayComponents
        : ['أي ملفات أو ملحقات إضافية وضعت فقط لتضخيم الحجم المتصور دون خدمة النتيجة مباشرة.'];
  }
  if (!repaired.offerRebuild?.missingEvidenceArabic || repaired.offerRebuild.missingEvidenceArabic.length === 0) {
    repaired.offerRebuild.missingEvidenceArabic = expectedMissingEvidence.slice(0, 3);
  }
  if (!repaired.offerRebuild?.hypothesesToValidateArabic || repaired.offerRebuild.hypothesesToValidateArabic.length === 0) {
    repaired.offerRebuild.hypothesesToValidateArabic = [
      'استعداد الشريحة الفعلي للدفع مقابل حل هذه المشكلة بالذات.',
      'هل الآلية المقترحة توفر ثقة كافية لدى المشتري لإتمام الشراء.',
    ];
  }

  // ----------------------------------------------------
  // 11. Enforce Primary Experiment Maturity Awareness & Decision Consistency
  // ----------------------------------------------------
  // Decision consistency guard for STRENGTHEN_PROOF
  if (expectedDecision === 'STRENGTHEN_PROOF') {
    const hyp = repaired.primaryExperiment?.hypothesisArabic || '';
    const probScore = diagnosis.dimensionScores.problem_strength?.score ?? 0;
    if (probScore >= 60 && (hyp.includes('محادثة مباشرة مع 5') || hyp.includes('سيعترف ما لا يقل عن 2'))) {
      violations.push({
        code: 'STRENGTHEN_PROOF_EXPERIMENT_MISMATCH',
        severity: 'WARNING',
        field: 'primaryExperiment',
        message: 'قوة المشكلة مرتفعة والقرار هو تقوية الإثبات، فلا يجوز إعادة البائع إلى مقابلات استكشاف المشكلة المبدئية.',
        recommendedAction: 'توجيه التجربة نحو تسليم نسخة صالحة أولى أو توثيق دراسة حالة رقمية.',
      });
      repaired.primaryExperiment.hypothesisArabic =
        'إذا قمنا بتسليم أصغر نسخة صالحة من العرض (Paid Pilot / First Case) لعميل واحد مؤهل وتوثيق نتيجة ملموسة بالأرقام قبل/بعد، ستنخفض مقاومة الشراء ويرتفع التحويل دون خفض السعر.';
      repaired.primaryExperiment.whatToChangeArabic =
        'تقديم دراسة حالة موثقة وشهادة بأرقام محددة في صدارة العرض قبل قسم السعر مباشرة بدلاً من الوعود الإنشائية.';
      repaired.primaryExperiment.whatToKeepConstantArabic =
        'هيكل الوعد الأساسي ونقطة التسعير الحالية والآلية دون تغيير جذري.';
      repaired.primaryExperiment.decisionRuleArabic =
        'إذا وثقت تحولاً رقمياً واضحاً، أدرجه فوراً في صفحة العرض. إذا ظل التردد قائماً، افحص هل الشريحة تصدق الآلية أصلاً.';
      repaired.primaryExperiment.whyThisHypothesisMattersArabic =
        'المشتري يفهم عرضك بالفعل لكنه يحتاج برهاناً تجارياً ملموساً يثبت إمكانية تكرار النتيجة معه شخصياً.';
    }
  }

  // Decision consistency guard for mature funnel architecture
  if (expectedDecision === 'READY_FOR_FUNNEL_ARCHITECTURE' || expectedDecision === 'OPTIMIZE_CONVERSION') {
    const hyp = repaired.primaryExperiment?.hypothesisArabic || '';
    if (hyp.includes('محادثة مباشرة مع 5') || hyp.includes('عربون رمزي')) {
      violations.push({
        code: 'MATURE_SELLER_EXPERIMENT_MISMATCH',
        severity: 'WARNING',
        field: 'primaryExperiment',
        message: 'البائع في مرحلة نضج متقدمة ويملك مبيعات متكررة؛ لا يجوز إعادته لتجارب استكشاف المشكلة الأولية.',
        recommendedAction: 'توجيه التجربة نحو تحسين التحويل، متوسط قيمة الطلب، واقتصاديات الفانل.',
      });
      repaired.primaryExperiment.hypothesisArabic =
        'إذا قمنا باختبار تسعير مركب أو مسار تأهيل متعدد الخطوات للمشترين ذوي القيمة العالية (High-LTV Segment)، سترتفع قيمة الطلب الإجمالية دون الإضرار بمعدل التحويل الإجمالي.';
      repaired.primaryExperiment.whatToChangeArabic =
        'هيكلة خطوة الدفع أو إتاحة خيار دفع سنوي / ترقية متقدمة لرفع متوسط قيمة المعاملة (AOV).';
      repaired.primaryExperiment.whatToKeepConstantArabic =
        'العرض الجوهري الأساسي وآلية التسليم المثبتة.';
      repaired.primaryExperiment.decisionRuleArabic =
        'إذا زادت الربحية الصافية لكل مشترٍ، اعتمد التسلسل الجديد وافتح قنوات إعلانية إضافية.';
      repaired.primaryExperiment.whyThisHypothesisMattersArabic =
        'تعظيم اقتصاديات الوحدة لتمكين العرض من المزايدة بقوة أكبر في مزادات الإعلانات والتوسع.';
    }
  }
  if (!repaired.primaryExperiment?.whyThisHypothesisMattersArabic) {
    repaired.primaryExperiment.whyThisHypothesisMattersArabic =
      `حسم عنق الزجاجة (${diagnosis.primaryBottleneckNameArabic}) هو الشرط الإلزامي قبل إنفاق أي ميزانية على التسويق الموسع.`;
  }
  if (!repaired.primaryExperiment?.testAudienceArabic) {
    repaired.primaryExperiment.testAudienceArabic =
      data.buyerRole?.trim() || 'عينة محددة من الشريحة المستهدفة الأكثر ألماً بالمشكلة.';
  }
  if (!repaired.primaryExperiment?.evidenceToCollectArabic || repaired.primaryExperiment.evidenceToCollectArabic.length === 0) {
    repaired.primaryExperiment.evidenceToCollectArabic = [
      'عدد الأشخاص المؤهلين الذين أبدوا اهتماماً صريحاً بالحل.',
      'الاعتراض الدقيق الذي يمنعهم من الدفع الفعلي عند طلب الالتزام.',
    ];
  }
  if (!repaired.primaryExperiment?.whatNotToConcludeArabic) {
    repaired.primaryExperiment.whatNotToConcludeArabic =
      'لا تستنتج أن السعر مرتفع إذا كان السبب الحقيقي هو عدم استيعاب النتيجة أو ضعف الثقة في الآلية.';
  }

  const valid = violations.filter(v => v.severity === 'CRITICAL').length === 0;

  return {
    valid,
    violations,
    repairedReport: repaired,
  };
}

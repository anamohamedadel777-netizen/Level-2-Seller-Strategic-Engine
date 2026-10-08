import { QuestionnaireData, AIStrategicInterpretation } from '../types';
import {
  calculateDeterministicDiagnosis,
  generateDeterministicStrategicFallback,
} from './scoringEngine';
import { validateReportAgainstEvidence } from './reportIntegrity';
import { STRESS_TEST_CASES } from './stressTests';

export interface ReportTestResult {
  id: string;
  name: string;
  passed: boolean;
  notes: string;
}

// Base baseline input for constructing synthetic scenarios
const BASE_TEST_INPUT: QuestionnaireData = {
  ...STRESS_TEST_CASES[0].input,
  productName: 'برنامج التحول التسويقي',
  productType: 'خدمة استشارية',
  buyerRole: 'أصحاب المتاجر الإلكترونية',
  buyerStage: 'متجر يحقق مبيعات شهرية منتظمة',
  buyerSituation: 'ركود في المبيعات وتذبذب تكلفة الاستحواذ',
  buyerCurrentAlternative: 'محاولات فردية غير منتظمة وإعلانات ممولة',
  buyerTrigger: 'ارتفاع تكلفة العميل وانخفاض هوامش الربح',
  coreProblem: 'ضعف نسبة التحويل وتشتت مسار الشراء',
  problemFrequency: 'daily',
  costOfInaction: 'استنزاف 3,000 دولار شهرياً في إعلانات غير مجدية',
  lossType: ['money', 'time'],
  whyWorthPaying: 'إيقاف الهدر المالي ومضاعفة كفاءة التحويل',
  problemEvidenceStatus: 'PAID_PROBLEM_EVIDENCE',
  currentWorkaroundStatus: 'COMPETING_PAID',
  beforeState: 'مبيعات عشوائية وحملات إعلانية خاسرة',
  afterState: 'فانل مبيعات منضبط ومبيعات متوقعة يومياً',
  outcomeObservability: 'immediately_measurable',
  outcomeControllability: 'joint_effort',
  timeToValue: 'weeks',
  includedComponents: ['audits', 'calls', 'templates'],
  coreComponentsDescription: 'تدقيق نقاط التسرب وجلسات توجيه أسبوعية مع قوالب جاهزة',
  paddingComponentsDescription: '',
  valueDrivers: ['INCREASES_REVENUE_POTENTIAL', 'SAVES_TIME', 'REDUCES_COST'],
  valueEvidenceStatus: 'PAID_BEHAVIOR',
  coreComponentOutcomeLink: 'تحدد بدقة مسار التسرب وتصلحه مباشرة',
  whyNotAlternatives: 'حل عملي مصمم لأرقام المتجر بدلاً من كورسات عامة',
  mechanismType: 'documented_method',
  mechanismDescription: 'بروتوكول تدقيق التحويل الخماسي',
  differentiationEvidenceStatus: 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE',
  evidenceTiersPresent: ['TIER_1_DIRECT_COMMERCIAL', 'TIER_2_OUTCOME_PROOF'],
  proofDetails: 'نتائج 12 متجر إلكتروني حققت نمواً موثقاً',
  objectionEvidenceStatus: 'REPEATED_ACTUAL_OBJECTIONS',
  actualObjectionsHeard: 'هل النموذج مناسب لحجم متجري الحالي؟',
  assumedObjections: '',
  primaryObjectionCategory: 'fit',
  priceAmount: '2000',
  currency: 'USD',
  pricingRationale: 'value_based',
  pricingEvidenceContext: 'ACTUAL_PURCHASES',
  hasAnyonePaidExactPrice: 'YES',
  isPriceRepeatedObjection: 'NO',
  checkoutStep: 'book_call',
  decisionEffortLevel: 'moderate',
  requiresApproval: 'NO',
  hasNextStepClear: 'YES',
  primaryPerceivedRisk: 'implementation',
  currentRiskReversals: ['CLEAR_SCOPE', 'COMMERCIAL_PROOF'],
  trafficSources: ['paid_ads', 'organic'],
  isTrafficQualified: 'YES',
  offerPath: 'OFFER_PATH_SERVICE_CONSULTING',
  offerStage: 'OFFER_STAGE_4_FIRST_SALES',
};

// ============================================================================
// TEST U: NO BUYER CONVERSATIONS
// ============================================================================
export function runTestU(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    objectionEvidenceStatus: 'NO_BUYER_CONVERSATIONS',
    actualObjectionsHeard: '',
    assumedObjections: '',
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  // 1. Check fallback invariant
  const fallbackZeroActual = fallback.objectionMap.actualObjections.length === 0;
  const fallbackZeroAssumed = fallback.objectionMap.assumedObjections.length === 0;

  // 2. Synthetic Unsafe AI violation: AI generates fake actual objection
  const unsafeReport: AIStrategicInterpretation = JSON.parse(JSON.stringify(fallback));
  unsafeReport.objectionMap.actualObjections = [
    {
      objection: 'السعر يبدو مرتفعاً جداً مقارنة بالميزانية',
      belief: 'المشتري يظن أن القيمة أقل من السعر',
      neededEvidence: 'شهادات إثبات',
      solvedByCopyAlone: false,
    },
  ];

  const validation = validateReportAgainstEvidence(unsafeReport, input, diag);
  const violationCaught = validation.violations.some(v => v.code === 'FAKE_ACTUAL_OBJECTION');
  const repairedClean = validation.repairedReport?.objectionMap.actualObjections.length === 0;

  const passed = fallbackZeroActual && fallbackZeroAssumed && violationCaught && repairedClean;
  return {
    id: 'TEST_U',
    name: 'TEST U — NO BUYER CONVERSATIONS INVARIANT & REPAIR',
    passed,
    notes: `Fallback zero actual: ${fallbackZeroActual}, Fallback zero assumed: ${fallbackZeroAssumed}, Synthetic caught: ${violationCaught}, Repaired clean: ${repairedClean}.`,
  };
}

// ============================================================================
// TEST V: SELLER-BELIEF DIFFERENTIATION
// ============================================================================
export function runTestV(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    differentiationEvidenceStatus: 'SELLER_BELIEF',
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  // Fallback must not claim proven buyer value or defensible advantage
  const diffVal = fallback.differentiationMap.differentAndValuableArabic.join(' ');
  const diffDef = fallback.differentiationMap.potentiallyDefensibleArabic.join(' ');
  const fallbackUnproven =
    !diffVal.includes('مثبت تجارياً') &&
    !diffVal.includes('مؤكد من المشترين') &&
    (diffVal.includes('فرضية') || diffVal.includes('تحقق')) &&
    diffDef.includes('اعتقاد البائع الذاتي');

  // Synthetic Unsafe AI report with forbidden claims
  const unsafeReport: AIStrategicInterpretation = JSON.parse(JSON.stringify(fallback));
  unsafeReport.differentiationMap.differentAndValuableArabic = [
    'ميزة مثبتة تجارياً ومؤكدة تمنح العرض تفوقاً كاسحاً على جميع المنافسين.',
  ];

  const validation = validateReportAgainstEvidence(unsafeReport, input, diag);
  const violationCaught = validation.violations.some(
    v => v.code === 'UNSUPPORTED_BUYER_VALUED_DIFFERENTIATION'
  );
  const repairedClaims = validation.repairedReport?.differentiationMap.differentAndValuableArabic.join(' ') || '';
  const repairedSafe = !repairedClaims.includes('ميزة مثبتة تجارياً') && repairedClaims.includes('فرضية');

  const passed = fallbackUnproven && violationCaught && repairedSafe;
  return {
    id: 'TEST_V',
    name: 'TEST V — SELLER-BELIEF DIFFERENTIATION INVARIANT & REPAIR',
    passed,
    notes: `Fallback unproven: ${fallbackUnproven}, Violation caught: ${violationCaught}, Repaired safe: ${repairedSafe}.`,
  };
}

// ============================================================================
// TEST W: BUYER-DEPENDENT OUTCOME
// ============================================================================
export function runTestW(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    outcomeControllability: 'highly_dependent_on_buyer',
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  const guaranteeText = fallback.riskReductionStrategy.guaranteeSuitabilityArabic;
  const approachText = fallback.riskReductionStrategy.recommendedApproachArabic;
  const noResultGuarantee =
    guaranteeText.includes('لا أنصح بضمان النتيجة حاليًا') &&
    !guaranteeText.includes('استرداد نقدي كامل') &&
    approachText.includes('فلترة');

  // Synthetic Unsafe AI report with full unconditional refund guarantee
  const unsafeReport: AIStrategicInterpretation = JSON.parse(JSON.stringify(fallback));
  unsafeReport.riskReductionStrategy.guaranteeSuitabilityArabic =
    'ضمان استرداد نقدي كامل بدون شروط إذا لم يحقق العميل النتيجة في 30 يوماً.';

  const validation = validateReportAgainstEvidence(unsafeReport, input, diag);
  const violationCaught = validation.violations.some(v => v.code === 'UNSUPPORTED_GUARANTEE');
  const repairedGuar = validation.repairedReport?.riskReductionStrategy.guaranteeSuitabilityArabic || '';
  const repairedSafe = repairedGuar.includes('لا أنصح بضمان النتيجة حاليًا');

  const passed = noResultGuarantee && violationCaught && repairedSafe;
  return {
    id: 'TEST_W',
    name: 'TEST W — BUYER-DEPENDENT OUTCOME RISK & GUARANTEE SAFETY',
    passed,
    notes: `Fallback conservative: ${noResultGuarantee}, Violation caught: ${violationCaught}, Repaired safe: ${repairedSafe}.`,
  };
}

// ============================================================================
// TEST X: NO BONUS EVIDENCE
// ============================================================================
export function runTestX(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    primaryObjectionCategory: 'fit', // Not time, complexity, or implementation
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  const fallbackZeroBonus = fallback.bonusLogic.recommendedBonuses.length === 0;
  const verdictNoBonus = fallback.bonusLogic.bonusStatusVerdictArabic.includes('لا يحتاج');

  // Synthetic Unsafe AI report: says no bonus needed, but returns bonuses anyway
  const unsafeReport: AIStrategicInterpretation = JSON.parse(JSON.stringify(fallback));
  unsafeReport.bonusLogic.bonusStatusVerdictArabic = 'العرض لا يحتاج أي بونص إضافي حالياً.';
  unsafeReport.bonusLogic.recommendedBonuses = [
    { titleArabic: 'بونص قوالب مجانية', frictionOrObjectionSolvedArabic: 'حل وهمي' },
  ];

  const validation = validateReportAgainstEvidence(unsafeReport, input, diag);
  const contradictionCaught = validation.violations.some(v => v.code === 'BONUS_CONTRADICTION');
  const repairedClean = validation.repairedReport?.bonusLogic.recommendedBonuses.length === 0;

  const passed = fallbackZeroBonus && verdictNoBonus && contradictionCaught && repairedClean;
  return {
    id: 'TEST_X',
    name: 'TEST X — NO BONUS EVIDENCE & CONTRADICTION SAFETY',
    passed,
    notes: `Fallback zero bonus: ${fallbackZeroBonus}, Verdict no bonus: ${verdictNoBonus}, Contradiction caught: ${contradictionCaught}, Repaired clean: ${repairedClean}.`,
  };
}

// ============================================================================
// TEST Y: TRAFFIC PRIMARY BOTTLENECK
// ============================================================================
export function runTestY(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    isTrafficQualified: 'NO',
    trafficSources: ['paid_ads'],
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  const isFixTraffic = fallback.strategicDecision === 'FIX_TRAFFIC_FIRST';
  const explanationMatches =
    fallback.strategicDecisionExplanationArabic.includes('لا أنصح بإعادة بناء العرض') ||
    fallback.executiveDiagnosis.decisionNotToTakeNowArabic.includes('لا تعد بناء العرض');
  const expFocusTraffic = fallback.primaryExperiment.whatToChangeArabic.includes('الزيارات') ||
    fallback.primaryExperiment.whatToChangeArabic.includes('استهداف');

  const passed = isFixTraffic && explanationMatches && expFocusTraffic;
  return {
    id: 'TEST_Y',
    name: 'TEST Y — TRAFFIC PRIMARY BOTTLENECK STRATEGIC DIAGNOSIS',
    passed,
    notes: `Decision FIX_TRAFFIC_FIRST: ${isFixTraffic}, Explanation matches: ${explanationMatches}, Experiment on traffic: ${expFocusTraffic}.`,
  };
}

// ============================================================================
// TEST Z: MATURE SELLER
// ============================================================================
export function runTestZ(): ReportTestResult {
  const input: QuestionnaireData = {
    ...BASE_TEST_INPUT,
    offerStage: 'OFFER_STAGE_5_REPEATABLE_SALES',
    hasPaidCustomers: 'YES',
    pricingEvidenceContext: 'REPEAT_PURCHASES',
    hasAnyonePaidExactPrice: 'YES',
    evidenceTiersPresent: ['TIER_1_DIRECT_COMMERCIAL', 'TIER_2_OUTCOME_PROOF'],
    isTrafficQualified: 'YES',
  };

  const diag = calculateDeterministicDiagnosis(input);
  const fallback = generateDeterministicStrategicFallback(input, diag);

  const readinessOptim = fallback.funnelReadiness === 'OPTIMIZATION_READY';
  const nextQsMature = fallback.nextThreeQuestionsArabic.some(q => q.includes('LTV') || q.includes('AOV') || q.includes('فانل'));
  const expOptim = fallback.primaryExperiment.hypothesisArabic.includes('High-LTV') ||
    fallback.primaryExperiment.evidenceToCollectArabic.some(e => e.includes('AOV') || e.includes('Retention') || e.includes('Order Value'));

  const passed = readinessOptim && nextQsMature && expOptim;
  return {
    id: 'TEST_Z',
    name: 'TEST Z — MATURE SELLER OPTIMIZATION-LEVEL INTELLIGENCE',
    passed,
    notes: `Readiness OPTIMIZATION_READY: ${readinessOptim}, Optimization Questions: ${nextQsMature}, Optimization Experiment: ${expOptim}.`,
  };
}

// ============================================================================
// SYNTHETIC AI VIOLATION SUITE (8 Violations)
// ============================================================================
export function runSyntheticViolationSuite(): {
  testName: string;
  code: string;
  repaired: boolean;
  notes: string;
}[] {
  const diag = calculateDeterministicDiagnosis(BASE_TEST_INPUT);
  const baseFallback = generateDeterministicStrategicFallback(BASE_TEST_INPUT, diag);

  const suiteResults = [];

  // 1. FAKE_ACTUAL_OBJECTION
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT, objectionEvidenceStatus: 'NO_BUYER_CONVERSATIONS' };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.objectionMap.actualObjections = [{ objection: 'السعر مرتفع جداً', belief: 'شك', neededEvidence: 'إثبات', solvedByCopyAlone: false }];
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'FAKE_ACTUAL_OBJECTION');
    const repaired = res.repairedReport?.objectionMap.actualObjections.length === 0;
    suiteResults.push({
      testName: 'Synthetic Fake Actual Objection',
      code: 'FAKE_ACTUAL_OBJECTION',
      repaired: caught && Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 2. ASSUMPTION_CONVERTED_TO_FACT
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT, objectionEvidenceStatus: 'ASSUMED_OBJECTIONS_ONLY', assumedObjections: 'السعر قد يكون مرتفعاً' };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.objectionMap.actualObjections = [{ objection: 'السعر مرتفع جداً', belief: 'شك', neededEvidence: 'إثبات', solvedByCopyAlone: false }];
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'ASSUMPTION_CONVERTED_TO_FACT');
    const repaired = res.repairedReport?.objectionMap.actualObjections.length === 0;
    suiteResults.push({
      testName: 'Synthetic Assumption Converted to Fact',
      code: 'ASSUMPTION_CONVERTED_TO_FACT',
      repaired: caught && Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 3. UNSUPPORTED_BUYER_VALUED_DIFFERENTIATION
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT, differentiationEvidenceStatus: 'SELLER_BELIEF' };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.differentiationMap.differentAndValuableArabic = ['ميزة مثبتة تجارياً ومؤكدة من جميع العملاء'];
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'UNSUPPORTED_BUYER_VALUED_DIFFERENTIATION');
    const repText = res.repairedReport?.differentiationMap.differentAndValuableArabic.join(' ') || '';
    const repaired = caught && !repText.includes('ميزة مثبتة') && repText.includes('فرضية');
    suiteResults.push({
      testName: 'Synthetic Unsupported Differentiation',
      code: 'UNSUPPORTED_BUYER_VALUED_DIFFERENTIATION',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 4. UNSUPPORTED_GUARANTEE
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT, outcomeControllability: 'highly_dependent_on_buyer' };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.riskReductionStrategy.guaranteeSuitabilityArabic = 'ضمان استرداد نقدي كامل 100% بدون شروط';
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'UNSUPPORTED_GUARANTEE');
    const repText = res.repairedReport?.riskReductionStrategy.guaranteeSuitabilityArabic || '';
    const repaired = caught && repText.includes('لا أنصح بضمان النتيجة حاليًا');
    suiteResults.push({
      testName: 'Synthetic Unsupported Guarantee',
      code: 'UNSUPPORTED_GUARANTEE',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 5. UNSUPPORTED_PRICE_VALIDATION
  {
    const input: QuestionnaireData = {
      ...BASE_TEST_INPUT,
      pricingEvidenceContext: 'NO_REAL_BUYER_CONVERSATIONS',
      hasAnyonePaidExactPrice: 'NO',
      isPriceRepeatedObjection: 'UNKNOWN',
    };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.pricingStrategicAdvice.verdictArabic = 'السعر مناسب تماماً وممتاز ومثبت في السوق.';
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'UNSUPPORTED_PRICE_VALIDATION');
    const repText = res.repairedReport?.pricingStrategicAdvice.verdictArabic || '';
    const repaired = caught && repText.includes('لم يُختبر بعد بما يكفي');
    suiteResults.push({
      testName: 'Synthetic Unsupported Price Validation',
      code: 'UNSUPPORTED_PRICE_VALIDATION',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 6. FABRICATED_METRIC
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT, valueEvidenceStatus: 'SELLER_ASSUMPTION', proofDetails: '' };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.valueProposition.customerValueArabic = 'زيادة المبيعات بنسبة 80% ومضاعفة الأرباح 3X خلال 10 أيام.';
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'FABRICATED_METRIC');
    const repText = res.repairedReport?.valueProposition.customerValueArabic || '';
    const repaired = caught && !repText.includes('80%') && !repText.includes('3X');
    suiteResults.push({
      testName: 'Synthetic Fabricated Metric',
      code: 'FABRICATED_METRIC',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 7. BONUS_CONTRADICTION
  {
    const input: QuestionnaireData = { ...BASE_TEST_INPUT };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.bonusLogic.bonusStatusVerdictArabic = 'العرض لا يحتاج أي بونص إضافي حالياً.';
    unsafe.bonusLogic.recommendedBonuses = [
      { titleArabic: 'بونص تدريبي إضافي', frictionOrObjectionSolvedArabic: 'حل وهمي' },
    ];
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'BONUS_CONTRADICTION');
    const repaired = caught && res.repairedReport?.bonusLogic.recommendedBonuses.length === 0;
    suiteResults.push({
      testName: 'Synthetic Bonus Contradiction',
      code: 'BONUS_CONTRADICTION',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  // 8. INVENTED_EXISTING_COMPONENT
  {
    const input: QuestionnaireData = {
      ...BASE_TEST_INPUT,
      includedComponents: ['templates'],
      coreComponentsDescription: 'قوالب إكسل جاهزة',
    };
    const diagCase = calculateDeterministicDiagnosis(input);
    const unsafe: AIStrategicInterpretation = JSON.parse(JSON.stringify(baseFallback));
    unsafe.offerStack.coreComponents = [
      'معسكر تدريبي مكثف لمدة 8 أسابيع مع إقامة فندقية',
    ];
    const res = validateReportAgainstEvidence(unsafe, input, diagCase);
    const caught = res.violations.some(v => v.code === 'INVENTED_EXISTING_COMPONENT');
    const recList = res.repairedReport?.offerStack.recommendedComponentsToTest || [];
    const repaired = caught && recList.some(item => item.includes('معسكر'));
    suiteResults.push({
      testName: 'Synthetic Invented Existing Component',
      code: 'INVENTED_EXISTING_COMPONENT',
      repaired: Boolean(repaired),
      notes: `Caught: ${caught}, Repaired: ${repaired}`,
    });
  }

  return suiteResults;
}

// ============================================================================
// FOUR-PERSONA DIFFERENTIATION TEST
// ============================================================================
export function runFourPersonaDifferentiationTest(): {
  passed: boolean;
  details: Record<string, any>;
  notes: string;
} {
  // Persona 1: Weak Beginner (Vague buyer, idea only)
  const p1Input: QuestionnaireData = {
    ...STRESS_TEST_CASES.find(c => c.id === 'TEST_F')!.input,
    offerStage: 'OFFER_STAGE_0_IDEA_ONLY',
    hasPaidCustomers: 'NO',
  };

  // Persona 2: Strong Structure / No Proof (Clear problem, no commercial proof)
  const p2Input: QuestionnaireData = {
    ...STRESS_TEST_CASES.find(c => c.id === 'TEST_B')!.input,
    offerStage: 'OFFER_STAGE_1_NOT_SOLD',
    hasPaidCustomers: 'NO',
    evidenceTiersPresent: ['TIER_5_SELLER_BELIEF'],
  };

  // Persona 3: Strong Offer / Wrong Traffic (Proven offer, but unqualified traffic)
  const p3Input: QuestionnaireData = {
    ...STRESS_TEST_CASES.find(c => c.id === 'TEST_L')!.input,
    offerStage: 'OFFER_STAGE_4_FIRST_SALES',
    isTrafficQualified: 'NO',
    trafficSources: ['paid_ads'],
  };

  // Persona 4: Mature Repeatable Seller (Scalable, repeatable sales, high proof)
  const p4Input: QuestionnaireData = {
    ...STRESS_TEST_CASES.find(c => c.id === 'TEST_L')!.input,
    offerStage: 'OFFER_STAGE_5_REPEATABLE_SALES',
    isTrafficQualified: 'YES',
  };

  const d1 = calculateDeterministicDiagnosis(p1Input);
  const f1 = generateDeterministicStrategicFallback(p1Input, d1);

  const d2 = calculateDeterministicDiagnosis(p2Input);
  const f2 = generateDeterministicStrategicFallback(p2Input, d2);

  const d3 = calculateDeterministicDiagnosis(p3Input);
  const f3 = generateDeterministicStrategicFallback(p3Input, d3);

  const d4 = calculateDeterministicDiagnosis(p4Input);
  const f4 = generateDeterministicStrategicFallback(p4Input, d4);

  // Assert distinct Strategic Decisions
  const decisions = [f1.strategicDecision, f2.strategicDecision, f3.strategicDecision, f4.strategicDecision];
  const uniqueDecisions = new Set(decisions).size === 4;

  // Assert distinct Funnel Readiness
  const readiness = [f1.funnelReadiness, f2.funnelReadiness, f3.funnelReadiness, f4.funnelReadiness];
  const uniqueReadiness = new Set(readiness).size >= 3;

  // Assert distinct Primary Experiments
  const experiments = [
    f1.primaryExperiment.hypothesisArabic,
    f2.primaryExperiment.hypothesisArabic,
    f3.primaryExperiment.hypothesisArabic,
    f4.primaryExperiment.hypothesisArabic,
  ];
  const uniqueExperiments = new Set(experiments).size === 4;

  // Assert distinct Next Three Questions
  const qSets = [
    f1.nextThreeQuestionsArabic.join('|'),
    f2.nextThreeQuestionsArabic.join('|'),
    f3.nextThreeQuestionsArabic.join('|'),
    f4.nextThreeQuestionsArabic.join('|'),
  ];
  const uniqueQuestions = new Set(qSets).size === 4;

  // Assert semantic decision-to-experiment alignment
  const p1Aligned =
    f1.strategicDecision === 'REFINE_BEFORE_SELLING' &&
    (f1.primaryExperiment.hypothesisArabic.includes('محادثة') || f1.primaryExperiment.whatToChangeArabic.includes('المشكلة'));

  const p2Aligned =
    f2.strategicDecision === 'STRENGTHEN_PROOF' &&
    (f2.primaryExperiment.hypothesisArabic.includes('Paid Pilot') ||
      f2.primaryExperiment.hypothesisArabic.includes('First Case') ||
      f2.primaryExperiment.hypothesisArabic.includes('نتيجة ملموسة') ||
      f2.primaryExperiment.whatToChangeArabic.includes('دراسة حالة'));

  const p3Aligned =
    f3.strategicDecision === 'FIX_TRAFFIC_FIRST' &&
    (f3.primaryExperiment.whatToChangeArabic.includes('الزيارات') ||
      f3.primaryExperiment.whatToChangeArabic.includes('استهداف') ||
      f3.primaryExperiment.hypothesisArabic.includes('High-Intent'));

  const p4Aligned =
    f4.strategicDecision === 'READY_FOR_FUNNEL_ARCHITECTURE' &&
    (f4.primaryExperiment.hypothesisArabic.includes('High-LTV') ||
      f4.primaryExperiment.evidenceToCollectArabic.some(e => e.includes('AOV') || e.includes('Order Value')));

  const alignmentPassed = p1Aligned && p2Aligned && p3Aligned && p4Aligned;
  const passed = uniqueDecisions && uniqueReadiness && uniqueExperiments && uniqueQuestions && alignmentPassed;

  return {
    passed,
    details: {
      p1: { decision: f1.strategicDecision, readiness: f1.funnelReadiness, aligned: p1Aligned },
      p2: { decision: f2.strategicDecision, readiness: f2.funnelReadiness, aligned: p2Aligned },
      p3: { decision: f3.strategicDecision, readiness: f3.funnelReadiness, aligned: p3Aligned },
      p4: { decision: f4.strategicDecision, readiness: f4.funnelReadiness, aligned: p4Aligned },
      alignmentPassed,
    },
    notes: `Unique Decisions: ${new Set(decisions).size}/4, Unique Readiness: ${new Set(readiness).size}/4, Alignment: ${alignmentPassed ? 'ALL_ALIGNED' : 'MISALIGNED'}.`,
  };
}

// ============================================================================
// PRESENTATION TEST
// ============================================================================
export function runPresentationTest(): ReportTestResult {
  const fs = require('fs');
  const path = require('path');
  const dashboardCode = fs.readFileSync(path.resolve(__dirname, '../components/ReportDashboard.tsx'), 'utf-8');

  const requiredTokens = [
    'strategicDecision',
    'funnelReadiness',
    'positioningStatus',
    'valuePropositionStatus',
    'missingEvidenceArabic',
    'whyThisApproachArabic',
    'whyNotAlternativeArabic',
    'observedEvidenceArabic',
    'evidenceToCollectArabic',
    'whatNotToConcludeArabic',
    'recommendedComponentsToTest',
  ];

  const missingTokens = requiredTokens.filter(token => !dashboardCode.includes(token));
  const passed = missingTokens.length === 0;

  return {
    id: 'TEST_PRESENTATION',
    name: 'PRESENTATION TEST — DASHBOARD COMPLETENESS & DECISION ALIGNMENT',
    passed,
    notes: passed
      ? 'All required intelligence elements are rendered in ReportDashboard.'
      : `Missing tokens in ReportDashboard: ${missingTokens.join(', ')}`,
  };
}

// ============================================================================
// PRINT COMPLETENESS TEST
// ============================================================================
export function runPrintCompletenessTest(): ReportTestResult {
  const fs = require('fs');
  const path = require('path');
  const printCode = fs.readFileSync(path.resolve(__dirname, '../components/PrintView.tsx'), 'utf-8');

  const requiredTokens = [
    'strategicDecision',
    'funnelReadiness',
    'positioningStatus',
    'valuePropositionStatus',
    'offerRebuild',
    'salesMessageHierarchyArabic',
    'salesPageSkeleton',
    'primaryExperiment.observedEvidenceArabic',
    'missingEvidenceArabic',
    'nextThreeQuestionsArabic',
  ];

  const missingTokens = requiredTokens.filter(token => !printCode.includes(token));
  const passed = missingTokens.length === 0;

  return {
    id: 'TEST_PRINT_COMPLETENESS',
    name: 'PRINT COMPLETENESS TEST — FULL BLUEPRINT REPORT CONTENT',
    passed,
    notes: passed
      ? 'All required blueprint sections are referenced in PrintView.'
      : `Missing tokens in PrintView: ${missingTokens.join(', ')}`,
  };
}

// ============================================================================
// MAIN RUNNER FOR REPORT TESTS U–Z
// ============================================================================
export function runReportTests(): ReportTestResult[] {
  return [
    runTestU(),
    runTestV(),
    runTestW(),
    runTestX(),
    runTestY(),
    runTestZ(),
    runPresentationTest(),
    runPrintCompletenessTest(),
  ];
}

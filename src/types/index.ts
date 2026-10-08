export type ProblemEvidenceStatus =
  | 'UNSELECTED'
  | 'SELLER_ASSUMPTION' // دي فرضية مني ولسه مختبرتهاش
  | 'BUYER_REPORTED' // سمعتها بشكل متكرر من عملاء محتملين
  | 'OBSERVED_REPEATED_BEHAVIOR' // شايف سلوك متكرر ومحاولات فعلية لحلها
  | 'PAID_PROBLEM_EVIDENCE'; // ناس دفعت بالفعل عشان تحل مشكلة قريبة

export type CurrentWorkaroundStatus =
  | 'UNSELECTED'
  | 'NONE_KNOWN' // مش عارف بيعمل إيه حالياً / مفيش حل معروف
  | 'PASSIVE_SUFFERING' // متعايش مع المشكلة ومستسلم ومبيحاولش يحلها
  | 'DIY_MANUAL' // بيحاول يحلها بنفسه بطرق بدائية أو شيتات يدوية
  | 'FREE_CONTENT' // بيعتمد على محتوى مجاني وفيديوهات يوتيوب
  | 'COMPETING_PAID' // مشترك في أداة أو خدمة أو كورس مدفوع بس مش راضي
  | 'HIRING_OR_EXPENSIVE_SERVICE'; // بيستعين بموظف أو فريلانسر بتكلفة عالية

export type ValueDriver =
  | 'SAVES_TIME'
  | 'REDUCES_COST'
  | 'INCREASES_REVENUE_POTENTIAL'
  | 'REDUCES_RISK'
  | 'REDUCES_COMPLEXITY'
  | 'IMPROVES_SPEED'
  | 'BUILDS_CAPABILITY'
  | 'IMPROVES_CONVENIENCE'
  | 'IMPROVES_STATUS'
  | 'OTHER';

export type ValueEvidenceStatus =
  | 'UNSELECTED'
  | 'SELLER_ASSUMPTION'
  | 'BUYER_STATED'
  | 'OBSERVED_BEHAVIOR'
  | 'PAID_BEHAVIOR';

export type DifferentiationEvidenceStatus =
  | 'UNSELECTED'
  | 'SELLER_BELIEF'
  | 'BUYER_MENTIONED_DIFFERENCE'
  | 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE'
  | 'WIN_LOSS_EVIDENCE'
  | 'REPEATABLE_COMMERCIAL_EVIDENCE';

export type PricingEvidenceContext =
  | 'UNSELECTED'
  | 'NO_REAL_BUYER_CONVERSATIONS'
  | 'INTEREST_CONVERSATIONS_ONLY'
  | 'REAL_SALES_CONVERSATIONS'
  | 'ACTUAL_PURCHASES'
  | 'REPEAT_PURCHASES'
  | 'ACTUAL_PURCHASES_AT_SCALE';

export type RiskMitigationType =
  | 'CLEAR_SCOPE'
  | 'TRANSPARENT_EXPECTATIONS'
  | 'COMMERCIAL_PROOF'
  | 'OUTCOME_PROOF'
  | 'SAMPLE'
  | 'DEMO'
  | 'PILOT'
  | 'TRIAL'
  | 'GUARANTEE'
  | 'PAYMENT_STRUCTURE'
  | 'REFUND_POLICY'
  | 'OTHER'
  | 'NONE';

export type ObjectionEvidenceStatus =
  | 'UNSELECTED'
  | 'NO_BUYER_CONVERSATIONS'
  | 'ASSUMED_OBJECTIONS_ONLY'
  | 'ACTUAL_OBJECTIONS_HEARD'
  | 'REPEATED_ACTUAL_OBJECTIONS';

export type OfferPath =
  | 'OFFER_PATH_UNSELECTED'
  | 'OFFER_PATH_DIGITAL_PRODUCT' // عندي منتج رقمي وبحاول أبيعه
  | 'OFFER_PATH_COURSE_PROGRAM' // عندي كورس أو برنامج تدريبي
  | 'OFFER_PATH_SERVICE_CONSULTING' // عندي خدمة أو استشارة
  | 'OFFER_PATH_MEMBERSHIP' // عندي Membership أو اشتراك
  | 'OFFER_PATH_WORKSHOP_COHORT' // عندي Workshop / Cohort
  | 'OFFER_PATH_NEW_OFFER' // عندي Offer جديد ولسه مجربتش أبيعه
  | 'OFFER_PATH_LOW_CONVERSION'; // عندي مبيعات بالفعل لكن التحويل أقل من المتوقع

export type OfferStage =
  | 'OFFER_STAGE_UNSELECTED'
  | 'OFFER_STAGE_0_IDEA_ONLY'
  | 'OFFER_STAGE_1_NOT_SOLD'
  | 'OFFER_STAGE_2_INTEREST'
  | 'OFFER_STAGE_3_COMMITMENT'
  | 'OFFER_STAGE_4_FIRST_SALES'
  | 'OFFER_STAGE_5_REPEATABLE_SALES'
  | 'OFFER_STAGE_6_OPTIMIZATION';

export type EvidenceTier =
  | 'TIER_1_DIRECT_COMMERCIAL' // عملاء دافعون، شراء متكرر، تجديد، ودائع
  | 'TIER_2_OUTCOME_PROOF' // نتائج موثقة للعملاء، قبل وبعد، أثر ملموس
  | 'TIER_3_BEHAVIORAL_PROOF' // أسئلة شراء، استمارات، قائمة انتظار مؤهلة، طلب ديمو
  | 'TIER_4_MARKET_SIGNALS' // طلب في السوق، منافسون، نقاشات المجتمع
  | 'TIER_5_SELLER_BELIEF'; // قناعة ورأي صاحب العرض فقط

export type EpistemicStatus =
  | 'USER_FACT' // حقيقة مباشرة قدمها المستخدم
  | 'USER_CLAIM' // ادعاء من المستخدم لم يُثبت بعد
  | 'OBSERVED_EVIDENCE' // دليل سلوكي حقيقي مُلاحظ
  | 'AI_HYPOTHESIS' // فرضية مقترحة من الذكاء الاصطناعي
  | 'STRATEGIC_INFERENCE' // استنتاج استراتيجي مقيد بالأدلة
  | 'MISSING_DATA'; // بيانات غير متوفرة

export type TriState = 'YES' | 'NO' | 'NOT_SURE' | 'UNSELECTED';

export type BottleneckIdentifier =
  | 'BUYER_CLARITY'
  | 'PROBLEM_VALUE'
  | 'OUTCOME_CLARITY'
  | 'DIFFERENTIATION'
  | 'PROOF'
  | 'OBJECTION_COVERAGE'
  | 'PRICING_LOGIC'
  | 'RISK'
  | 'DECISION_FRICTION'
  | 'TRAFFIC_QUALITY'
  | 'DELIVERY_MISMATCH'
  | 'OFFER_COMPLEXITY';

export type OfferDiagnosisCategory =
  | 'STRONG_OFFER_WEAK_EVIDENCE'
  | 'PRODUCT_VALUE_PROBLEM'
  | 'POSITIONING_PROBLEM'
  | 'MESSAGE_CLARITY_PROBLEM'
  | 'PROOF_PROBLEM'
  | 'PRICING_CONTEXT_PROBLEM'
  | 'DECISION_FRICTION_PROBLEM'
  | 'TRAFFIC_QUALITY_PROBLEM'
  | 'OVERBUILT_OFFER'
  | 'OFFER_READY_TO_TEST'
  | 'OFFER_READY_TO_OPTIMIZE';

export type ValidationSprintMode =
  | 'SPRINT_DISCOVERY' // Stage 0-1
  | 'SPRINT_MESSAGE_INTEREST' // Stage 2
  | 'SPRINT_COMMITMENT' // Stage 3
  | 'SPRINT_FIRST_SALES' // Stage 4
  | 'SPRINT_REPEATABLE_SALES' // Stage 5
  | 'SPRINT_OPTIMIZATION'; // Stage 6

export type PricingDiagnosisCategory =
  | 'PRICE_NOT_YET_DIAGNOSABLE'
  | 'PRICE_LIKELY_NOT_PRIMARY_PROBLEM'
  | 'PRICE_NEEDS_TESTING'
  | 'PRICE_DELIVERY_MISMATCH'
  | 'PRICE_VALUE_MISMATCH'
  | 'PRICE_SUPPORTED_BY_EVIDENCE';

export type OfferComplexityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export interface QuestionnaireData {
  // Path & Maturity
  offerPath: OfferPath;
  offerStage: OfferStage;

  // Section A: Offer Context
  productName: string;
  productType: string;
  versionStatus: string;
  priceAmount: string; // empty or string
  currency: string;
  deliveryMethod: 'not_selected' | 'self-paced' | 'live-cohort' | '1-on-1' | 'done-for-you' | 'hybrid' | 'template-access' | string;
  isLive: TriState;
  hasPaidCustomers: TriState;
  salesVolumeRange: 'unselected' | '0' | '1-3' | '4-10' | '11-30' | '31+';

  // Section B: Target Buyer
  buyerRole: string; // e.g. Freelancer, E-com owner, Coach, Agency
  buyerStage: string; // e.g. Beginner, Generating revenue, Scaling
  buyerSituation: string; // current painful reality
  buyerCurrentAlternative: string; // what they currently use/do instead
  buyerTrigger: string; // what triggers them to seek solution now

  // Section C: Core Problem
  coreProblem: string;
  problemEvidenceStatus: ProblemEvidenceStatus;
  currentWorkaroundStatus: CurrentWorkaroundStatus;
  problemFrequency: 'daily' | 'weekly' | 'occasional' | 'not_sure' | 'UNSELECTED';
  costOfInaction: string;
  lossType: ('time' | 'money' | 'missed_opportunity' | 'stress' | 'complexity' | 'performance' | 'status' | 'business_risk')[];
  whyWorthPaying: string;

  // Section D: Desired Outcome
  beforeState: string;
  afterState: string;
  outcomeObservability: 'immediately_measurable' | 'visible_over_time' | 'subjective' | 'not_sure' | 'UNSELECTED';
  outcomeControllability: 'fully_controllable' | 'joint_effort' | 'highly_dependent_on_buyer' | 'not_sure' | 'UNSELECTED';
  timeToValue: 'same_day' | 'days' | 'weeks' | 'months' | 'unknown' | 'UNSELECTED';

  // Section E: Current Offer Structure
  includedComponents: string[]; // videos, live_sessions, templates, audits, calls, community, tools, done_for_you, support
  coreComponentsDescription: string;
  paddingComponentsDescription: string; // things added just to inflate perceived value
  valueDrivers: ValueDriver[];
  valueEvidenceStatus: ValueEvidenceStatus;
  coreComponentOutcomeLink: string;

  // Section F: Differentiation
  whyNotAlternatives: string; // why choose this vs doing nothing / competitor / hiring / free
  mechanismType: 'documented_method' | 'general_expertise' | 'borrowed_common_method' | 'developing_method' | 'not_sure' | 'UNSELECTED';
  mechanismDescription: string;
  differentiationEvidenceStatus: DifferentiationEvidenceStatus;

  // Section G: Proof
  evidenceTiersPresent: EvidenceTier[];
  proofDetails: string; // direct proof details, case studies, or none

  // Section H: Objections
  objectionEvidenceStatus: ObjectionEvidenceStatus;
  actualObjectionsHeard: string;
  assumedObjections: string;
  primaryObjectionCategory: 'price' | 'time' | 'trust' | 'need' | 'urgency' | 'complexity' | 'implementation' | 'fit' | 'risk' | 'not_sure' | 'UNSELECTED';

  // Section I: Pricing Context
  pricingRationale: 'competitor_reference' | 'cost_based' | 'desired_income' | 'intuition' | 'previous_sales' | 'value_based' | 'testing' | 'unknown' | 'UNSELECTED';
  pricingEvidenceContext: PricingEvidenceContext;
  hasAnyonePaidExactPrice: TriState;
  isPriceRepeatedObjection: 'ACTUAL_REPEATED' | 'SOMETIMES' | 'ASSUMED' | 'NO' | 'UNKNOWN' | 'UNSELECTED';

  // Section J: Decision Friction
  checkoutStep: 'immediate_checkout' | 'book_call' | 'application' | 'proposal' | 'dm' | 'manual_payment' | 'not_sure' | 'UNSELECTED';
  decisionEffortLevel: 'low' | 'moderate' | 'high' | 'not_sure' | 'UNSELECTED';
  requiresApproval: TriState;
  hasNextStepClear: TriState;

  // Section K: Risk & Trust
  primaryPerceivedRisk: 'financial' | 'time' | 'implementation' | 'outcome_uncertainty' | 'credibility' | 'switching' | 'not_sure' | 'UNSELECTED';
  currentRiskReversals: string[]; // guarantee, trial, demo, pilot, clear_scope, transparent_faq, none

  // Section L: Traffic Context
  trafficSources: string[]; // organic, paid_ads, referrals, email, community, outbound, none
  isTrafficQualified: 'YES' | 'PARTIALLY' | 'NO' | 'NOT_SURE' | 'UNSELECTED';
}

export interface DimensionScore {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  score: number; // 0 - 100
  weight: number; // percentage
  weightedScore: number;
  epistemicStatus: EpistemicStatus;
  notes: string;
}

export interface DeterministicDiagnosis {
  offerStrengthScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  dimensionScores: Record<string, DimensionScore>;
  primaryBottleneck: BottleneckIdentifier;
  primaryBottleneckNameArabic: string;
  primaryBottleneckSeverity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  secondaryBottleneck?: BottleneckIdentifier;
  secondaryBottleneckNameArabic?: string;
  offerDiagnosisCategory: OfferDiagnosisCategory;
  offerDiagnosisSummaryArabic: string;
  confidenceRating: 'HIGH' | 'MODERATE' | 'LOW';
  confidenceReasoningArabic: string;
  offerStage: OfferStage;
  validationSprintMode: ValidationSprintMode;
  pricingDiagnosisCategory: PricingDiagnosisCategory;
  complexityLevel: OfferComplexityLevel;
  trafficVsOfferVerdict: 'OFFER_PRIMARY_BOTTLENECK' | 'TRAFFIC_PRIMARY_BOTTLENECK' | 'BALANCED_BOTTLENECK';
  consistencyFlags: string[];
}

export type PositioningStatus =
  | 'VALIDATED_DIRECTION'
  | 'STRATEGIC_DIRECTION'
  | 'PROVISIONAL_HYPOTHESIS'
  | 'INSUFFICIENT_EVIDENCE';

export type ValuePropositionStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'HYPOTHESIS'
  | 'INSUFFICIENT_EVIDENCE';

export type StrategicDecision =
  | 'KEEP_AND_VALIDATE'
  | 'REFINE_BEFORE_SELLING'
  | 'TEST_BEFORE_REBUILDING'
  | 'SIMPLIFY_OFFER'
  | 'STRENGTHEN_PROOF'
  | 'FIX_TRAFFIC_FIRST'
  | 'OPTIMIZE_CONVERSION'
  | 'READY_FOR_FUNNEL_ARCHITECTURE';

export type FunnelReadiness =
  | 'NOT_READY'
  | 'VALIDATION_FIRST'
  | 'OFFER_READY'
  | 'OPTIMIZATION_READY';

export interface ReportIntegrityViolation {
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  field: string;
  message: string;
  recommendedAction: string;
}

export interface ReportIntegrityResult {
  valid: boolean;
  violations: ReportIntegrityViolation[];
  repairedReport?: AIStrategicInterpretation;
}

export interface AIStrategicInterpretation {
  strategicDecision: StrategicDecision;
  strategicDecisionExplanationArabic: string;
  funnelReadiness: FunnelReadiness;
  missingEvidenceArabic: string[]; // 3-5 high-priority missing evidence items
  executiveDiagnosis: {
    strongestAssetArabic: string;
    biggestWeaknessArabic: string;
    commonMisunderstandingArabic: string;
    decisionNotToTakeNowArabic: string;
    firstPriorityFixArabic: string;
  };
  primaryBottleneckExplanationArabic: string;
  offerRebuild: {
    targetBuyerArabic: string;
    coreProblemArabic: string;
    desiredOutcomeArabic: string;
    mechanismArabic: string;
    offerCategoryArabic: string;
    deliveryModelArabic: string;
    corePromiseDirectionArabic: string;
    recommendedScopeArabic: string;
    timeToValueExpectationArabic: string;
    mainDecisionReasonArabic: string;
    currentStrategicCoreArabic: string;
    recommendedStrategicCoreArabic: string;
    keepArabic: string[];
    changeArabic: string[];
    removeArabic: string[];
    missingEvidenceArabic: string[];
    hypothesesToValidateArabic: string[];
  };
  positioningStatus: PositioningStatus;
  positioningStatement: {
    strategicVersionArabic: string;
    naturalMarketingVersionArabic: string;
  };
  valuePropositionStatus: ValuePropositionStatus;
  valueProposition: {
    customerValueArabic: string;
    businessValueArabic: string;
    whyNowArabic: string;
    whyThisApproachArabic: string;
    whyNotAlternativeArabic: string;
    isHypothesis: boolean;
  };
  offerStack: {
    coreComponents: string[];
    supportingComponents: string[];
    optionalComponents: string[];
    removeOrDelayComponents: string[];
    recommendedComponentsToTest?: string[];
  };
  bonusLogic: {
    recommendedBonuses: {
      titleArabic: string;
      frictionOrObjectionSolvedArabic: string;
    }[];
    bonusStatusVerdictArabic: string;
  };
  whatNotToAddArabic: string[]; // exactly 3 items
  whatNotToChangeYetArabic: string[]; // exactly 3 items
  objectionMap: {
    actualObjections: { objection: string; belief: string; neededEvidence: string; solvedByCopyAlone: boolean }[];
    assumedObjections: { objection: string; belief: string; neededEvidence: string; solvedByCopyAlone: boolean }[];
    unansweredObjections: { objection: string; strategicAdvice: string }[];
  };
  riskReductionStrategy: {
    recommendedApproachArabic: string;
    guaranteeSuitabilityArabic: string;
    practicalSafeguardsArabic: string[];
  };
  pricingStrategicAdvice: {
    verdictArabic: string;
    valueToPriceLogicArabic: string;
    actionBeforeChangingPriceArabic: string;
  };
  differentiationMap: {
    sameAsAlternativesArabic: string[];
    differentButIrrelevantArabic: string[];
    differentAndValuableArabic: string[];
    potentiallyDefensibleArabic: string[];
  };
  salesMessageHierarchyArabic: string[];
  headlineDirections: {
    angle: 'Outcome' | 'Problem' | 'Mechanism' | 'Cost of Status Quo' | 'Specific Buyer';
    angleArabic: string;
    headlineArabic: string;
    rationaleArabic: string;
  }[];
  ctaDirection: {
    recommendedCTAArabic: string;
    recommendedCTAType: string;
    rationaleArabic: string;
  };
  salesPageSkeleton: {
    sectionTitleArabic: string;
    strategicPurposeArabic: string;
    keyElementsArabic: string[];
  }[];
  primaryExperiment: {
    hypothesisArabic: string;
    whatToChangeArabic: string;
    whatToKeepConstantArabic: string;
    observedEvidenceArabic: string;
    decisionRuleArabic: string;
    whyThisHypothesisMattersArabic: string;
    testAudienceArabic: string;
    evidenceToCollectArabic: string[];
    whatNotToConcludeArabic: string;
  };
  nextThreeQuestionsArabic: [string, string, string];
  sevenDayValidationSprint: {
    dayNumber: number;
    titleArabic: string;
    actionArabic: string;
    expectedEvidenceArabic: string;
  }[];
}

export interface FullOfferBlueprint {
  deterministic: DeterministicDiagnosis;
  aiInterpretation: AIStrategicInterpretation;
  questionnaire: QuestionnaireData;
  generatedAt: string;
}

export interface LeadCaptureData {
  firstName: string;
  email: string;
  marketingConsent: boolean;
  offerStrengthScore: number;
  confidenceScore: number;
  primaryBottleneck: string;
  productType: string;
  offerStage: string;
  recommendedCTA: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  pageUrl?: string;
}

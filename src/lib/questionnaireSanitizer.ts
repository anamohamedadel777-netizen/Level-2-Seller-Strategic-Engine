import {
  QuestionnaireData,
  OfferPath,
  OfferStage,
  ProblemEvidenceStatus,
  CurrentWorkaroundStatus,
  ValueDriver,
  ValueEvidenceStatus,
  DifferentiationEvidenceStatus,
  EvidenceTier,
  ObjectionEvidenceStatus,
  PricingEvidenceContext,
  TriState,
} from '../types';

// Security: Sanitize strings against prompt injection & control characters
export function sanitizeInput(str: unknown): string {
  if (typeof str !== 'string') return '';
  // Strip control chars and cap length to 2000 chars per field
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, 2000);
}

const VALID_OFFER_PATHS: readonly OfferPath[] = [
  'OFFER_PATH_DIGITAL_PRODUCT',
  'OFFER_PATH_COURSE_PROGRAM',
  'OFFER_PATH_SERVICE_CONSULTING',
  'OFFER_PATH_MEMBERSHIP',
  'OFFER_PATH_WORKSHOP_COHORT',
  'OFFER_PATH_NEW_OFFER',
  'OFFER_PATH_LOW_CONVERSION',
];

const VALID_OFFER_STAGES: readonly OfferStage[] = [
  'OFFER_STAGE_0_IDEA_ONLY',
  'OFFER_STAGE_1_NOT_SOLD',
  'OFFER_STAGE_2_INTEREST',
  'OFFER_STAGE_3_COMMITMENT',
  'OFFER_STAGE_4_FIRST_SALES',
  'OFFER_STAGE_5_REPEATABLE_SALES',
  'OFFER_STAGE_6_OPTIMIZATION',
];

const VALID_TRI_STATES: readonly ('YES' | 'NO' | 'NOT_SURE')[] = ['YES', 'NO', 'NOT_SURE'];

const VALID_PROBLEM_EVIDENCE: readonly ProblemEvidenceStatus[] = [
  'SELLER_ASSUMPTION',
  'BUYER_REPORTED',
  'OBSERVED_REPEATED_BEHAVIOR',
  'PAID_PROBLEM_EVIDENCE',
];

const VALID_WORKAROUND: readonly CurrentWorkaroundStatus[] = [
  'NONE_KNOWN',
  'PASSIVE_SUFFERING',
  'DIY_MANUAL',
  'FREE_CONTENT',
  'COMPETING_PAID',
  'HIRING_OR_EXPENSIVE_SERVICE',
];

const VALID_LOSS_TYPES = [
  'time',
  'money',
  'missed_opportunity',
  'stress',
  'complexity',
  'performance',
  'status',
  'business_risk',
] as const;

const VALID_VALUE_DRIVERS: readonly ValueDriver[] = [
  'SAVES_TIME',
  'REDUCES_COST',
  'INCREASES_REVENUE_POTENTIAL',
  'REDUCES_RISK',
  'REDUCES_COMPLEXITY',
  'IMPROVES_SPEED',
  'BUILDS_CAPABILITY',
  'IMPROVES_CONVENIENCE',
  'IMPROVES_STATUS',
  'OTHER',
];

const VALID_VALUE_EVIDENCE: readonly ValueEvidenceStatus[] = [
  'SELLER_ASSUMPTION',
  'BUYER_STATED',
  'OBSERVED_BEHAVIOR',
  'PAID_BEHAVIOR',
];

const VALID_DIFF_EVIDENCE: readonly DifferentiationEvidenceStatus[] = [
  'SELLER_BELIEF',
  'BUYER_MENTIONED_DIFFERENCE',
  'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE',
  'WIN_LOSS_EVIDENCE',
  'REPEATABLE_COMMERCIAL_EVIDENCE',
];

const VALID_EVIDENCE_TIERS: readonly EvidenceTier[] = [
  'TIER_1_DIRECT_COMMERCIAL',
  'TIER_2_OUTCOME_PROOF',
  'TIER_3_BEHAVIORAL_PROOF',
  'TIER_4_MARKET_SIGNALS',
  'TIER_5_SELLER_BELIEF',
];

const VALID_OBJECTION_EVIDENCE: readonly ObjectionEvidenceStatus[] = [
  'NO_BUYER_CONVERSATIONS',
  'ASSUMED_OBJECTIONS_ONLY',
  'ACTUAL_OBJECTIONS_HEARD',
  'REPEATED_ACTUAL_OBJECTIONS',
];

const VALID_PRICING_EVIDENCE: readonly PricingEvidenceContext[] = [
  'NO_REAL_BUYER_CONVERSATIONS',
  'INTEREST_CONVERSATIONS_ONLY',
  'REAL_SALES_CONVERSATIONS',
  'ACTUAL_PURCHASES',
  'REPEAT_PURCHASES',
  'ACTUAL_PURCHASES_AT_SCALE',
];

/**
 * Strict server & production sanitizer.
 * Preserves unanswered states (missing or invalid values become UNSELECTED).
 * Explicit uncertainty choices ('not_sure', 'unknown', 'NOT_SURE') survive ONLY if explicitly supplied.
 */
export function sanitizeQuestionnaire(input: unknown): QuestionnaireData | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;

  // Path & Maturity
  const offerPath: OfferPath = VALID_OFFER_PATHS.includes(raw.offerPath as OfferPath)
    ? (raw.offerPath as OfferPath)
    : 'OFFER_PATH_UNSELECTED';

  const offerStage: OfferStage = VALID_OFFER_STAGES.includes(raw.offerStage as OfferStage)
    ? (raw.offerStage as OfferStage)
    : 'OFFER_STAGE_UNSELECTED';

  // Section A: Offer Context
  const productName = sanitizeInput(raw.productName);
  const productType = sanitizeInput(raw.productType);
  const versionStatus = sanitizeInput(raw.versionStatus);
  const priceAmount = sanitizeInput(raw.priceAmount);
  const currency = sanitizeInput(raw.currency) || 'USD';
  const deliveryMethod = [
    'self-paced',
    'live-cohort',
    '1-on-1',
    'done-for-you',
    'hybrid',
    'template-access',
    'not_selected',
  ].includes(raw.deliveryMethod as string)
    ? (raw.deliveryMethod as string)
    : 'not_selected';

  const isLive: TriState = VALID_TRI_STATES.includes(raw.isLive as any)
    ? (raw.isLive as any)
    : 'UNSELECTED';

  const hasPaidCustomers: TriState = VALID_TRI_STATES.includes(raw.hasPaidCustomers as any)
    ? (raw.hasPaidCustomers as any)
    : 'UNSELECTED';

  const salesVolumeRange = ['0', '1-3', '4-10', '11-30', '31+', 'unselected'].includes(raw.salesVolumeRange as string)
    ? (raw.salesVolumeRange as any)
    : 'unselected';

  // Section B: Target Buyer
  const buyerRole = sanitizeInput(raw.buyerRole);
  const buyerStage = sanitizeInput(raw.buyerStage);
  const buyerSituation = sanitizeInput(raw.buyerSituation);
  const buyerCurrentAlternative = sanitizeInput(raw.buyerCurrentAlternative);
  const buyerTrigger = sanitizeInput(raw.buyerTrigger);

  // Section C: Core Problem
  const coreProblem = sanitizeInput(raw.coreProblem);
  const problemEvidenceStatus: ProblemEvidenceStatus = VALID_PROBLEM_EVIDENCE.includes(raw.problemEvidenceStatus as any)
    ? (raw.problemEvidenceStatus as any)
    : 'UNSELECTED';

  const currentWorkaroundStatus: CurrentWorkaroundStatus = VALID_WORKAROUND.includes(raw.currentWorkaroundStatus as any)
    ? (raw.currentWorkaroundStatus as any)
    : 'UNSELECTED';

  const problemFrequency = ['daily', 'weekly', 'occasional', 'not_sure'].includes(raw.problemFrequency as string)
    ? (raw.problemFrequency as any)
    : 'UNSELECTED';

  const costOfInaction = sanitizeInput(raw.costOfInaction);
  const lossType = Array.isArray(raw.lossType)
    ? (raw.lossType.filter((lt: unknown) => typeof lt === 'string' && (VALID_LOSS_TYPES as readonly string[]).includes(lt)) as any[])
    : [];
  const whyWorthPaying = sanitizeInput(raw.whyWorthPaying);

  // Section D: Desired Outcome
  const beforeState = sanitizeInput(raw.beforeState);
  const afterState = sanitizeInput(raw.afterState);

  const outcomeObservability = [
    'immediately_measurable',
    'visible_over_time',
    'subjective',
    'not_sure',
  ].includes(raw.outcomeObservability as string)
    ? (raw.outcomeObservability as any)
    : 'UNSELECTED';

  const outcomeControllability = [
    'fully_controllable',
    'joint_effort',
    'highly_dependent_on_buyer',
    'not_sure',
  ].includes(raw.outcomeControllability as string)
    ? (raw.outcomeControllability as any)
    : 'UNSELECTED';

  const timeToValue = ['same_day', 'days', 'weeks', 'months', 'unknown'].includes(raw.timeToValue as string)
    ? (raw.timeToValue as any)
    : 'UNSELECTED';

  // Section E: Current Offer Structure
  const includedComponents = Array.isArray(raw.includedComponents)
    ? raw.includedComponents.map(sanitizeInput).filter(Boolean)
    : [];
  const coreComponentsDescription = sanitizeInput(raw.coreComponentsDescription);
  const paddingComponentsDescription = sanitizeInput(raw.paddingComponentsDescription);

  const valueDrivers = Array.isArray(raw.valueDrivers)
    ? (raw.valueDrivers.filter((v: unknown) =>
        typeof v === 'string' && (VALID_VALUE_DRIVERS as readonly string[]).includes(v)
      ) as ValueDriver[])
    : [];

  const valueEvidenceStatus: ValueEvidenceStatus = VALID_VALUE_EVIDENCE.includes(raw.valueEvidenceStatus as any)
    ? (raw.valueEvidenceStatus as any)
    : 'UNSELECTED';

  const coreComponentOutcomeLink = sanitizeInput(raw.coreComponentOutcomeLink);

  // Section F: Differentiation
  const whyNotAlternatives = sanitizeInput(raw.whyNotAlternatives);
  const mechanismType = [
    'documented_method',
    'general_expertise',
    'borrowed_common_method',
    'developing_method',
    'not_sure',
  ].includes(raw.mechanismType as string)
    ? (raw.mechanismType as any)
    : 'UNSELECTED';
  const mechanismDescription = sanitizeInput(raw.mechanismDescription);

  const differentiationEvidenceStatus: DifferentiationEvidenceStatus = VALID_DIFF_EVIDENCE.includes(raw.differentiationEvidenceStatus as any)
    ? (raw.differentiationEvidenceStatus as any)
    : 'UNSELECTED';

  // Section G: Proof
  const evidenceTiersPresent = Array.isArray(raw.evidenceTiersPresent)
    ? (raw.evidenceTiersPresent.filter((t: unknown) =>
        typeof t === 'string' && (VALID_EVIDENCE_TIERS as readonly string[]).includes(t)
      ) as EvidenceTier[])
    : [];
  const proofDetails = sanitizeInput(raw.proofDetails);

  // Section H: Objections
  const actualObjectionsHeard = sanitizeInput(raw.actualObjectionsHeard);
  const assumedObjections = sanitizeInput(raw.assumedObjections);
  const objectionEvidenceStatus: ObjectionEvidenceStatus = VALID_OBJECTION_EVIDENCE.includes(raw.objectionEvidenceStatus as any)
    ? (raw.objectionEvidenceStatus as any)
    : 'UNSELECTED';

  const primaryObjectionCategory = [
    'price',
    'time',
    'trust',
    'need',
    'urgency',
    'complexity',
    'implementation',
    'fit',
    'risk',
    'not_sure',
  ].includes(raw.primaryObjectionCategory as string)
    ? (raw.primaryObjectionCategory as any)
    : 'UNSELECTED';

  // Section I: Pricing Context
  const pricingRationale = [
    'competitor_reference',
    'cost_based',
    'desired_income',
    'intuition',
    'previous_sales',
    'value_based',
    'testing',
    'unknown',
  ].includes(raw.pricingRationale as string)
    ? (raw.pricingRationale as any)
    : 'UNSELECTED';

  const pricingEvidenceContext: PricingEvidenceContext = VALID_PRICING_EVIDENCE.includes(raw.pricingEvidenceContext as any)
    ? (raw.pricingEvidenceContext as any)
    : 'UNSELECTED';

  const hasAnyonePaidExactPrice: TriState = VALID_TRI_STATES.includes(raw.hasAnyonePaidExactPrice as any)
    ? (raw.hasAnyonePaidExactPrice as any)
    : 'UNSELECTED';

  const isPriceRepeatedObjection = [
    'ACTUAL_REPEATED',
    'SOMETIMES',
    'ASSUMED',
    'NO',
    'UNKNOWN',
  ].includes(raw.isPriceRepeatedObjection as string)
    ? (raw.isPriceRepeatedObjection as any)
    : 'UNSELECTED';

  // Section J: Decision Friction
  const checkoutStep = [
    'immediate_checkout',
    'book_call',
    'application',
    'proposal',
    'dm',
    'manual_payment',
    'not_sure',
  ].includes(raw.checkoutStep as string)
    ? (raw.checkoutStep as any)
    : 'UNSELECTED';

  const decisionEffortLevel = ['low', 'moderate', 'high', 'not_sure'].includes(raw.decisionEffortLevel as string)
    ? (raw.decisionEffortLevel as any)
    : 'UNSELECTED';

  const requiresApproval: TriState = VALID_TRI_STATES.includes(raw.requiresApproval as any)
    ? (raw.requiresApproval as any)
    : 'UNSELECTED';

  const hasNextStepClear: TriState = VALID_TRI_STATES.includes(raw.hasNextStepClear as any)
    ? (raw.hasNextStepClear as any)
    : 'UNSELECTED';

  // Section K: Risk & Trust
  const primaryPerceivedRisk = [
    'financial',
    'time',
    'implementation',
    'outcome_uncertainty',
    'credibility',
    'switching',
    'not_sure',
  ].includes(raw.primaryPerceivedRisk as string)
    ? (raw.primaryPerceivedRisk as any)
    : 'UNSELECTED';

  const currentRiskReversals = Array.isArray(raw.currentRiskReversals)
    ? raw.currentRiskReversals.map(sanitizeInput).filter(Boolean)
    : [];

  // Section L: Traffic Context
  const trafficSources = Array.isArray(raw.trafficSources)
    ? raw.trafficSources.map(sanitizeInput).filter(Boolean)
    : [];

  const isTrafficQualified = ['YES', 'PARTIALLY', 'NO', 'NOT_SURE'].includes(raw.isTrafficQualified as string)
    ? (raw.isTrafficQualified as any)
    : 'UNSELECTED';

  return {
    offerPath,
    offerStage,
    productName,
    productType,
    versionStatus,
    priceAmount,
    currency,
    deliveryMethod,
    isLive,
    hasPaidCustomers,
    salesVolumeRange,
    buyerRole,
    buyerStage,
    buyerSituation,
    buyerCurrentAlternative,
    buyerTrigger,
    coreProblem,
    problemEvidenceStatus,
    currentWorkaroundStatus,
    problemFrequency,
    costOfInaction,
    lossType,
    whyWorthPaying,
    beforeState,
    afterState,
    outcomeObservability,
    outcomeControllability,
    timeToValue,
    includedComponents,
    coreComponentsDescription,
    paddingComponentsDescription,
    valueDrivers,
    valueEvidenceStatus,
    coreComponentOutcomeLink,
    whyNotAlternatives,
    mechanismType,
    mechanismDescription,
    differentiationEvidenceStatus,
    evidenceTiersPresent,
    proofDetails,
    actualObjectionsHeard,
    assumedObjections,
    objectionEvidenceStatus,
    primaryObjectionCategory,
    pricingRationale,
    pricingEvidenceContext,
    hasAnyonePaidExactPrice,
    isPriceRepeatedObjection,
    checkoutStep,
    decisionEffortLevel,
    requiresApproval,
    hasNextStepClear,
    primaryPerceivedRisk,
    currentRiskReversals,
    trafficSources,
    isTrafficQualified,
  };
}

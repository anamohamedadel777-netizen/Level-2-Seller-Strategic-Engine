import {
  QuestionnaireData,
  DeterministicDiagnosis,
  DimensionScore,
  BottleneckIdentifier,
  OfferDiagnosisCategory,
  ValidationSprintMode,
  PricingDiagnosisCategory,
  OfferComplexityLevel,
  AIStrategicInterpretation,
} from '../types';
import {
  deriveStrategicDecision,
  deriveFunnelReadiness,
  derivePositioningStatus,
  deriveValuePropositionStatus,
  deriveMissingEvidence,
} from './reportIntegrity';

export function calculateDeterministicDiagnosis(data: QuestionnaireData): DeterministicDiagnosis {
  const flags: string[] = [];

  const isNonEmpty = (val: unknown): boolean => typeof val === 'string' && val.trim().length > 0;

  // ==========================================
  // 1. Dimension 1: Buyer-Offer Fit (Weight 12%)
  // Signal-based: Identity, Stage, Current Situation, Alternative, Trigger.
  // No text-length bonuses! Vague broad audiences penalized!
  // ==========================================
  let buyerScore = 0;
  const buyerRoleDefined = isNonEmpty(data.buyerRole);
  const buyerStageDefined = isNonEmpty(data.buyerStage);
  const buyerSituationDefined = isNonEmpty(data.buyerSituation);
  const buyerAlternativeDefined = isNonEmpty(data.buyerCurrentAlternative);
  const buyerTriggerDefined = isNonEmpty(data.buyerTrigger);

  if (buyerRoleDefined) buyerScore += 25;
  if (buyerStageDefined) buyerScore += 20;
  if (buyerSituationDefined) buyerScore += 20;
  if (buyerAlternativeDefined) buyerScore += 15;
  if (buyerTriggerDefined) buyerScore += 20;

  // Penalize vague / broad audiences regardless of description length
  const vagueTerms = [
    'الكل',
    'أي حد',
    'للجميع',
    'أصحاب البيزنس',
    'الشركات',
    'everyone',
    'anyone',
    'كل أصحاب البيزنس',
    'رواد الأعمال',
    'أي شخص',
    'عام',
    'كل الناس',
    'جميع أصحاب المشاريع',
    'all businesses',
  ];
  const roleText = (data.buyerRole || '').toLowerCase();
  const isVague = vagueTerms.some(term => roleText.includes(term.toLowerCase()));

  if (isVague) {
    buyerScore = Math.min(buyerScore, 25);
    flags.push('الجمهور المستهدف عام جداً وغير مخصص (مثل: الكل أو أصحاب البيزنس)؛ يجب تضييق الشريحة لمرحلة وسياق محددين.');
  }

  buyerScore = Math.max(0, Math.min(100, buyerScore));

  // ==========================================
  // 2. Dimension 2: Problem Strength (Weight 12%)
  // Distinguishes DESCRIPTION from EVIDENCE.
  // Combines:
  // - Problem Economics (frequency, verified consequence, workaround status)
  // - Problem Evidence (problemEvidenceStatus, commercial signals)
  // Free text presence awards minimal structural points (max 15).
  // SELLER_ASSUMPTION alone CANNOT create near-perfect Problem Strength!
  // ==========================================
  let problemScore = 0;

  // A. Structural Presence (Minimal: max 15 points total)
  if (isNonEmpty(data.coreProblem)) problemScore += 5;
  if (isNonEmpty(data.costOfInaction)) problemScore += 5;
  if (isNonEmpty(data.whyWorthPaying)) problemScore += 5;

  // B. Problem Evidence Status (Heavy weight: up to 35 points)
  if (data.problemEvidenceStatus === 'PAID_PROBLEM_EVIDENCE') {
    problemScore += 35; // ناس دفعت بالفعل عشان تحل مشكلة قريبة
  } else if (data.problemEvidenceStatus === 'OBSERVED_REPEATED_BEHAVIOR') {
    problemScore += 25; // شايف سلوك متكرر ومحاولات فعلية لحلها
  } else if (data.problemEvidenceStatus === 'BUYER_REPORTED') {
    problemScore += 15; // سمعتها بشكل متكرر من عملاء محتملين
  } else if (data.problemEvidenceStatus === 'SELLER_ASSUMPTION') {
    problemScore += 5;  // دي فرضية مني ولسه مختبرتهاش
  }
  // UNSELECTED gives 0 points

  // C. Problem Frequency (up to 20 points)
  if (data.problemFrequency === 'daily') problemScore += 20;
  else if (data.problemFrequency === 'weekly') problemScore += 12;
  else if (data.problemFrequency === 'occasional') problemScore += 5;
  // not_sure gives 0 points

  // D. Current Workaround Evidence (up to 15 points)
  if (data.currentWorkaroundStatus === 'COMPETING_PAID') {
    problemScore += 15; // مشترك في أداة أو خدمة مدفوعة = الرغبة في الدفع مثبتة تجارياً
  } else if (data.currentWorkaroundStatus === 'HIRING_OR_EXPENSIVE_SERVICE') {
    problemScore += 15; // تكلفة توظيف عالية = ألم اقتصادي مؤكد
  } else if (data.currentWorkaroundStatus === 'DIY_MANUAL') {
    problemScore += 10; // محاولات يدوية مجهدة = ألم حقيقي يبحث عن حل فعال
  } else if (data.currentWorkaroundStatus === 'FREE_CONTENT') {
    problemScore += 6;  // بحث نشط عن حلول مجانية
  } else if (data.currentWorkaroundStatus === 'PASSIVE_SUFFERING') {
    problemScore += 2;  // استسلام للمشكلة = دافعية شراء منخفضة
  }
  // NONE_KNOWN / UNSELECTED gives 0 points

  // E. Verified Economic Consequences & Loss Types (up to 15 points)
  const validLossTypes = (data.lossType || []).filter(t =>
    ['time', 'money', 'missed_opportunity', 'stress', 'complexity', 'performance', 'status', 'business_risk'].includes(t)
  );
  if (validLossTypes.length >= 3) {
    problemScore += 12;
  } else if (validLossTypes.length >= 2) {
    problemScore += 8;
  } else if (validLossTypes.length === 1) {
    problemScore += 4;
  }
  if (validLossTypes.includes('money') || validLossTypes.includes('business_risk')) {
    problemScore += 3;
  }

  // Hard Ceiling: Seller Assumption alone CANNOT create a near-perfect problem score
  if (data.problemEvidenceStatus === 'SELLER_ASSUMPTION') {
    problemScore = Math.min(problemScore, 65);
    flags.push('المشكلة مبنية على فرضية ذاتية للبائع ولم تُختبر مع مشترين حقيقيين؛ لا يمكن اعتبارها مشكلة تجارية مؤكدة.');
  }

  problemScore = Math.max(0, Math.min(100, problemScore));

  // ==========================================
  // 3. Dimension 3: Outcome Clarity (Weight 11%)
  // Signal-based: Observability, Controllability, Time-to-Value.
  // Free text presence is reduced to minimal structural points (20 max).
  // not_sure / unknown gives 0 evidence!
  // ==========================================
  let outcomeScore = 0;
  if (isNonEmpty(data.beforeState)) outcomeScore += 10;
  if (isNonEmpty(data.afterState)) outcomeScore += 10;

  if (data.outcomeObservability === 'immediately_measurable') outcomeScore += 35;
  else if (data.outcomeObservability === 'visible_over_time') outcomeScore += 20;
  else if (data.outcomeObservability === 'subjective') outcomeScore += 5;
  // not_sure gives 0 points

  if (data.outcomeControllability === 'fully_controllable') outcomeScore += 25;
  else if (data.outcomeControllability === 'joint_effort') outcomeScore += 18;
  else if (data.outcomeControllability === 'highly_dependent_on_buyer') outcomeScore += 8;
  // not_sure gives 0 points

  if (data.timeToValue === 'same_day' || data.timeToValue === 'days') outcomeScore += 20;
  else if (data.timeToValue === 'weeks') outcomeScore += 12;
  else if (data.timeToValue === 'months') outcomeScore += 5;
  // unknown gives 0 points

  outcomeScore = Math.max(0, Math.min(100, outcomeScore));

  // ==========================================
  // 4. Dimension 4: Perceived Value (Weight 13%)
  // Rebuilt around explicit Value Drivers and Value Evidence Status.
  // Free text presence contributes only small structural points (<= 15 pts).
  // Most scoring comes from valueDrivers, valueEvidenceStatus, problem evidence,
  // outcome relevance, time-to-value, and risk reduction.
  // Hard Cap: If valueEvidenceStatus = SELLER_ASSUMPTION, score MUST NOT exceed 60.
  // Hard Cap: If valueEvidenceStatus = UNSELECTED, score MUST NOT exceed 35.
  // ==========================================
  let perceivedValueScore = 0;

  // 1. Structural baseline for having defined elements (small points only, no length rewards)
  if (isNonEmpty(data.coreComponentsDescription)) perceivedValueScore += 5;
  if (isNonEmpty(data.whyWorthPaying)) perceivedValueScore += 5;
  if (isNonEmpty(data.coreComponentOutcomeLink)) perceivedValueScore += 5;

  // 2. Value Drivers
  const vDrivers = data.valueDrivers || [];
  if (vDrivers.length > 0) {
    perceivedValueScore += 10; // Baseline for structured value definition
    perceivedValueScore += Math.min(15, vDrivers.length * 3); // Scaled by driver breadth
    const economicDrivers = ['SAVES_TIME', 'REDUCES_COST', 'INCREASES_REVENUE_POTENTIAL', 'REDUCES_RISK', 'IMPROVES_SPEED'];
    const hasEconomic = vDrivers.some(d => economicDrivers.includes(d));
    if (hasEconomic) perceivedValueScore += 5; // Direct economic impact bonus
  }

  // 3. Value Evidence Status (the primary evidentiary engine)
  if (data.valueEvidenceStatus === 'PAID_BEHAVIOR') {
    perceivedValueScore += 35;
  } else if (data.valueEvidenceStatus === 'OBSERVED_BEHAVIOR') {
    perceivedValueScore += 25;
  } else if (data.valueEvidenceStatus === 'BUYER_STATED') {
    perceivedValueScore += 12;
  } else if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') {
    perceivedValueScore += 4;
  }

  // 4. Alignment with problem evidence & outcome clarity
  if (data.problemEvidenceStatus === 'PAID_PROBLEM_EVIDENCE') {
    perceivedValueScore += 10;
  } else if (data.problemEvidenceStatus === 'OBSERVED_REPEATED_BEHAVIOR') {
    perceivedValueScore += 7;
  }

  if (data.outcomeObservability === 'immediately_measurable') {
    perceivedValueScore += 10;
  } else if (data.outcomeObservability === 'visible_over_time') {
    perceivedValueScore += 5;
  }

  if (data.timeToValue === 'same_day' || data.timeToValue === 'days') {
    perceivedValueScore += 8;
  } else if (data.timeToValue === 'weeks') {
    perceivedValueScore += 4;
  }

  // 5. Delivery leverage & Risk Reversals
  const comps = data.includedComponents || [];
  if (comps.length > 0) {
    const highLeverage = ['templates', 'tools', 'audits', 'done_for_you'];
    const matched = comps.filter(c => highLeverage.includes(c)).length;
    if (matched > 0) perceivedValueScore += 5;
  }
  const risks = data.currentRiskReversals || [];
  if (risks.length > 0 && !risks.includes('none')) {
    perceivedValueScore += 5;
  }

  // 6. Fluff / Overstuffing penalty
  if (isNonEmpty(data.paddingComponentsDescription) && comps.length >= 5) {
    perceivedValueScore = Math.max(15, perceivedValueScore - 12);
  }

  // 7. Strict Evidentiary Caps
  if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') {
    // Seller Assumption alone CANNOT create high perceived value
    perceivedValueScore = Math.min(60, perceivedValueScore);
  } else if (!data.valueEvidenceStatus || data.valueEvidenceStatus === 'UNSELECTED') {
    // Unselected evidence capped at <= 35
    perceivedValueScore = Math.min(35, perceivedValueScore);
  } else if (data.valueEvidenceStatus === 'BUYER_STATED') {
    perceivedValueScore = Math.min(75, perceivedValueScore);
  }

  perceivedValueScore = Math.max(0, Math.min(100, perceivedValueScore));

  // ==========================================
  // 5. Dimension 5: Differentiation (Weight 10%)
  // Rebuilt: Separates structuralDifferentiation from buyerValuedDifferentiation.
  // Documented method increases structural differentiation, but without buyer evidence,
  // buyerValuedDifferentiation remains weak.
  // Hard caps:
  // - SELLER_BELIEF: Differentiation maximum 55.
  // - BUYER_MENTIONED_DIFFERENCE: maximum ~70-75.
  // - BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE: may reach high scores.
  // - WIN_LOSS_EVIDENCE / REPEATABLE_COMMERCIAL_EVIDENCE: supports very high differentiation.
  // Free-text length is NOT scored.
  // ==========================================
  let structuralDifferentiation = 0;
  if (data.mechanismType === 'documented_method') structuralDifferentiation += 50;
  else if (data.mechanismType === 'developing_method') structuralDifferentiation += 30;
  else if (data.mechanismType === 'general_expertise') structuralDifferentiation += 15;
  else if (data.mechanismType === 'borrowed_common_method') structuralDifferentiation += 10;
  // not_sure gives 0 points

  if (isNonEmpty(data.mechanismDescription)) structuralDifferentiation += 15;
  if (isNonEmpty(data.whyNotAlternatives)) structuralDifferentiation += 15;

  if (data.currentWorkaroundStatus === 'COMPETING_PAID' || data.currentWorkaroundStatus === 'HIRING_OR_EXPENSIVE_SERVICE') {
    structuralDifferentiation += 20;
  } else if (data.currentWorkaroundStatus === 'DIY_MANUAL') {
    structuralDifferentiation += 10;
  }
  structuralDifferentiation = Math.max(0, Math.min(100, structuralDifferentiation));

  let buyerValuedDifferentiation = 0;
  switch (data.differentiationEvidenceStatus) {
    case 'REPEATABLE_COMMERCIAL_EVIDENCE':
      buyerValuedDifferentiation = 100;
      break;
    case 'WIN_LOSS_EVIDENCE':
      buyerValuedDifferentiation = 90;
      break;
    case 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE':
      buyerValuedDifferentiation = 80;
      break;
    case 'BUYER_MENTIONED_DIFFERENCE':
      buyerValuedDifferentiation = 55;
      break;
    case 'SELLER_BELIEF':
      buyerValuedDifferentiation = 20;
      break;
    default:
      buyerValuedDifferentiation = 0;
      break;
  }

  // Combine structural and buyer-valued differentiation
  let diffScore = Math.round((structuralDifferentiation * 0.45) + (buyerValuedDifferentiation * 0.55));

  // Enforce evidentiary hard caps
  if (data.differentiationEvidenceStatus === 'SELLER_BELIEF') {
    diffScore = Math.min(55, diffScore);
  } else if (!data.differentiationEvidenceStatus || data.differentiationEvidenceStatus === 'UNSELECTED') {
    diffScore = Math.min(30, diffScore);
  } else if (data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE') {
    diffScore = Math.min(75, diffScore);
  } else if (data.differentiationEvidenceStatus === 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE') {
    diffScore = Math.min(90, diffScore);
  }

  diffScore = Math.max(0, Math.min(100, diffScore));

  // ==========================================
  // 6. Dimension 6: Proof Strength (Weight 12%)
  // Strict Evidence Tiering! Multiple Tier 4 signals never equal Tier 1!
  // Text length of proofDetails does NOT add evidence points.
  // ==========================================
  let proofScore = 0;
  const tiers = data.evidenceTiersPresent || [];

  if (tiers.includes('TIER_1_DIRECT_COMMERCIAL')) {
    proofScore += 60;
    if (data.salesVolumeRange === '31+') proofScore += 30;
    else if (data.salesVolumeRange === '11-30') proofScore += 20;
    else if (data.salesVolumeRange === '4-10') proofScore += 12;
    else if (data.salesVolumeRange === '1-3') proofScore += 5;
  } else if (tiers.includes('TIER_2_OUTCOME_PROOF')) {
    proofScore += 45;
  } else if (tiers.includes('TIER_3_BEHAVIORAL_PROOF')) {
    proofScore += 25;
  } else if (tiers.includes('TIER_4_MARKET_SIGNALS')) {
    proofScore += 10; // capped low!
  } else if (tiers.includes('TIER_5_SELLER_BELIEF')) {
    proofScore += 5;
  }

  proofScore = Math.max(0, Math.min(100, proofScore));

  // ==========================================
  // 7. Dimension 7: Objection Coverage (Weight 10%)
  // Actual objections > assumed objections.
  // Uses objectionEvidenceStatus to ground market reality:
  // REPEATED_ACTUAL_OBJECTIONS: strong evidence (adds 65 pts + text)
  // ACTUAL_OBJECTIONS_HEARD: moderate evidence (adds 45 pts + text)
  // ASSUMED_OBJECTIONS_ONLY: seller assumptions (max 20 pts, cannot inflate coverage)
  // NO_BUYER_CONVERSATIONS: absence of objections is NEVER positive evidence (0 pts)
  // ==========================================
  let objectionScore = 0;
  const hasActualObj = isNonEmpty(data.actualObjectionsHeard);
  const hasAssumedObj = isNonEmpty(data.assumedObjections);

  if (data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS') {
    objectionScore += hasActualObj ? 65 : 45;
  } else if (data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD') {
    objectionScore += hasActualObj ? 50 : 35;
  } else if (data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') {
    objectionScore += hasAssumedObj ? 20 : 10;
  } else if (data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS') {
    // 0 evidence points from objections if no conversations occurred
    objectionScore += 0;
  } else {
    // Fallback if UNSELECTED: rely purely on actual text
    if (hasActualObj) objectionScore += 55;
    else if (hasAssumedObj) objectionScore += 20;
  }

  if (
    data.primaryObjectionCategory &&
    data.primaryObjectionCategory !== 'not_sure' &&
    data.primaryObjectionCategory !== 'UNSELECTED'
  ) {
    objectionScore += 25;
  }

  // Cap if pre-sales or no actual buyer conversations
  const isPreSales =
    data.salesVolumeRange === '0' ||
    data.salesVolumeRange === 'unselected' ||
    data.hasPaidCustomers === 'NO';

  const hasVerifiedBuyerObjections =
    (data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD' ||
      data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS') &&
    hasActualObj;

  if (
    (isPreSales ||
      data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS' ||
      data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') &&
    !hasVerifiedBuyerObjections
  ) {
    objectionScore = Math.min(objectionScore, 40);
  }

  objectionScore = Math.max(0, Math.min(100, objectionScore));

  // ==========================================
  // 8. Dimension 8: Pricing Logic (Weight 8%)
  // UNKNOWN / NOT_SURE / UNSELECTED gives 0 positive points.
  // Rebuilt with PricingEvidenceContext.
  // ==========================================
  let pricingScore = 0;
  if (data.pricingRationale === 'value_based' || data.pricingRationale === 'previous_sales') {
    pricingScore += 35;
  } else if (data.pricingRationale === 'competitor_reference' || data.pricingRationale === 'testing') {
    pricingScore += 20;
  } else if (data.pricingRationale === 'cost_based') {
    pricingScore += 10;
  }
  // unknown, intuition, UNSELECTED gives 0 points

  if (data.hasAnyonePaidExactPrice === 'YES') {
    pricingScore += 25;
  }
  // NO / NOT_SURE / UNSELECTED gives 0 points

  // A "NO repeated price objection" may add positive evidence ONLY if real price exposure occurred:
  // pricingEvidenceContext must be REAL_SALES_CONVERSATIONS, ACTUAL_PURCHASES, REPEAT_PURCHASES, or ACTUAL_PURCHASES_AT_SCALE.
  // If NO_REAL_BUYER_CONVERSATIONS, INTEREST_CONVERSATIONS_ONLY, or UNSELECTED: adds ZERO points!
  const hasRealPriceExposure =
    data.pricingEvidenceContext === 'REAL_SALES_CONVERSATIONS' ||
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES' ||
    data.pricingEvidenceContext === 'REPEAT_PURCHASES' ||
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE';

  if (data.isPriceRepeatedObjection === 'NO' && hasRealPriceExposure) {
    pricingScore += 15;
  }

  // Points from PricingEvidenceContext
  if (data.pricingEvidenceContext === 'REPEAT_PURCHASES') {
    pricingScore += 25;
  } else if (
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES' ||
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE'
  ) {
    pricingScore += 25;
  } else if (data.pricingEvidenceContext === 'REAL_SALES_CONVERSATIONS') {
    pricingScore += 18;
  } else if (data.pricingEvidenceContext === 'INTEREST_CONVERSATIONS_ONLY') {
    pricingScore += 8;
  }

  // Hard caps on pricing logic
  if (data.pricingEvidenceContext === 'NO_REAL_BUYER_CONVERSATIONS') {
    pricingScore = Math.min(50, pricingScore);
  } else if (!data.pricingEvidenceContext || data.pricingEvidenceContext === 'UNSELECTED') {
    pricingScore = Math.min(35, pricingScore);
  }

  pricingScore = Math.max(0, Math.min(100, pricingScore));

  // ==========================================
  // 9. Dimension 9: Risk & Trust (Weight 6%)
  // primaryPerceivedRisk by itself awards 0 Offer Strength points.
  // Identifying a risk improves diagnostic clarity, NOT risk reduction.
  // Points come ONLY from actual mitigations and proof!
  // ==========================================
  let riskScore = 0;
  const rawReversals = data.currentRiskReversals || [];
  const validReversals = rawReversals
    .map(r => r.toUpperCase())
    .filter(r => r !== 'NONE' && r !== '');

  if (validReversals.length > 0) {
    let mitigationPoints = 0;
    if (validReversals.includes('CLEAR_SCOPE') || rawReversals.includes('clear_scope')) mitigationPoints += 25;
    if (validReversals.includes('TRANSPARENT_EXPECTATIONS') || rawReversals.includes('transparent_faq')) mitigationPoints += 20;
    if (validReversals.includes('DEMO') || rawReversals.includes('demo')) mitigationPoints += 25;
    if (validReversals.includes('SAMPLE') || rawReversals.includes('sample')) mitigationPoints += 20;
    if (validReversals.includes('PILOT') || rawReversals.includes('pilot')) mitigationPoints += 25;
    if (validReversals.includes('TRIAL') || rawReversals.includes('trial')) mitigationPoints += 25;
    if (validReversals.includes('GUARANTEE') || rawReversals.includes('guarantee')) mitigationPoints += 20;
    if (validReversals.includes('PAYMENT_STRUCTURE') || rawReversals.includes('payment_structure')) mitigationPoints += 20;
    if (validReversals.includes('REFUND_POLICY') || rawReversals.includes('refund_policy')) mitigationPoints += 20;
    if (validReversals.includes('COMMERCIAL_PROOF') || rawReversals.includes('commercial_proof')) mitigationPoints += 30;
    if (validReversals.includes('OUTCOME_PROOF') || rawReversals.includes('outcome_proof')) mitigationPoints += 25;
    if (validReversals.includes('OTHER') || rawReversals.includes('other')) mitigationPoints += 15;

    // Check additional proof signals reinforcing trust
    if (tiers.includes('TIER_1_DIRECT_COMMERCIAL')) mitigationPoints += 15;
    else if (tiers.includes('TIER_2_OUTCOME_PROOF')) mitigationPoints += 10;

    riskScore = Math.min(100, mitigationPoints);
  }

  // primaryPerceivedRisk by itself gives 0 points.
  riskScore = Math.max(0, Math.min(100, riskScore));

  // ==========================================
  // 10. Dimension 10: Decision Friction (Weight 6%)
  // UNKNOWN / NOT_SURE gives 0 positive points.
  // ==========================================
  let frictionScore = 0;
  if (data.hasNextStepClear === 'YES') {
    frictionScore += 45;
  }
  // NO / NOT_SURE gives 0 points

  if (data.requiresApproval === 'NO') {
    frictionScore += 25;
  }
  // YES / NOT_SURE gives 0 points

  if (data.checkoutStep && data.checkoutStep !== 'not_sure') {
    frictionScore += 20;
  }

  if (data.decisionEffortLevel === 'low') frictionScore += 10;
  else if (data.decisionEffortLevel === 'moderate') frictionScore += 5;
  // high / not_sure gives 0 points

  frictionScore = Math.max(0, Math.min(100, frictionScore));

  // ==========================================
  // Complexity Index Calculation
  // ==========================================
  const componentCount = (data.includedComponents || []).length;
  const paddingLen = (data.paddingComponentsDescription || '').trim().length;
  let complexityLevel: OfferComplexityLevel = 'LOW';
  if (componentCount >= 7 || (componentCount >= 5 && paddingLen > 25)) {
    complexityLevel = 'VERY_HIGH';
  } else if (componentCount >= 5 || paddingLen > 20) {
    complexityLevel = 'HIGH';
  } else if (componentCount >= 3) {
    complexityLevel = 'MODERATE';
  }

  // ==========================================
  // Dimension Dictionary with User-Facing Reasoning
  // ==========================================
  const dimensionScores: Record<string, DimensionScore> = {
    buyer_offer_fit: {
      id: 'buyer_offer_fit',
      nameArabic: 'ملاءمة المشتري والعرض',
      nameEnglish: 'Buyer-Offer Fit',
      score: Math.round(buyerScore),
      weight: 12,
      weightedScore: Math.round((buyerScore * 12) / 100),
      epistemicStatus: buyerRoleDefined ? 'USER_FACT' : 'MISSING_DATA',
      notes: isVague
        ? 'التقييم منخفض لأن تعريف المشتري ما زال واسعاً وعاماً جداً (مثل: الكل أو أصحاب البيزنس)، مش لأن وصفك قصير.'
        : buyerScore >= 70
        ? 'التقييم يعكس تحديداً هيكلياً واضحاً لهوية المشتري ومرحلته وسياق معاناته والبديل الحالي.'
        : 'تحديد المشتري يحتاج إيضاحاً لمرحلة الدخول والبديل المستخدم والشرارة المحفزة.',
    },
    problem_strength: {
      id: 'problem_strength',
      nameArabic: 'قوة وإلحاح المشكلة',
      nameEnglish: 'Problem Strength',
      score: Math.round(problemScore),
      weight: 12,
      weightedScore: Math.round((problemScore * 12) / 100),
      epistemicStatus:
        data.problemEvidenceStatus === 'PAID_PROBLEM_EVIDENCE' ||
        data.problemEvidenceStatus === 'OBSERVED_REPEATED_BEHAVIOR'
          ? 'OBSERVED_EVIDENCE'
          : data.problemEvidenceStatus === 'BUYER_REPORTED'
          ? 'USER_CLAIM'
          : data.problemEvidenceStatus === 'SELLER_ASSUMPTION'
          ? 'USER_CLAIM'
          : 'MISSING_DATA',
      notes:
        data.problemEvidenceStatus === 'SELLER_ASSUMPTION'
          ? 'المشكلة مقيدة لأنها مجرد فرضية شخصية للبائع؛ لا يمكن منح تقييم مرتفع بدون دليل سلوكي أو شراء سابق.'
          : data.problemEvidenceStatus === 'PAID_PROBLEM_EVIDENCE'
          ? 'المشكلة مدعومة بأقوى دليل تجاري: مشتري دفع بالفعل لحل بديل أو مشكلة قريبة.'
          : data.problemEvidenceStatus === 'OBSERVED_REPEATED_BEHAVIOR'
          ? 'المشكلة مدعومة بملاحظة سلوك متكرر ومحاولات حقيقية من السوق للحل.'
          : data.problemFrequency === 'not_sure'
          ? 'تكرار المشكلة غير مؤكد؛ خيار غير متأكد لا يمنح أي نقاط.'
          : 'التقييم يعتمد على تكرار المشكلة وتكلفة عدم الحل ومستوى الدليل والبدائل الحالية.',
    },
    outcome_clarity: {
      id: 'outcome_clarity',
      nameArabic: 'وضوح النتيجة الملموسة',
      nameEnglish: 'Outcome Clarity',
      score: Math.round(outcomeScore),
      weight: 11,
      weightedScore: Math.round((outcomeScore * 11) / 100),
      epistemicStatus: data.outcomeObservability === 'immediately_measurable' ? 'OBSERVED_EVIDENCE' : 'USER_CLAIM',
      notes: data.outcomeObservability === 'not_sure'
        ? 'النتيجة غير واضحة لغياب معيار قابل للملاحظة أو القياس؛ خيار غير متأكد يقلل الثقة ولا يمنح نقاطاً.'
        : 'يقيس وضوح الفارق بين حالة ما قبل الشراء وما بعده وسرعة ظهور القيمة.',
    },
    perceived_value: {
      id: 'perceived_value',
      nameArabic: 'القيمة المدركة',
      nameEnglish: 'Perceived Value',
      score: Math.round(perceivedValueScore),
      weight: 13,
      weightedScore: Math.round((perceivedValueScore * 13) / 100),
      epistemicStatus:
        data.valueEvidenceStatus === 'PAID_BEHAVIOR' || data.valueEvidenceStatus === 'OBSERVED_BEHAVIOR'
          ? 'OBSERVED_EVIDENCE'
          : data.valueEvidenceStatus === 'BUYER_STATED'
          ? 'USER_CLAIM'
          : data.valueEvidenceStatus === 'SELLER_ASSUMPTION'
          ? 'USER_CLAIM'
          : 'MISSING_DATA',
      notes:
        data.valueEvidenceStatus === 'SELLER_ASSUMPTION'
          ? 'القيمة المدركة مقيدة (بحد أقصى 60) لأنها مبنية على رؤية وافتراضات شخصية للبائع دون تحقق تجاري أو سلوكي من المشتري.'
          : data.valueEvidenceStatus === 'PAID_BEHAVIOR'
          ? 'القيمة مدعومة بدليل دفع حقيقي وسلوك تجاري مثبت، مع ربط المكون الأساسي بالنتيجة ومحركات القيمة.'
          : data.valueEvidenceStatus === 'OBSERVED_BEHAVIOR'
          ? 'القيمة مدعومة بملاحظة استثمار المشتري الفعلي للوقت أو الجهد أو المال للحصول عليها.'
          : data.valueEvidenceStatus === 'BUYER_STATED'
          ? 'القيمة مبنية على تصريحات من مشترين محتملين، لكنها تحتاج اختبار الدفع الفعلي.'
          : 'تقييم القيمة يركز على محركات القيمة ومستوى الدليل وربط المكون بالنتيجة، وليس على كثرة المكونات أو البونصات.',
    },
    differentiation: {
      id: 'differentiation',
      nameArabic: 'التمايز والآلية الخاصة',
      nameEnglish: 'Differentiation',
      score: Math.round(diffScore),
      weight: 10,
      weightedScore: Math.round((diffScore * 10) / 100),
      epistemicStatus:
        data.differentiationEvidenceStatus === 'REPEATABLE_COMMERCIAL_EVIDENCE' ||
        data.differentiationEvidenceStatus === 'WIN_LOSS_EVIDENCE' ||
        data.differentiationEvidenceStatus === 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE'
          ? 'OBSERVED_EVIDENCE'
          : data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE'
          ? 'USER_FACT'
          : 'USER_CLAIM',
      notes:
        data.differentiationEvidenceStatus === 'SELLER_BELIEF'
          ? 'العرض عنده اختلاف هيكلي لكن القيمة التمايزية غير مؤكدة عند المشتري؛ التفوق لا يزال مجرد اعتقاد شخصي للبائع بانتظار التحقق من قرارات الشراء الفعلية.'
          : data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE'
          ? 'العرض عنده اختلاف هيكلي واضح وملاحظ من المشترين، لكن قوة التمايز التجاري تتطلب إثبات أن هذا الفرق هو سبب الاختيار والدفع.'
          : data.differentiationEvidenceStatus === 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE'
          ? 'تمايز تجاري قوي ومثبت؛ أكد العملاء أن هذه الآلية أو الفارق كان سبباً مباشراً لاختيار العرض.'
          : data.differentiationEvidenceStatus === 'WIN_LOSS_EVIDENCE' || data.differentiationEvidenceStatus === 'REPEATABLE_COMMERCIAL_EVIDENCE'
          ? 'تمايز تجاري مثبت بأدلة قرارات شراء حقيقية وسلوك متكرر يوضح أثر الفارق في تفضيل العرض.'
          : 'العرض عنده اختلاف هيكلي واضح، لكن قوة التمايز التجاري تعتمد على وجود دليل إن المشتري نفسه بيعتبر الفرق ده سببًا للاختيار.',
    },
    proof_strength: {
      id: 'proof_strength',
      nameArabic: 'قوة الإثبات والأدلة',
      nameEnglish: 'Proof Strength',
      score: Math.round(proofScore),
      weight: 12,
      weightedScore: Math.round((proofScore * 12) / 100),
      epistemicStatus: tiers.includes('TIER_1_DIRECT_COMMERCIAL') ? 'OBSERVED_EVIDENCE' : 'MISSING_DATA',
      notes: tiers.includes('TIER_1_DIRECT_COMMERCIAL')
        ? 'يستند التقييم إلى مبيعات تجارية حقيقية لعملاء دفعوا بالفعل.'
        : 'التقييم يستند حصراً إلى مستويات الإثبات الموثقة (Tier)؛ التفاصيل الإنشائية لا تصنع دليلاً تجارياً.',
    },
    objection_coverage: {
      id: 'objection_coverage',
      nameArabic: 'معالجة الاعتراضات',
      nameEnglish: 'Objection Coverage',
      score: Math.round(objectionScore),
      weight: 10,
      weightedScore: Math.round((objectionScore * 10) / 100),
      epistemicStatus:
        data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS' ||
        data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD' ||
        hasActualObj
          ? 'OBSERVED_EVIDENCE'
          : data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY'
          ? 'USER_CLAIM'
          : 'MISSING_DATA',
      notes:
        data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS'
          ? 'اعتراضات نمطية متكررة سمعها البائع في مكالمات ومحادثات مبيعات فعلية؛ تغطية الاعتراضات مستندة لواقع السوق.'
          : data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD' || hasActualObj
          ? 'اعتراضات موثقة سمعها البائع مباشرة من مشترين محتملين.'
          : data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY'
          ? 'اعتراضات مفترضة مسبقاً من طرف البائع؛ تساعد في التخطيط لكنها لا تشكل دليلاً على سلوك المشترين الفعلي.'
          : 'غياب محادثات البيع الكافية؛ لا يمكن احتساب عدم ظهور اعتراضات كدليل إيجابي على متانة العرض.',
    },
    pricing_logic: {
      id: 'pricing_logic',
      nameArabic: 'منطقية التسعير',
      nameEnglish: 'Pricing Logic',
      score: Math.round(pricingScore),
      weight: 8,
      weightedScore: Math.round((pricingScore * 8) / 100),
      epistemicStatus:
        data.pricingEvidenceContext === 'REPEAT_PURCHASES' ||
        data.pricingEvidenceContext === 'ACTUAL_PURCHASES' ||
        data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE' ||
        data.hasAnyonePaidExactPrice === 'YES'
          ? 'OBSERVED_EVIDENCE'
          : data.pricingEvidenceContext === 'REAL_SALES_CONVERSATIONS'
          ? 'USER_FACT'
          : 'USER_CLAIM',
      notes:
        data.pricingEvidenceContext === 'NO_REAL_BUYER_CONVERSATIONS'
          ? 'السعر محدد دون محادثات مبيعات حقيقية مع مشترين؛ مقيد بحد أقصى لكونه افتراضاً نظرياً بانتظار اختبار السوق.'
          : data.pricingEvidenceContext === 'REPEAT_PURCHASES'
          ? 'السعر مدعوم بعمليات شراء متكررة وتجديد اشتراكات تثبت قبول السوق المستمر.'
          : data.pricingEvidenceContext === 'ACTUAL_PURCHASES' ||
            data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE' ||
            data.hasAnyonePaidExactPrice === 'YES'
          ? 'السعر مدعوم بعمليات شراء وسلوك دفع حقيقي بنفس القيمة أو بنطاق مقارب.'
          : data.pricingEvidenceContext === 'REAL_SALES_CONVERSATIONS'
          ? 'تم اختبار السعر في محادثات مبيعات فعلية مع مشترين وجرى فحص تقبل السوق له.'
          : 'يقيس مدى تناسب السعر مع القيمة المدركة وأدلة سلوك الشراء في السوق.',
    },
    risk_and_trust: {
      id: 'risk_and_trust',
      nameArabic: 'تقليل المخاطرة وبناء الثقة',
      nameEnglish: 'Risk & Trust',
      score: Math.round(riskScore),
      weight: 6,
      weightedScore: Math.round((riskScore * 6) / 100),
      epistemicStatus: validReversals.length > 0 ? 'USER_FACT' : 'MISSING_DATA',
      notes: validReversals.length > 0
        ? 'تم احتساب النقاط بناءً على وسائل نزع المخاطرة الفعلية (نطاق العمل، الديمو، الضمان المناسب) وليس مجرد إدراك الخوف.'
        : 'غياب وسائل نزع المخاطرة الملموسة يرفع تردد المشتري؛ إدراك الخوف بمفرده لا يمنح أي نقاط في قوة العرض.',
    },
    decision_friction: {
      id: 'decision_friction',
      nameArabic: 'احتكاك وسهولة اتخاذ القرار',
      nameEnglish: 'Decision Friction',
      score: Math.round(frictionScore),
      weight: 6,
      weightedScore: Math.round((frictionScore * 6) / 100),
      epistemicStatus: data.hasNextStepClear === 'YES' ? 'USER_FACT' : 'MISSING_DATA',
      notes: data.hasNextStepClear === 'YES'
        ? 'الخطوة التالية لإتمام الشراء واضحة وسلسة للمشتري.'
        : 'توجد ضبابية أو عدم يقين في الخطوة التالية لإتمام الشراء؛ لم تُمنح أي نقاط افتراضية.',
    },
  };

  // Total Offer Strength Score (sum of weighted scores)
  let totalOfferStrength = 0;
  Object.values(dimensionScores).forEach(d => {
    totalOfferStrength += (d.score * d.weight) / 100;
  });
  totalOfferStrength = Math.round(totalOfferStrength);

  // ==========================================
  // CONFIDENCE SCORE (0 - 100)
  // Strictly absorbs uncertainty.
  // Depends on actual observed evidence vs assumptions vs missing data.
  // UNKNOWN / NOT_SURE answers actively reduce confidence!
  // ==========================================
  let confidenceScore = 10; // modest baseline

  // Positive evidentiary signals
  if (tiers.includes('TIER_1_DIRECT_COMMERCIAL') || data.hasPaidCustomers === 'YES') {
    confidenceScore += 35;
    if (data.salesVolumeRange === '31+') confidenceScore += 15;
    else if (data.salesVolumeRange === '11-30') confidenceScore += 10;
    else if (data.salesVolumeRange === '4-10') confidenceScore += 5;
  } else if (tiers.includes('TIER_2_OUTCOME_PROOF')) {
    confidenceScore += 20;
  } else if (tiers.includes('TIER_3_BEHAVIORAL_PROOF')) {
    confidenceScore += 10;
  }

  if (hasActualObj) {
    confidenceScore += 15;
  }

  if (data.hasAnyonePaidExactPrice === 'YES') {
    confidenceScore += 10;
  }

  if (data.isLive === 'YES') {
    confidenceScore += 5;
  }

  if (data.hasNextStepClear === 'YES') {
    confidenceScore += 5;
  }

  if (data.isTrafficQualified === 'YES' || data.isTrafficQualified === 'NO') {
    confidenceScore += 5;
  }

  // Evidentiary signals from problem evidence status
  if (data.problemEvidenceStatus === 'PAID_PROBLEM_EVIDENCE') {
    confidenceScore += 15;
  } else if (data.problemEvidenceStatus === 'OBSERVED_REPEATED_BEHAVIOR') {
    confidenceScore += 10;
  } else if (data.problemEvidenceStatus === 'BUYER_REPORTED') {
    confidenceScore += 5;
  }

  // Workaround evidence signals
  if (data.currentWorkaroundStatus === 'COMPETING_PAID' || data.currentWorkaroundStatus === 'HIRING_OR_EXPENSIVE_SERVICE') {
    confidenceScore += 10;
  } else if (data.currentWorkaroundStatus === 'DIY_MANUAL') {
    confidenceScore += 5;
  }

  // Value evidence status signals
  if (data.valueEvidenceStatus === 'PAID_BEHAVIOR') {
    confidenceScore += 15;
  } else if (data.valueEvidenceStatus === 'OBSERVED_BEHAVIOR') {
    confidenceScore += 10;
  } else if (data.valueEvidenceStatus === 'BUYER_STATED') {
    confidenceScore += 5;
  }

  // Differentiation evidence status signals
  if (data.differentiationEvidenceStatus === 'REPEATABLE_COMMERCIAL_EVIDENCE') {
    confidenceScore += 15;
  } else if (data.differentiationEvidenceStatus === 'WIN_LOSS_EVIDENCE') {
    confidenceScore += 12;
  } else if (data.differentiationEvidenceStatus === 'BUYER_CHOSE_US_BECAUSE_OF_DIFFERENCE') {
    confidenceScore += 10;
  } else if (data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE') {
    confidenceScore += 5;
  }

  // Pricing evidence context signals
  if (
    data.pricingEvidenceContext === 'REPEAT_PURCHASES' ||
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES' ||
    data.pricingEvidenceContext === 'ACTUAL_PURCHASES_AT_SCALE'
  ) {
    confidenceScore += 15;
  } else if (data.pricingEvidenceContext === 'REAL_SALES_CONVERSATIONS') {
    confidenceScore += 10;
  } else if (data.pricingEvidenceContext === 'INTEREST_CONVERSATIONS_ONLY') {
    confidenceScore += 5;
  }

  // Objection evidence status signals
  if (data.objectionEvidenceStatus === 'REPEATED_ACTUAL_OBJECTIONS') {
    confidenceScore += 12;
  } else if (data.objectionEvidenceStatus === 'ACTUAL_OBJECTIONS_HEARD') {
    confidenceScore += 8;
  }

  // Deduct for uncertainty / unknown / unselected
  let unknownCount = 0;
  if (data.objectionEvidenceStatus === 'UNSELECTED') unknownCount += 2;
  if (data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') unknownCount += 1;
  if (data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS') unknownCount += 1;
  if (data.problemEvidenceStatus === 'UNSELECTED') unknownCount += 2;
  if (data.problemEvidenceStatus === 'SELLER_ASSUMPTION') unknownCount += 1;
  if (data.valueEvidenceStatus === 'UNSELECTED') unknownCount += 2;
  if (data.valueEvidenceStatus === 'SELLER_ASSUMPTION') unknownCount += 1;
  if (data.differentiationEvidenceStatus === 'UNSELECTED') unknownCount += 2;
  if (data.differentiationEvidenceStatus === 'SELLER_BELIEF') unknownCount += 1;
  if (data.pricingEvidenceContext === 'UNSELECTED') unknownCount += 2;
  if (data.pricingEvidenceContext === 'NO_REAL_BUYER_CONVERSATIONS') unknownCount += 1;
  if (data.currentWorkaroundStatus === 'NONE_KNOWN' || data.currentWorkaroundStatus === 'UNSELECTED') unknownCount += 1;
  if (data.isLive === 'NOT_SURE' || data.isLive === 'UNSELECTED') unknownCount++;
  if (data.hasPaidCustomers === 'NOT_SURE' || data.hasPaidCustomers === 'UNSELECTED') unknownCount++;
  if (data.hasAnyonePaidExactPrice === 'NOT_SURE' || data.hasAnyonePaidExactPrice === 'UNSELECTED') unknownCount++;
  if (data.hasNextStepClear === 'NOT_SURE' || data.hasNextStepClear === 'UNSELECTED') unknownCount++;
  if (data.requiresApproval === 'NOT_SURE' || data.requiresApproval === 'UNSELECTED') unknownCount++;
  if (data.isTrafficQualified === 'NOT_SURE' || data.isTrafficQualified === 'UNSELECTED') unknownCount++;
  if (data.problemFrequency === 'not_sure' || data.problemFrequency === 'UNSELECTED') unknownCount++;
  if (data.outcomeObservability === 'not_sure' || data.outcomeObservability === 'UNSELECTED') unknownCount++;
  if (data.outcomeControllability === 'not_sure' || data.outcomeControllability === 'UNSELECTED') unknownCount++;
  if (data.timeToValue === 'unknown' || data.timeToValue === 'UNSELECTED') unknownCount++;
  if (data.mechanismType === 'not_sure' || data.mechanismType === 'UNSELECTED') unknownCount++;
  if (data.pricingRationale === 'unknown' || data.pricingRationale === 'UNSELECTED') unknownCount++;
  if (data.primaryObjectionCategory === 'not_sure' || data.primaryObjectionCategory === 'UNSELECTED') unknownCount++;
  if (data.primaryPerceivedRisk === 'not_sure' || data.primaryPerceivedRisk === 'UNSELECTED') unknownCount++;
  if (data.decisionEffortLevel === 'not_sure' || data.decisionEffortLevel === 'UNSELECTED') unknownCount++;
  if (data.checkoutStep === 'not_sure' || data.checkoutStep === 'UNSELECTED') unknownCount++;
  if (data.deliveryMethod === 'not_selected' || (data.deliveryMethod as string) === 'UNSELECTED') unknownCount++;
  if (data.salesVolumeRange === 'unselected') unknownCount++;

  confidenceScore -= unknownCount * 5;
  confidenceScore = Math.max(5, Math.min(95, Math.round(confidenceScore)));

  if (totalOfferStrength >= 65 && confidenceScore < 45) {
    flags.push('العرض شكله قوي من الناحية الاستراتيجية، لكن الأدلة الحالية مش كفاية للحكم بثقة.');
  }

  const confidenceRating: 'HIGH' | 'MODERATE' | 'LOW' =
    confidenceScore >= 70 ? 'HIGH' : confidenceScore >= 45 ? 'MODERATE' : 'LOW';

  let confidenceReasoningArabic = '';
  if (confidenceRating === 'LOW') {
    confidenceReasoningArabic =
      'الأدلة الحالية تعتمد في معظمها على فرضيات وتصورات ولم تُختبر بشكل كافٍ مع مشترين حقيقيين دفعوا أموالاً.';
  } else if (confidenceRating === 'MODERATE') {
    confidenceReasoningArabic =
      'توجد إشارات سلوكية أو مبيعات أولية تدعم التحليل، لكن لا تزال هناك جوانب غير مثبتة تجارياً بالكامل.';
  } else {
    confidenceReasoningArabic =
      'التشخيص يستند إلى بيانات مبيعات وسلوكيات شراء حقيقية واعتراضات سُمعت مباشرة من السوق.';
  }

  // ==========================================
  // BOTTLENECK SEVERITY & IDENTIFICATION
  // ==========================================
  // Check special context-aware bottlenecks first:
  // 1. Traffic Quality check:
  // If offer has sales or good structure, but traffic is unqualified or wrong source
  const isTrafficUnqualified = data.isTrafficQualified === 'NO';
  const hasProvenSales =
    data.hasPaidCustomers === 'YES' ||
    tiers.includes('TIER_1_DIRECT_COMMERCIAL') ||
    data.salesVolumeRange === '4-10' ||
    data.salesVolumeRange === '11-30' ||
    data.salesVolumeRange === '31+';

  let trafficVsOfferVerdict: 'OFFER_PRIMARY_BOTTLENECK' | 'TRAFFIC_PRIMARY_BOTTLENECK' | 'BALANCED_BOTTLENECK' =
    'OFFER_PRIMARY_BOTTLENECK';

  if (isTrafficUnqualified && (hasProvenSales || totalOfferStrength >= 65)) {
    trafficVsOfferVerdict = 'TRAFFIC_PRIMARY_BOTTLENECK';
  } else if (data.isTrafficQualified === 'PARTIALLY' && totalOfferStrength >= 60) {
    trafficVsOfferVerdict = 'BALANCED_BOTTLENECK';
  }

  // 2. Overbuilt Offer check:
  const isOverbuilt = complexityLevel === 'VERY_HIGH' || (complexityLevel === 'HIGH' && outcomeScore < 60);

  // Identify lowest scoring dimensions
  const sortedDims = Object.entries(dimensionScores).sort((a, b) => a[1].score - b[1].score);

  let primaryBottleneck: BottleneckIdentifier = 'PROOF';
  let primaryBottleneckNameArabic = 'قوة الإثبات والأدلة';
  let primaryBottleneckSeverity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
  let secondaryBottleneck: BottleneckIdentifier | undefined = undefined;
  let secondaryBottleneckNameArabic: string | undefined = undefined;

  if (trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK') {
    primaryBottleneck = 'TRAFFIC_QUALITY';
    primaryBottleneckNameArabic = 'جودة الجمهور ومصدر الزيارات (Traffic Quality)';
    primaryBottleneckSeverity = 'CRITICAL';
    secondaryBottleneck = (sortedDims[0][0] as BottleneckIdentifier) || 'PROOF';
    secondaryBottleneckNameArabic = sortedDims[0][1].nameArabic;
  } else if (isOverbuilt && paddingLen > 15) {
    primaryBottleneck = 'OFFER_COMPLEXITY';
    primaryBottleneckNameArabic = 'تعقيد العرض والحشو الزائد (Offer Complexity)';
    primaryBottleneckSeverity = 'HIGH';
    secondaryBottleneck = (sortedDims[0][0] as BottleneckIdentifier) || 'PROOF';
    secondaryBottleneckNameArabic = sortedDims[0][1].nameArabic;
  } else {
    // Normal dimension mapping
    const lowest = sortedDims[0];
    const secondLowest = sortedDims[1];

    const mapDimToBottleneck: Record<string, { id: BottleneckIdentifier; name: string }> = {
      buyer_offer_fit: { id: 'BUYER_CLARITY', name: 'وضوح وتحديد المشتري (Buyer Clarity)' },
      problem_strength: { id: 'PROBLEM_VALUE', name: 'شدة وأثر المشكلة (Problem Value)' },
      outcome_clarity: { id: 'OUTCOME_CLARITY', name: 'وضوح النتيجة الموعودة (Outcome Clarity)' },
      perceived_value: { id: 'PROBLEM_VALUE', name: 'القيمة المدركة مقابل المجهود (Perceived Value)' },
      differentiation: { id: 'DIFFERENTIATION', name: 'التمايز والآلية الفريدة (Differentiation)' },
      proof_strength: { id: 'PROOF', name: 'قوة الإثبات التجاري (Proof Strength)' },
      objection_coverage: { id: 'OBJECTION_COVERAGE', name: 'تغطية الاعتراضات الحقيقية (Objection Coverage)' },
      pricing_logic: { id: 'PRICING_LOGIC', name: 'منطقية السعر وعلاقته بالقيمة (Pricing Logic)' },
      risk_and_trust: { id: 'RISK', name: 'مخاطرة القرار وضعف الضمانات (Risk & Trust)' },
      decision_friction: { id: 'DECISION_FRICTION', name: 'احتكاك وتعقيد خطوة الشراء (Decision Friction)' },
    };

    const b1 = mapDimToBottleneck[lowest[0]] || { id: 'PROOF', name: 'قوة الإثبات' };
    primaryBottleneck = b1.id;
    primaryBottleneckNameArabic = b1.name;
    primaryBottleneckSeverity = lowest[1].score < 30 ? 'CRITICAL' : lowest[1].score < 50 ? 'HIGH' : 'MODERATE';

    if (secondLowest) {
      const b2 = mapDimToBottleneck[secondLowest[0]];
      if (b2 && b2.id !== primaryBottleneck) {
        secondaryBottleneck = b2.id;
        secondaryBottleneckNameArabic = b2.name;
      }
    }
  }

  // ==========================================
  // OFFER DIAGNOSIS CATEGORY
  // ==========================================
  let offerDiagnosisCategory: OfferDiagnosisCategory = 'STRONG_OFFER_WEAK_EVIDENCE';
  let offerDiagnosisSummaryArabic = '';

  if (trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK') {
    offerDiagnosisCategory = 'TRAFFIC_QUALITY_PROBLEM';
    offerDiagnosisSummaryArabic =
      'المشكلة الأساسية ليست في هيكل العرض بل في جودة وملاءمة الزيارات (Traffic Quality). إعادة بناء العرض الآن لن تحل المشكلة دون تدقيق الجمهور.';
  } else if (isOverbuilt) {
    offerDiagnosisCategory = 'OVERBUILT_OFFER';
    offerDiagnosisSummaryArabic =
      'العرض يعاني من حشو مكونات وتعقيد مفرط في محاولة لرفع القيمة المدركة، مما يزيد احتكاك القرار وصعوبة التنفيذ على المشتري.';
  } else if (hasProvenSales && totalOfferStrength >= 75) {
    offerDiagnosisCategory = 'OFFER_READY_TO_OPTIMIZE';
    offerDiagnosisSummaryArabic =
      'العرض يمتلك أساساً تجارياً مثبت بالمبيعات وهو في مرحلة التحسين الاقتصادي المتقدم وتقليل نقاط التسرب.';
  } else if (totalOfferStrength >= 65 && proofScore < 40) {
    offerDiagnosisCategory = 'STRONG_OFFER_WEAK_EVIDENCE';
    offerDiagnosisSummaryArabic =
      'العرض يمتلك منطقاً استراتيجياً متماسكاً لكن الإثبات التجاري أضعف من الوعد، مما يجعل المشترين مهتمين لكن مترددين.';
  } else if (buyerScore < 40) {
    offerDiagnosisCategory = 'POSITIONING_PROBLEM';
    offerDiagnosisSummaryArabic =
      'المشكلة في تحديد وتموضع العرض أمام شريحة المشتري المناسبة، مما يجعله يبدو عاماً وغير مخصص لمعاناة ملحة.';
  } else if (problemScore < 40 || perceivedValueScore < 40) {
    offerDiagnosisCategory = 'PRODUCT_VALUE_PROBLEM';
    offerDiagnosisSummaryArabic =
      'المشكلة في شدة المشكلة ذاتها أو في القيمة العملية التي يحصل عليها المشتري مقابل ما يبذله.';
  } else if (outcomeScore < 40) {
    offerDiagnosisCategory = 'MESSAGE_CLARITY_PROBLEM';
    offerDiagnosisSummaryArabic =
      'النتيجة النهائية غير ملموسة أو يصعب على المشتري تخيل ما سيتغير في واقعه بعد الشراء.';
  } else if (frictionScore < 40) {
    offerDiagnosisCategory = 'DECISION_FRICTION_PROBLEM';
    offerDiagnosisSummaryArabic =
      'المشتري يرى القيمة لكن إجراءات أو شروط اتخاذ قرار الشراء معقدة أو تتطلب جهداً أو موافقات إضافية.';
  } else if (pricingScore < 40) {
    offerDiagnosisCategory = 'PRICING_CONTEXT_PROBLEM';
    offerDiagnosisSummaryArabic =
      'السعر غير مرتبط بمنطقية القيمة أو تم وضعه بافتراضات غير مثبتة دون اختبار حقيقي.';
  } else if (totalOfferStrength >= 60) {
    offerDiagnosisCategory = 'OFFER_READY_TO_TEST';
    offerDiagnosisSummaryArabic =
      'العرض جاهز للاختبار في السوق عبر دورة تحقق سريعة (Validation Sprint) لجمع أول أدلة حقيقية.';
  } else {
    offerDiagnosisCategory = 'PROOF_PROBLEM';
    offerDiagnosisSummaryArabic =
      'يحتاج العرض إلى جمع أدلة ملموسة ودعم الوعد التجاري بإثباتات سلوكية قبل التفكير في تكبير الميزانيات.';
  }

  // ==========================================
  // VALIDATION SPRINT MODE (Strictly mapped to Offer Stage)
  // Never send a paying seller backwards!
  // ==========================================
  let validationSprintMode: ValidationSprintMode = 'SPRINT_DISCOVERY';
  if (data.offerStage === 'OFFER_STAGE_0_IDEA_ONLY' || data.offerStage === 'OFFER_STAGE_1_NOT_SOLD') {
    validationSprintMode = 'SPRINT_DISCOVERY';
  } else if (data.offerStage === 'OFFER_STAGE_2_INTEREST') {
    validationSprintMode = 'SPRINT_MESSAGE_INTEREST';
  } else if (data.offerStage === 'OFFER_STAGE_3_COMMITMENT') {
    validationSprintMode = 'SPRINT_COMMITMENT';
  } else if (data.offerStage === 'OFFER_STAGE_4_FIRST_SALES') {
    validationSprintMode = 'SPRINT_FIRST_SALES';
  } else if (data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES') {
    validationSprintMode = 'SPRINT_REPEATABLE_SALES';
  } else if (data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION') {
    validationSprintMode = 'SPRINT_OPTIMIZATION';
  }

  // ==========================================
  // PRICING DIAGNOSIS CATEGORY
  // NEVER say price is too high without proof!
  // ==========================================
  let pricingDiagnosisCategory: PricingDiagnosisCategory = 'PRICE_NOT_YET_DIAGNOSABLE';

  if (data.hasAnyonePaidExactPrice === 'YES' && data.isPriceRepeatedObjection === 'NO') {
    pricingDiagnosisCategory = 'PRICE_SUPPORTED_BY_EVIDENCE';
  } else if (data.isPriceRepeatedObjection === 'ACTUAL_REPEATED' && data.hasAnyonePaidExactPrice === 'NO') {
    // If people object repeatedly to price and nobody ever paid, it might be value-price mismatch OR wrong traffic
    if (diffScore < 40 || perceivedValueScore < 50) {
      pricingDiagnosisCategory = 'PRICE_VALUE_MISMATCH';
    } else {
      pricingDiagnosisCategory = 'PRICE_NEEDS_TESTING';
    }
  } else if (data.hasPaidCustomers === 'NO' || data.hasAnyonePaidExactPrice === 'NO') {
    pricingDiagnosisCategory = 'PRICE_NOT_YET_DIAGNOSABLE';
  } else if (data.deliveryMethod === '1-on-1' || data.deliveryMethod === 'done-for-you') {
    // Check if price is too low for heavy delivery burden
    pricingDiagnosisCategory = 'PRICE_DELIVERY_MISMATCH';
  } else {
    pricingDiagnosisCategory = 'PRICE_LIKELY_NOT_PRIMARY_PROBLEM';
  }

  // ==========================================
  // CONSISTENCY GUARDS
  // ==========================================
  // Guard 1: Never diagnose price as primary problem without price evidence
  if (
    offerDiagnosisCategory === 'PRICING_CONTEXT_PROBLEM' &&
    data.isPriceRepeatedObjection !== 'ACTUAL_REPEATED' &&
    data.hasAnyonePaidExactPrice === 'YES'
  ) {
    offerDiagnosisCategory = 'MESSAGE_CLARITY_PROBLEM';
    flags.push('تم تصحيح التشخيص: تم استبعاد مشكلة السعر لعدم وجود أدلة اعتراض سعرية من المشترين.');
  }

  // Guard 2: Strong proof score without proof
  if (proofScore > 40 && tiers.length === 0 && data.hasPaidCustomers === 'NO') {
    proofScore = 15;
    dimensionScores.proof_strength.score = 15;
    dimensionScores.proof_strength.weightedScore = 2;
    flags.push('تم تصحيح درجة الإثبات لعدم وجود مستندات أو مبيعات تجارية حقيقية.');
  }

  // Guard 3: Traffic Problem while recommending complete offer rebuild
  if (trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK' && offerDiagnosisCategory !== 'TRAFFIC_QUALITY_PROBLEM') {
    offerDiagnosisCategory = 'TRAFFIC_QUALITY_PROBLEM';
  }

  return {
    offerStrengthScore: totalOfferStrength,
    confidenceScore,
    dimensionScores,
    primaryBottleneck,
    primaryBottleneckNameArabic,
    primaryBottleneckSeverity,
    secondaryBottleneck,
    secondaryBottleneckNameArabic,
    offerDiagnosisCategory,
    offerDiagnosisSummaryArabic,
    confidenceRating,
    confidenceReasoningArabic,
    offerStage: data.offerStage,
    validationSprintMode,
    pricingDiagnosisCategory,
    complexityLevel,
    trafficVsOfferVerdict,
    consistencyFlags: flags,
  };
}

export function generateDeterministicStrategicFallback(
  data: QuestionnaireData,
  diagnosis: DeterministicDiagnosis
): AIStrategicInterpretation {
  const isHighTicket =
    data.checkoutStep === 'book_call' ||
    data.checkoutStep === 'application' ||
    data.checkoutStep === 'proposal' ||
    data.deliveryMethod === '1-on-1' ||
    data.deliveryMethod === 'done-for-you';

  const buyer = data.buyerRole?.trim() || 'العميل المستهدف';
  const problem = data.coreProblem?.trim() || 'المشكلة الحالية التي تمنعه من تحقيق النتيجة';
  const outcome = data.afterState?.trim() || 'الوصول إلى النتيجة المستهدفة بسلاسة';
  const mechanism =
    data.mechanismDescription?.trim() ||
    (data.mechanismType === 'documented_method' ? 'منهجية تنفيذية موثقة ومجربة' : 'آلية عمل منظمة وموجهة نحو النتيجة');

  // Derive strategic invariants
  const { decision: stratDecision, explanationArabic: stratExplanation } =
    deriveStrategicDecision(data, diagnosis);
  const funnelReadiness = deriveFunnelReadiness(data, diagnosis);
  const positioningStatus = derivePositioningStatus(data, diagnosis);
  const valuePropositionStatus = deriveValuePropositionStatus(data);
  const missingEvidence = deriveMissingEvidence(data, diagnosis);

  // CTA recommendation based on price & friction
  let ctaTitle = 'اشترِ الآن (Buy Now)';
  let ctaType = 'direct_checkout';
  let ctaRationale = 'مناسب لمنتج رقمي محدد النطاق وسهل اتخاذ القرار بشأنه فوراً.';

  if (isHighTicket) {
    ctaTitle = 'احجز جلسة استراتيجية / تقييم (Book Assessment)';
    ctaType = 'book_call';
    ctaRationale =
      'نظراً لطبيعة الخدمة أو البرنامج وسعره، يحتاج المشتري إلى محادثة تأهيل وتأكد من الملاءمة قبل الالتزام المالي.';
  } else if (data.checkoutStep === 'application') {
    ctaTitle = 'قدّم طلب انضمام (Apply Now)';
    ctaType = 'application';
    ctaRationale = 'يضع معيار قبول واضح ويقلل من تقدم غير المؤهلين.';
  }

  // 7-day validation sprint based on stage
  let sprintDays: { dayNumber: number; titleArabic: string; actionArabic: string; expectedEvidenceArabic: string }[] = [];

  if (diagnosis.validationSprintMode === 'SPRINT_DISCOVERY') {
    sprintDays = [
      {
        dayNumber: 1,
        titleArabic: 'توثيق لغة المشتري الحقيقية',
        actionArabic: 'استخرج الكلمات الدقيقة التي يصف بها 5 عملاء محتملون ألمهم اليومي.',
        expectedEvidenceArabic: 'قائمة بالمصطلحات التي يكررها السوق، دون تزيين تسويقي.',
      },
      {
        dayNumber: 2,
        titleArabic: 'اختبار شدة المشكلة',
        actionArabic: 'تأكد هل المشكلة تستحق الدفع أم يتعايش معها المشتري مجاناً.',
        expectedEvidenceArabic: 'اعتراف صريح من 3 أشخاص بأن المشكلة تكلفهم وقتاً أو مالاً مباشراً.',
      },
      {
        dayNumber: 3,
        titleArabic: 'صياغة الوعد والآلية في جملة واحدة',
        actionArabic: 'اكتب الوعد التجاري وفق معادلة: (النتيجة + الآلية + نزع العائق).',
        expectedEvidenceArabic: 'مسودة وعد واضحة يسهل فهمها في 10 ثوانٍ دون شرح إضافي.',
      },
      {
        dayNumber: 4,
        titleArabic: 'عرض الفكرة على 10 مرشحين',
        actionArabic: 'اطرح الحل في محادثة مباشرة (1-on-1) دون محاولة الإقناع بالقوة.',
        expectedEvidenceArabic: 'تسجيل الاعتراضات الأولى وردود الأفعال الصادقة.',
      },
      {
        dayNumber: 5,
        titleArabic: 'طلب التزام أولي (Deposit / Pre-order)',
        actionArabic: 'اطلب عربوناً رمزياً أو حجزاً مسبقاً لاختبار جدية الرغبة في الشراء.',
        expectedEvidenceArabic: 'دفع حقيقي أو سبب مقنع جداً لعدم الدفع.',
      },
      {
        dayNumber: 6,
        titleArabic: 'تحليل أسباب الرفض الصريحة',
        actionArabic: 'افصل بين اعتراض السعر، اعتراض الثقة، واعتراض عدم الحاجة الملحة.',
        expectedEvidenceArabic: 'تصنيف واضح لأكبر عائق شراء ظهر في المحادثات.',
      },
      {
        dayNumber: 7,
        titleArabic: 'تعديل هيكل العرض أو إيقافه',
        actionArabic: 'قرر: هل نعيد صياغة العرض وفق ردود السوق أم نغير الشريحة المستهدفة؟',
        expectedEvidenceArabic: 'قرار استراتيجي مبني على سلوكيات السوق لا الأماني.',
      },
    ];
  } else if (diagnosis.validationSprintMode === 'SPRINT_FIRST_SALES') {
    sprintDays = [
      {
        dayNumber: 1,
        titleArabic: 'مقابلة المشترين الذين دفعوا بالفعل',
        actionArabic: 'اسألهم: إيه الدافع الحقيقي اللي خلاك تدفع في اللحظة دي تحديداً؟',
        expectedEvidenceArabic: 'الشرارة المحفزة للشراء (Buying Trigger).',
      },
      {
        dayNumber: 2,
        titleArabic: 'معرفة ما كاد يمنعهم من الشراء',
        actionArabic: 'اسألهم: إيه الاعتراض أو الشك اللي خلاك تتردد قبل إتمام الدفع؟',
        expectedEvidenceArabic: 'الاعتراض الخفي الذي تجاوزوه بصعوبة.',
      },
      {
        dayNumber: 3,
        titleArabic: 'فحص ما استخدموه وما تجاهلوه',
        actionArabic: 'افحص أي جزء من العرض حقق لهم القيمة الحقيقية وأي جزء لم يفتحوه.',
        expectedEvidenceArabic: 'تحديد المكونات الجوهرية مقابل الحشو غير المفيد.',
      },
      {
        dayNumber: 4,
        titleArabic: 'توثيق أول دليل نتيجة ملموس (Tier 2)',
        actionArabic: 'وثق الفارق بين حالة العميل قبل استخدام العرض وبعده بالأرقام أو الشواهد.',
        expectedEvidenceArabic: 'دراسة حالة مصغرة (Mini Case Study).',
      },
      {
        dayNumber: 5,
        titleArabic: 'تحديث رسالة العرض بناءً على كلمات المشترين',
        actionArabic: 'استبدل مصطلحاتك الفنية بالمصطلحات التي استخدمها المشترون أنفسهم.',
        expectedEvidenceArabic: 'نص عرض أقرب للواقع وأكثر إقناعاً للمترددين.',
      },
      {
        dayNumber: 6,
        titleArabic: 'إعادة الاتصال بالمهتمين الذين لم يشتروا',
        actionArabic: 'اعرض عليهم التحديث والإثبات الجديد دون تخفيض السعر.',
        expectedEvidenceArabic: 'تحويل 1-2 من المترددين إلى عملاء دافعين.',
      },
      {
        dayNumber: 7,
        titleArabic: 'تحديد عنق الزجاجة التالي للمضاعفة',
        actionArabic: 'حدد هل العائق الآن هو ثقة المشترين أم قلة الزيارات المؤهلة؟',
        expectedEvidenceArabic: 'خطة واضحة للانتقال إلى بناء نظام مبيعات متكرر.',
      },
    ];
  } else {
    sprintDays = [
      {
        dayNumber: 1,
        titleArabic: 'تدقيق نقاط التسرب في صفحة العرض',
        actionArabic: 'قارن بين نسبة من شاهدوا السعر ونسبة من نقروا على زر الشراء.',
        expectedEvidenceArabic: 'تحديد مرحلة الاحتكاك الأكبر في تجربة الشراء.',
      },
      {
        dayNumber: 2,
        titleArabic: 'فصل اعتراضات السعر عن اعتراضات القيمة',
        actionArabic: 'حلل أسئلة الدعم ومحادثات المترددين: هل الاعتراض على الرقم أم على غياب الضمان؟',
        expectedEvidenceArabic: 'تصنيف دقيق يمنع التخفيض العشوائي للسعر.',
      },
      {
        dayNumber: 3,
        titleArabic: 'إعادة ترتيب هيكل العرض (Offer Stack)',
        actionArabic: 'ضع النتيجة الأهم في الصدارة واحذف أو أخّر المكونات الثانوية المشتتة.',
        expectedEvidenceArabic: 'تسلسل منطقي يركز على الحل السريع للمشكلة.',
      },
      {
        dayNumber: 4,
        titleArabic: 'اختبار زاوية إثبات جديدة (Proof Angle)',
        actionArabic: 'ضع أقوى شهادة أو نتيجة عميل في أول 20% من صفحة العرض.',
        expectedEvidenceArabic: 'قياس التغير في معدل البقاء والتفاعل على الصفحة.',
      },
      {
        dayNumber: 5,
        titleArabic: 'إزالة احتكاك إداري أو تقني من خطوة الشراء',
        actionArabic: 'اختصر خطوات الدفع أو اطلب بيانات أقل في استمارة الطلب.',
        expectedEvidenceArabic: 'تقليل نسبة السلات المتروكة أو النماذج غير المكتملة.',
      },
      {
        dayNumber: 6,
        titleArabic: 'تشغيل تجربة A/B على زاوية العنوان الرئيسي',
        actionArabic: 'اختبر زاوية النتيجة مقابل زاوية تكلفة الوضع الحالي.',
        expectedEvidenceArabic: 'تحديد العنوان الذي يجلب زيارات أكثر جدية للشراء.',
      },
      {
        dayNumber: 7,
        titleArabic: 'تثبيت النسخة الفائزة وتأمين اقتصاديات الفانل',
        actionArabic: 'وثق معايير التحويل الجديدة قبل رفع ميزانية الإعلانات.',
        expectedEvidenceArabic: 'عرض جاهز تماماً لاستقبال زيارات موسعة دون إهدار.',
      },
    ];
  }

  // 1. Build offer stack ONLY from real questionnaire components
  const COMPONENT_ARABIC_MAP: Record<string, string> = {
    videos: 'محتوى فيديو تدريبي مسجل',
    live_sessions: 'جلسات تفاعلية مباشرة',
    templates: 'نماذج وقوالب عمل جاهزة',
    audits: 'مراجعة وتدقيق عملي مباشر',
    calls: 'مكالمات استشارية فردية',
    community: 'مجتمع وتواصل بين الأعضاء',
    tools: 'أدوات برمجية وتشغيلية',
    done_for_you: 'تنفيذ كامل بالنيابة عن العميل (DFY)',
    support: 'دعم فني واستشاري مستمر',
  };

  const realComponents = (data.includedComponents || []).map(
    c => COMPONENT_ARABIC_MAP[c] || c
  );

  const coreComps: string[] = [];
  if (data.coreComponentsDescription?.trim()) {
    coreComps.push(data.coreComponentsDescription.trim());
  } else if (realComponents.length > 0) {
    coreComps.push(realComponents[0]);
  } else {
    coreComps.push(data.productType || 'المكون الرئيسي لتسليم النتيجة');
  }

  const supportingComps: string[] = [];
  if (realComponents.length > 1) {
    supportingComps.push(...realComponents.slice(1, 4));
  }

  const optionalComps: string[] = [];
  if (realComponents.length > 4) {
    optionalComps.push(...realComponents.slice(4));
  }

  const removeOrDelayComps: string[] = [];
  if (data.paddingComponentsDescription?.trim()) {
    removeOrDelayComps.push(data.paddingComponentsDescription.trim());
  } else if (diagnosis.complexityLevel === 'HIGH' || diagnosis.complexityLevel === 'VERY_HIGH') {
    removeOrDelayComps.push('تأخير المكونات الثانوية غير المرتبطة بالنتيجة المباشرة لتخفيف عبء التنفيذ.');
  }

  // 2. Bonus logic: Never contradict verdict!
  const hasObjectionRequiringBonus =
    data.primaryObjectionCategory === 'time' ||
    data.primaryObjectionCategory === 'complexity' ||
    data.primaryObjectionCategory === 'implementation';

  const shouldOfferBonus =
    hasObjectionRequiringBonus &&
    diagnosis.complexityLevel !== 'HIGH' &&
    diagnosis.complexityLevel !== 'VERY_HIGH' &&
    data.offerStage !== 'OFFER_STAGE_0_IDEA_ONLY';

  let bonusVerdict = '';
  let recBonuses: { titleArabic: string; frictionOrObjectionSolvedArabic: string }[] = [];

  if (!shouldOfferBonus) {
    bonusVerdict =
      diagnosis.complexityLevel === 'HIGH' || diagnosis.complexityLevel === 'VERY_HIGH'
        ? 'العرض لا يحتاج أي Bonus إضافي حالياً؛ إضافة المزيد ستزيد من تشتت العميل ومخاوفه من عبء الوقت.'
        : 'العرض لا يحتاج Bonus إضافي حالياً؛ الأولوية لحسم وضوح العرض الأساسي وإثبات قيمته قبل إضافة ملحقات.';
    recBonuses = [];
  } else {
    bonusVerdict = 'يُنصح فقط ببونص واحد محدد يزيل عائق البداية أو يسرع الوصول لأول فوز سريع.';
    recBonuses = [
      {
        titleArabic: 'أداة مساعدة لبدء التنفيذ الفوري',
        frictionOrObjectionSolvedArabic: `يزيل عائق (${data.primaryObjectionCategory === 'time' ? 'ضيق الوقت' : 'صعوبة التنفيذ'}) الموثق في إجابات العرض.`,
      },
    ];
  }

  // 3. Risk Reduction: Grounded in controllability & proof
  const isHighBuyerDependency =
    data.outcomeControllability === 'highly_dependent_on_buyer' ||
    data.outcomeControllability === 'not_sure';
  const hasStrongProof =
    data.evidenceTiersPresent &&
    data.evidenceTiersPresent.some(t => t.includes('TIER_1') || t.includes('TIER_2'));
  const isMatureValidated =
    (data.offerStage === 'OFFER_STAGE_4_FIRST_SALES' ||
      data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES' ||
      data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION') &&
    hasStrongProof;

  let guaranteeSuitability = '';
  let recommendedRiskApproach = '';
  let practicalSafeguards: string[] = [];

  if (isHighBuyerDependency || !hasStrongProof) {
    guaranteeSuitability =
      'لا أنصح بضمان النتيجة حاليًا. قلل المخاطرة من خلال نطاق واضح، توقعات واضحة، Demo، Pilot، Sample أو Proof مناسب.';
    recommendedRiskApproach =
      'التركيز على شفافية ما يتسلمه العميل وفلترة من لا يناسبه العرض، بدلاً من إطلاق ضمانات مالية خطرة تعتمد على التزام طرف ثالث.';
    practicalSafeguards = [
      'تحديد واضح ومكتوب لشروط من يناسبه العرض ومن لا يناسبه (Who It Is For & Not For).',
      'توضيح المجهود الأسبوعي المتوقع بشفافية تامة قبل استلام أي مقابل مالي.',
      'عرض نموذج أو تجربة مصغرة (Demo/Sample) لطريقة العمل لإزالة غموض التنفيذ.',
    ];
  } else if (isHighTicket) {
    guaranteeSuitability =
      'لا يُنصح بضمان استرداد مالي غير مشروط؛ بل بضمان التزام متبادل بمحطات تسليم محددة (Milestone Agreement).';
    recommendedRiskApproach =
      'نزع المخاطرة عبر محطات تسليم واضحة ولقاءات مراجعة دورية تضمن مطابقة المخرجات للمواصفات المتفق عليها.';
    practicalSafeguards = [
      'عقد خدمة يحدد نطاق ومسؤوليات كل طرف بدقة.',
      'مرحلة تقييم ومواءمة مبكرة قبل الالتزام الكامل.',
    ];
  } else if (isMatureValidated && data.outcomeControllability === 'fully_controllable') {
    guaranteeSuitability =
      'يمكن دراسة ضمان مشروط بالتطبيق الصارم، شريطة وجود سجل تاريخي منخفض في طلب الاسترداد.';
    recommendedRiskApproach =
      'ضمان رضا محدد ومحصور للمشترين الملتزمين بالخطوات الأساسية.';
    practicalSafeguards = [
      'شروط استرداد محددة بوثائق التطبيق.',
      'دعم توجيهي استباقي لمن يواجه صعوبة أثناء الاستخدام.',
    ];
  } else {
    guaranteeSuitability =
      'لا أنصح بضمان النتيجة حاليًا. قلل المخاطرة من خلال نطاق واضح، توقعات واضحة، Demo، Pilot، Sample أو Proof مناسب.';
    recommendedRiskApproach =
      'تقليل المخاطرة عن طريق تقديم عينة ملموسة أو إثبات نتائج حقيقي بدلاً من تعريض التدفق النقدي لمخاطر الاسترداد.';
    practicalSafeguards = [
      'نطاق عمل دقيق وموثق يمنع سوء الفهم.',
      'صفحة أسئلة شائعة تجيب بشفافية عن تفاصيل التسليم والسياسات.',
    ];
  }

  // 4. Why Not Alternatives: Grounded in reality
  let whyNotAlternative = '';
  if (data.whyNotAlternatives?.trim()) {
    whyNotAlternative = data.whyNotAlternatives.trim();
  } else if (
    data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE' ||
    data.differentiationEvidenceStatus === 'REPEATABLE_COMMERCIAL_EVIDENCE'
  ) {
    whyNotAlternative = `المشترون يفضلون هذا الحل على البديل (${data.buyerCurrentAlternative || 'المتاح'}) لأنه يوفر سرعة وتركيزاً مخصصاً لواقعهم.`;
  } else {
    whyNotAlternative = 'لسه مفيش دليل كفاية يثبت إن العرض يتفوق تجارياً على البديل الحالي.';
  }

  // 5. Differentiation Map: No generic filler
  const sameAsAlternatives =
    data.buyerCurrentAlternative?.trim()
      ? [`الخصائص العامة والأساسيات المتوفرة في (${data.buyerCurrentAlternative.trim()}).`]
      : [];

  const diffIrrelevant =
    data.paddingComponentsDescription?.trim()
      ? [`المكونات الإضافية (${data.paddingComponentsDescription.trim()}) التي لا تؤثر مباشرة في النتيجة.`]
      : [];

  let diffValuable: string[] = [];
  let diffDefensible: string[] = [];

  if (
    data.differentiationEvidenceStatus === 'BUYER_MENTIONED_DIFFERENCE' ||
    data.differentiationEvidenceStatus === 'REPEATABLE_COMMERCIAL_EVIDENCE'
  ) {
    diffValuable = [
      data.mechanismDescription?.trim()
        ? `الآلية المحددة (${data.mechanismDescription.trim()}) المثبتة في تجربة المشترين.`
        : 'التخصص الدقيق وملاءمة الحل لواقع المشتري المحدد.',
    ];
    diffDefensible = [
      'التراكم المعرفي وسرعة تسليم النتيجة وسياق التنفيذ العملي.',
    ];
  } else if (data.differentiationEvidenceStatus === 'SELLER_BELIEF') {
    diffValuable = [
      data.mechanismDescription?.trim()
        ? `الآلية المقترحة (${data.mechanismDescription.trim()}) [فرضية تمايز تحتاج تحققاً من المشتري]`
        : 'التركيز على شريحة محددة [فرضية تمايز تحتاج تحققاً من المشتري]',
    ];
    diffDefensible = [
      'عنصر التمايز المطروح يعتمد حالياً على اعتقاد البائع الذاتي ولم يثبت بعد كحاجز تنافسي في السوق.',
    ];
  }

  // 6. Dynamic Stage-Aware Primary Experiment
  let expHypothesis = '';
  let expWhatToChange = '';
  let expWhatToKeep = '';
  let expObservedEvidence = '';
  let expDecisionRule = '';
  let expWhyMatters = '';
  let expTestAudience = '';
  let expEvidenceToCollect: string[] = [];
  let expWhatNotToConclude = '';

  if (
    stratDecision === 'FIX_TRAFFIC_FIRST' ||
    diagnosis.trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK' ||
    diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
  ) {
    expHypothesis =
      'إذا قمنا بعرض نفس العرض الحالي حصراً على شريحة تمتلك ميزانية حقيقية وتبحث بنشاط عن الحل (High-Intent Audience)، سيرتفع معدل التحويل دون المساس بالسعر أو المكونات.';
    expWhatToChange = 'تعديل استهداف الحملة ومصادر الزيارات للتركيز على المشترين الأكثر جاهزية للشراء.';
    expWhatToKeep = 'حافظ على السعر الحالي وهيكل العرض والوعد الأساسي دون أي تعديل أثناء الاختبار.';
    expObservedEvidence = 'نسبة المتقدمين أو المشترين المؤهلين ومعدل التفاعل الإيجابي مع السعر.';
    expDecisionRule =
      'إذا تحسنت الاستجابة، استمر في مضاعفة مصدر الزيارات المؤهل. إذا ظل التردد قائماً، افحص ملاءمة العرض نفسه.';
    expWhyMatters = 'يمنع هدر الوقت والمال في إعادة بناء عرض سليم لم يشاهده الجمهور المناسب بعد.';
    expTestAudience = 'شريحة مؤهلة تمتلك القدرة الشرائية وتعاني من المشكلة اليومية بصورة ملحة.';
    expEvidenceToCollect = [
      'معدل النقر إلى صفحة العرض (CTR) للجمهور المؤهل.',
      'معدل بدء خطوة الدفع أو حجز المكالمة.',
      'طبيعة الأسئلة والاستفسارات الواردة في الدعم أو المحادثات.',
    ];
    expWhatNotToConclude = 'لا تستنتج أن العرض فاشل إذا كانت الزيارات السابقة غير مهتمة أو غير قادرة على الدفع.';
  } else if (stratDecision === 'STRENGTHEN_PROOF') {
    expHypothesis =
      'إذا قمنا بتسليم أصغر نسخة صالحة من العرض (Paid Pilot / First Case) لعميل واحد مؤهل وتوثيق نتيجة ملموسة بالأرقام قبل/بعد، ستنخفض مقاومة الشراء ويرتفع التحويل دون خفض السعر.';
    expWhatToChange =
      'تقديم دراسة حالة موثقة وشهادة بأرقام محددة في صدارة العرض قبل قسم السعر مباشرة بدلاً من الوعود الإنشائية.';
    expWhatToKeep =
      'هيكل الوعد الأساسي ونقطة التسعير الحالية والآلية دون تغيير جذري.';
    expObservedEvidence =
      'انخفاض تردد المشترين المؤهلين وارتفاع نسبة الانتقال من مرحلة الاستفسار إلى الدفع الفعلي.';
    expDecisionRule =
      'إذا وثقت تحولاً رقمياً واضحاً، أدرجه فوراً في صفحة العرض. إذا ظل التردد قائماً، افحص هل الشريحة تصدق الآلية أصلاً.';
    expWhyMatters =
      'المشتري يفهم عرضك بالفعل لكنه يحتاج برهاناً تجارياً ملموساً يثبت إمكانية تكرار النتيجة معه شخصياً.';
    expTestAudience = `مشترون مؤهلون يطابقون مواصفات (${buyer}) ولديهم حاجة عاجلة للنتيجة.`;
    expEvidenceToCollect = [
      'بيانات خط الأساس (Baseline) قبل التدخل والنتيجة الرقمية بعد التسليم.',
      'شهادة مصورة أو موثقة تشرح التحول العملي الدقيق.',
      'معدل التحويل بعد إبراز دليل الإثبات الموثق.',
    ];
    expWhatNotToConclude =
      'لا تستنتج أن المشكلة غير ملحة أو أن السعر مرتفع إذا كان العائق الحقيقي هو نقص البرهان التجاري الملموس.';
  } else if (
    stratDecision === 'READY_FOR_FUNNEL_ARCHITECTURE' ||
    stratDecision === 'OPTIMIZE_CONVERSION' ||
    data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES' ||
    data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION'
  ) {
    // Stage 5 & Stage 6: Mature Seller Optimization
    expHypothesis =
      'إذا قمنا باختبار تسعير مركب أو مسار تأهيل متعدد الخطوات للمشترين ذوي القيمة العالية (High-LTV Segment)، سترتفع قيمة الطلب الإجمالية دون الإضرار بمعدل التحويل الإجمالي.';
    expWhatToChange = 'هيكلة خطوة الدفع أو إتاحة خيار دفع سنوي / ترقية متقدمة لرفع متوسط قيمة المعاملة (AOV).';
    expWhatToKeep = 'العرض الجوهري الأساسي وآلية التسليم المثبتة.';
    expObservedEvidence = 'متوسط قيمة المعاملة وعائد الإنفاق الإعلاني (ROAS) بعد التعديل.';
    expDecisionRule =
      'إذا زادت الربحية الصافية لكل مشترٍ، اعتمد التسلسل الجديد وافتح قنوات إعلانية إضافية.';
    expWhyMatters = 'تعظيم اقتصاديات الوحدة لتمكين العرض من المزايدة بقوة أكبر في مزادات الإعلانات والتوسع.';
    expTestAudience = 'المشترون الفعليون الذين أتموا المعاملة الأساسية بنجاح.';
    expEvidenceToCollect = [
      'متوسط قيمة الطلب (Average Order Value).',
      'معدل التحويل على الترقية أو خطوة التسعير الإضافية.',
      'معدل التجديد أو الاحتفاظ بالعملاء (Retention Rate).',
    ];
    expWhatNotToConclude = 'لا تستنتج أن التسعير وصل لسقفه الأعلى قبل اختبار باقات قيمة موجهة للعملاء الأكثر استخداماً.';
  } else if (
    data.offerStage === 'OFFER_STAGE_0_IDEA_ONLY' ||
    data.offerStage === 'OFFER_STAGE_1_NOT_SOLD'
  ) {
    expHypothesis =
      `إذا تم طرح الفكرة في محادثة مباشرة مع 5 من (${buyer}) لحل (${problem})، سيعترف ما لا يقل عن 2 بأن المشكلة ملحة وتستحق الدفع.`;
    expWhatToChange = 'طريقة طرح المشكلة واستخدام كلمات المشتري الدقيقة بدلاً من المصطلحات الفنية.';
    expWhatToKeep = 'النتيجة الموعودة المستهدفة وطريقة التسليم المقترحة.';
    expObservedEvidence = 'اعتراف صريح بالألم واستعداد مبدئي لدفع عربون رمزي لتأكيد الحجز.';
    expDecisionRule =
      'إذا أكد 2 على الأقل استعدادهم للدفع، انتقل إلى بناء مسودة العرض. إذا كان التفاعل بارداً، أعد تدقيق اختيار الشريحة أو المشكلة.';
    expWhyMatters = 'التحقق من وجود طلب حقيقي في السوق قبل بناء أي منتج أو إطلاق أي حملة.';
    expTestAudience = `أشخاص يطابقون مواصفات (${buyer}) في بيئتهم الطبيعية.`;
    expEvidenceToCollect = [
      'الكلمات والمصطلحات الدقيقة التي يصف بها المشتري معاناته.',
      'الحلول البديلة التي جربها ودفع فيها مالاً سابقاً.',
    ];
    expWhatNotToConclude = 'لا تستنتج أن السوق لا يريد الحل لمجرد أن صياغة الرسالة الأولى لم تكن دقيقة.';
  } else if (data.offerStage === 'OFFER_STAGE_2_INTEREST') {
    expHypothesis =
      'إذا طلبنا عربوناً رمزياً أو التزاماً مسبقاً (Pre-Order Deposit) من المهتمين الحاليين، سنتحقق من صدق نية الشراء ونفصل الفضوليين عن الجادين.';
    expWhatToChange = 'إضافة خطوة دفع التزام مالي أولي بدلاً من الاكتفاء بجمع تسجيلات الإيميل أو الإعجابات.';
    expWhatToKeep = 'وعد العرض ونطاق التسليم الأساسي.';
    expObservedEvidence = 'عدد الأشخاص الذين يدفعون الالتزام المالي الفعلي من إجمالي المهتمين.';
    expDecisionRule =
      'إذا دفع 1-3 عملاء، ابدأ تسليم العرض فوراً. إذا امتنع الجميع، اعرف الاعتراض الحقيقي الذي منع إخراج البطاقة الائتمانية.';
    expWhyMatters = 'الاهتمام اللفظي مجاني، بينما الدفع المالي هو الدليل التجاري الوحيد على نجاح العرض.';
    expTestAudience = 'المهتمون الذين أبدوا رغبة سابقة في الحصول على الحل.';
    expEvidenceToCollect = [
      'نسبة التحويل من مهتم إلى دافع عربون.',
      'الاعتراض الصريح الذي يذكره المتردد عند رؤية شاشة الدفع.',
    ];
    expWhatNotToConclude = 'لا تستنتج أن السعر مرتفع إذا كان العائق هو عدم وضوح موعد التسليم أو غياب الثقة.';
  } else {
    // Stage 3 & Stage 4
    expHypothesis =
      diagnosis.primaryBottleneck === 'PROOF'
        ? 'إذا تم توثيق ونشر دراسة حالة واحدة مفصلة (Case Study) في صدارة العرض توضح النتيجة بالأرقام، ستنخفض مقاومة الشراء ويرتفع التحويل دون تخفيض السعر.'
        : 'إذا تم تبسيط العرض واختصاره في مسار واحد واضح وحذف المكونات المشتتة، سترتفع نسبة إتمام الطلب بنسبة ملحوظة.';
    expWhatToChange =
      diagnosis.primaryBottleneck === 'PROOF'
        ? 'إبراز نتيجة موثقة من عميل سابق قبل قسم السعر مباشرة.'
        : 'حذف المكونات الثانوية غير المرتبطة بالنتيجة المباشرة وتوضيح الخطوة الأولى.';
    expWhatToKeep = 'نقطة التسعير الحالية والجمهور المستهدف ونموذج التسليم.';
    expObservedEvidence = 'انخفاض معدل ترك عربة الشراء أو انخفاض التردد في مرحلة اتخاذ القرار.';
    expDecisionRule =
      'إذا ارتفع معدل التحويل، ثبّت هذا التعديل وانتقل لزيادة الزيارات. إذا لم يتغير، افحص اعتراضات السعر والقيمة في محادثات حية.';
    expWhyMatters = 'معالجة أكبر عنق زجاجة يعطل انتقال العرض من مبيعات تجريبية إلى مبيعات منتظمة.';
    expTestAudience = 'زوار مؤهلون من نفس الشريحة التي اشترى منها العملاء السابقون.';
    expEvidenceToCollect = [
      'معدل التحويل على صفحة العرض.',
      'الاعتراضات المتبقية في استفسارات المشترين قبل الدفع.',
    ];
    expWhatNotToConclude = 'لا تستنتج أن الجمهور لا يملك المال قبل التأكد من أنه صدق إمكانية تحقيق النتيجة معه تحديداً.';
  }

  // 7. Dynamic Stage-Aware Next Three Questions
  let nextQuestions: [string, string, string];
  if (
    data.offerStage === 'OFFER_STAGE_5_REPEATABLE_SALES' ||
    data.offerStage === 'OFFER_STAGE_6_OPTIMIZATION'
  ) {
    nextQuestions = [
      'ما هي القيمة العمرية للعميل (LTV) وهل تسمح باكتساب عملاء جدد بتكلفة أعلى دون خسارة الهوامش؟',
      'ما هو مسار المبيعات أو الباقة الإضافية (Upsell / Backend) التي تضاعف متوسط قيمة الطلب (AOV) للمشترين الحاليين؟',
      'ما هي نقاط التسرب الإحصائية بين النقر على الإعلان وإتمام الدفع في فانل المبيعات الموسع؟',
    ];
  } else if (
    diagnosis.trafficVsOfferVerdict === 'TRAFFIC_PRIMARY_BOTTLENECK' ||
    diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
  ) {
    nextQuestions = [
      'أين يتواجد الجمهور الأكثر ألماً واستعداداً للدفع حالياً، وكيف نصل إليه دون خلطه بزوار غير مؤهلين؟',
      'ما هي الكلمات الدقيقة ومصطلحات البحث التي يستخدمها المشتري الجاد عندما يبحث بنشاط عن حل لهذه المشكلة؟',
      'هل رسالة الإعلان وفلترة المحتوى تضع معايير قبول واضحة تمنع وصول غير المستهدفين إلى صفحة العرض؟',
    ];
  } else if (diagnosis.primaryBottleneck === 'PROOF') {
    nextQuestions = [
      'ما هو الرقم أو الشاهد الملموس الوحيد الذي إذا رآه المشتري سيزول شكه في قدرتك على تسليم النتيجة؟',
      'هل يمكن إجراء تجربة مجانية أو مرحلية لعميل واحد لتوثيق التحول بالأرقام ونشرها كدراسة حالة فورية؟',
      'ما الذي يمنع المشترين السابقين من تقديم شهادات توثق الأثر المالي أو الزمني الذي حققوه من العرض؟',
    ];
  } else if (
    data.offerStage === 'OFFER_STAGE_0_IDEA_ONLY' ||
    data.offerStage === 'OFFER_STAGE_1_NOT_SOLD'
  ) {
    nextQuestions = [
      'من هم 5 أشخاص محددون بالاسم يعانون من هذه المشكلة يومياً ويمكن التحدث معهم هذا الأسبوع دون تكلفة؟',
      'ما هو البديل الذي يدفع فيه العميل أموالاً حالياً، ولماذا لم يحل مشكلته بالكامل؟',
      'ما هو الحد الأدنى من الحل (MVP) الذي يمكن تسليمه يدوياً لإثبات النتيجة قبل بناء أي منصة أو محتوى ضخم؟',
    ];
  } else {
    nextQuestions = [
      'ما هو الاعتراض الحقيقي الصريح الذي ذكره آخر 3 عملاء مترددين قبل أن يتوقفوا عن إتمام الدفع؟',
      'ما هو المكون الوحيد داخل العرض الذي لو حذفته لن تتأثر النتيجة النهائية للعميل إطلاقاً؟',
      'هل المشترون الحاليون راضون عن سرعة ظهور أول نتيجة ملموسة (Time-to-Value) بعد الشراء؟',
    ];
  }

  return {
    strategicDecision: stratDecision,
    strategicDecisionExplanationArabic: stratExplanation,
    funnelReadiness,
    missingEvidenceArabic: missingEvidence,
    positioningStatus,
    valuePropositionStatus,
    executiveDiagnosis: {
      strongestAssetArabic:
        data.mechanismDescription?.trim()
          ? `الآلية والمنهجية المطروحة (${mechanism}) واضحة وتعطي العرض طابعاً تطبيقياً وليس تنظيرياً.`
          : 'وضوح المشكلة التي يحاول العرض حلها في السوق.',
      biggestWeaknessArabic:
        diagnosis.primaryBottleneck === 'PROOF'
          ? 'ضعف الإثبات التجاري والنتائج الملموسة مقارنة بحجم الوعد، مما يترك المشتري في دائرة الشك.'
          : diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
          ? 'نوعية الجمهور ومصدر الزيارات الحالية غير مؤهلة لمستوى وقيمة العرض.'
          : diagnosis.primaryBottleneck === 'OFFER_COMPLEXITY'
          ? 'حشو العرض بمكونات وتفاصيل كثيرة يرفع مجهود التنفيذ المتصور عند المشتري.'
          : `نقطة الضعف الأساسية تتركز في ${diagnosis.primaryBottleneckNameArabic}.`,
      commonMisunderstandingArabic:
        'الاعتقاد بأن انخفاض المبيعات سببه ارتفاع السعر، بينما الواقع أن المشتري لم يرَ بعد الدليل الكافي أو لم يستوعب فارق النتيجة.',
      decisionNotToTakeNowArabic:
        stratDecision === 'FIX_TRAFFIC_FIRST'
          ? 'لا تعد بناء العرض أو تغير السعر قبل اختباره على جمهور مؤهل يبحث عن الحل.'
          : 'لا تخفّض السعر ولا تضف بونصات عشوائية لتغطية عدم وضوح القيمة أو ضعف الثقة.',
      firstPriorityFixArabic:
        diagnosis.primaryBottleneck === 'PROOF'
          ? 'جمع وتوثيق أول حالة نجاح مفصلة (Tier 2 Proof) قبل إطلاق أي حملة إعلانية جديدة.'
          : diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
          ? 'إعادة توجيه العرض لشريحة تمتلك ميزانية حقيقية وتبحث بنشاط عن الحل.'
          : 'إعادة صياغة العرض للتركيز الصارم على نتيجة واحدة قابلة للقياس.',
    },
    primaryBottleneckExplanationArabic:
      `عنق الزجاجة الأساسي هو (${diagnosis.primaryBottleneckNameArabic}). ` +
      (diagnosis.primaryBottleneck === 'PROOF'
        ? 'المشتري يفهم عرضك لكنه لا يصدق بعد أنه سينجح معه تحديداً. زيادة الكلام الإنشائي لن تعوض غياب الأدلة الملموسة.'
        : diagnosis.primaryBottleneck === 'TRAFFIC_QUALITY'
        ? 'عرضك قد يكون متماسكاً جداً، لكن الأشخاص الذين يرونه حالياً ليس لديهم الألم الملح أو القدرة المالية، فلا تعبث بالعرض قبل إصلاح مصدر الزيارات.'
        : diagnosis.primaryBottleneck === 'OFFER_COMPLEXITY'
        ? 'المشتري يرى حجم المواد كبيراً جداً، فيشعر أنه يشتري "وظيفة ثانية" وواجباً ثقيلاً بدلاً من حل سريع لمشكلته.'
        : 'هذا العنصر هو الذي يوقف المشترين المهتمين عند بوابة اتخاذ القرار النهائي.'),
    offerRebuild: {
      targetBuyerArabic: buyer,
      coreProblemArabic:
        data.problemEvidenceStatus === 'SELLER_ASSUMPTION'
          ? `الفرضية الحالية: ${problem}`
          : problem,
      desiredOutcomeArabic: outcome,
      mechanismArabic: mechanism,
      offerCategoryArabic: data.productType || 'منتج / خدمة تجارية',
      deliveryModelArabic: data.deliveryMethod || 'تسليم رقمي منظم',
      corePromiseDirectionArabic: `مساعدة ${buyer} على تحقيق (${outcome}) عبر (${mechanism}) بخطوات تطبيقية محددة.`,
      recommendedScopeArabic: 'التركيز الصارم على المكونات التي تسلم النتيجة مباشرة وتقليل المكونات التي تتطلب تفرغاً طويلاً.',
      timeToValueExpectationArabic:
        data.timeToValue === 'same_day'
          ? 'قيمة فورية في نفس اليوم'
          : data.timeToValue === 'days'
          ? 'قيمة ملموسة خلال أيام قليلة'
          : 'قيمة تظهر تدريجياً مع التطبيق',
      mainDecisionReasonArabic: 'الوضوح الكامل في كيفية حدوث النقلة مع أدنى مجهود تشغيلي ممكن.',
      currentStrategicCoreArabic: `${data.productType || 'عرض'} موجه لـ (${buyer}) لحل (${problem}) بسعر ${data.priceAmount || ''} ${data.currency || ''}.`,
      recommendedStrategicCoreArabic:
        stratDecision === 'FIX_TRAFFIC_FIRST'
          ? 'لا أوصي بإعادة بناء الجوهر الحالي للعرض الآن. حافظ على الوعد والآلية الأساسية، واختبرهما على جمهور مؤهل قبل إجراء تعديل هيكلي.'
          : `إعادة تركيز العرض على تسليم (${outcome}) عبر (${mechanism}) ومعالجة عنق الزجاجة (${diagnosis.primaryBottleneckNameArabic}).`,
      keepArabic: [
        data.mechanismDescription?.trim()
          ? `الآلية والمنهجية المطروحة (${mechanism}).`
          : 'التركيز على المشكلة المحددة دون تشتيت.',
        data.priceAmount ? `نقطة التسعير الحالية (${data.priceAmount} ${data.currency}) لاختبارها ميدانياً.` : 'نموذج التسليم الرقمي المباشر.',
      ],
      changeArabic: [
        `معالجة عنق الزجاجة الأساسي (${diagnosis.primaryBottleneckNameArabic}).`,
        'صياغة الوعد بكلمات العميل بدلاً من المصطلحات الفنية.',
      ],
      removeArabic: removeOrDelayComps.length > 0 ? removeOrDelayComps : ['أي ملحقات إضافية وضعت فقط لتضخيم الحجم المتصور دون خدمة النتيجة مباشرة.'],
      missingEvidenceArabic: missingEvidence.slice(0, 3),
      hypothesesToValidateArabic: [
        'استعداد الشريحة الفعلي للدفع مقابل حل هذه المشكلة بالذات.',
        'هل الآلية المقترحة توفر ثقة كافية لدى المشتري لإتمام الشراء.',
      ],
    },
    positioningStatement: (() => {
      const buyerFitScore = diagnosis.dimensionScores.buyer_offer_fit?.score ?? 0;
      if (buyerFitScore < 50 || data.hasPaidCustomers === 'NO') {
        return {
          strategicVersionArabic: `اتجاه تموضع أولي — يحتاج تضييق الشريحة قبل اعتماده: مساعدة ${buyer} على التعامل مع (${problem})، بانتظار اختبار رد فعل السوق الفعلي.`,
          naturalMarketingVersionArabic: `حل مقترح لـ ${buyer} لمعالجة ${problem}، يحتاج إلى مزيد من التحقق الميداني مع المشترين.`,
        };
      }
      return {
        strategicVersionArabic: `عرض تجاري يساعد ${buyer} على تحقيق (${outcome}) عبر (${mechanism}) مع معالجة عائق (${data.primaryObjectionCategory === 'price' ? 'التكلفة والمخاطرة المالية' : 'ضيق الوقت وصعوبة التنفيذ'}).`,
        naturalMarketingVersionArabic: `مسار مباشر لـ ${buyer} للوصول إلى ${outcome} بالاعتماد على ${mechanism}.`,
      };
    })(),
    valueProposition: (() => {
      const hasEconomicDriver = (data.valueDrivers || []).some(
        d => d === 'INCREASES_REVENUE_POTENTIAL' || d === 'REDUCES_COST'
      );
      const mappedDrivers = (data.valueDrivers || []).map(d => {
        switch (d) {
          case 'SAVES_TIME': return 'توفير الوقت';
          case 'REDUCES_COST': return 'تقليل التكلفة';
          case 'INCREASES_REVENUE_POTENTIAL': return 'إمكانية زيادة العائد';
          case 'REDUCES_RISK': return 'تقليل المخاطرة';
          case 'REDUCES_COMPLEXITY': return 'تبسيط التعقيد';
          case 'IMPROVES_SPEED': return 'تسريع الإنجاز';
          case 'BUILDS_CAPABILITY': return 'بناء القدرة والمهارة';
          case 'IMPROVES_CONVENIENCE': return 'تسهيل العمل';
          case 'IMPROVES_STATUS': return 'تحسين المكانة';
          default: return 'قيمة نوعية';
        }
      });
      const driversSummary = mappedDrivers.length > 0 ? mappedDrivers.slice(0, 2).join(' و') : 'الخطوات المحددة';

      const customerVal =
        data.valueEvidenceStatus === 'SELLER_ASSUMPTION'
          ? `[فرضية قيد التحقق]: الحصول على ${outcome} والتخلص من ${problem} (يتطلب اختبار قبول الشريحة للقيمة).`
          : `الحصول على ${outcome} والتخلص من ${problem} من خلال ${driversSummary} عبر خطوات واضحة.`;

      const businessVal =
        data.valueEvidenceStatus === 'SELLER_ASSUMPTION' || diagnosis.confidenceRating !== 'HIGH'
          ? hasEconomicDriver
            ? '[فرضية عائد تجاري]: قد يخلق قيمة أو عائداً تجارياً إذا أثبت المشترون استعدادهم للدفع.'
            : '[فرضية قيمة نوعية]: قد يسهم في تحسين كفاءة العمل إذا أثبت المشترون اهتمامهم بالحل.'
          : hasEconomicDriver
          ? 'تحقيق عائد أو خفض تكلفة من خلال حل المشكلة، شريطة الالتزام بتطبيق المخرجات.'
          : `تحسين كفاءة ${buyer} وبناء قدرة تشغيلية مستدامة.`;

      const freqDesc =
        data.problemFrequency === 'daily'
          ? 'تتكرر يومياً وتستنزف الموارد'
          : data.problemFrequency === 'weekly'
          ? 'تتكرر أسبوعياً'
          : 'مستمرة';

      const whyNow =
        data.problemEvidenceStatus === 'SELLER_ASSUMPTION'
          ? `[فرضية إلحاح]: يُفترض أن تأجيل الحل يسبب تراكم (${data.costOfInaction || problem})، وتتطلب هذه الفرضية تأكيداً من المشترين لمعرفة هل المشكلة تمثل أولوية حالية لديهم.`
          : `لأن المشكلة ${freqDesc} وتسبب (${data.costOfInaction || 'خسائر غير مباشرة'})، مما يجعل التأجيل مكلفاً قياساً بالبدائل المتاحة.`;

      return {
        customerValueArabic: customerVal,
        businessValueArabic: businessVal,
        whyNowArabic: whyNow,
        whyThisApproachArabic: `لأنه يعتمد على ${mechanism} للتركيز على المشكلة المحددة بدلاً من الإجراءات المتفرقة.`,
        whyNotAlternativeArabic: whyNotAlternative,
        isHypothesis: data.valueEvidenceStatus === 'SELLER_ASSUMPTION' || diagnosis.confidenceRating !== 'HIGH',
      };
    })(),
    offerStack: {
      coreComponents: coreComps,
      supportingComponents: supportingComps,
      optionalComponents: optionalComps,
      removeOrDelayComponents: removeOrDelayComps,
    },
    bonusLogic: {
      recommendedBonuses: recBonuses,
      bonusStatusVerdictArabic: bonusVerdict,
    },
    whatNotToAddArabic: [
      'لا تضف بونصات عشوائية لتغطية ضعف وضوح العرض الأساسي.',
      'لا تضف مجتمعاً تفاعلياً (Community) إذا كانت النتيجة تحتاج تنفيذاً مركزاً وليس نقاشات يومية.',
      'لا تضف ساعات تدريبية إضافية، فالعميل يدفع لاختصار وقته لا لاستهلاكه.',
    ],
    whatNotToChangeYetArabic: [
      'لا تخفض السعر الآن قبل اختبار وضوح القيمة وربطها بالنتيجة مباشرة.',
      'لا تعيد تصميم صفحة البيع بالكامل قبل التأكد من مطابقة الرسالة لوعي العميل.',
      'لا تضف ضمانات استرداد مفتوحة غير مشروطة قد تجذب عملاء غير جادين أو تعرضك لالتزامات غير متحكم فيها.',
    ],
    objectionMap: (() => {
      if (data.objectionEvidenceStatus === 'NO_BUYER_CONVERSATIONS') {
        return {
          actualObjections: [],
          assumedObjections: [],
          unansweredObjections: [
            {
              objection: 'لم يتم رصد أي اعتراضات بعد لعدم إجراء محادثات حقيقية مع مشترين محتملين.',
              strategicAdvice: 'الخطوة الأولى الإلزامية هي إجراء 5 محادثات استكشافية حية لتسجيل الشكوك والتردد الحقيقي بدلاً من التخمين.',
            },
          ],
        };
      }
      if (data.objectionEvidenceStatus === 'ASSUMED_OBJECTIONS_ONLY') {
        return {
          actualObjections: [],
          assumedObjections: data.assumedObjections?.trim()
            ? [
                {
                  objection: data.assumedObjections.trim(),
                  belief: 'افتراض ذاتي من البائع حول تردد المشتري، يتطلب تحققا سلوكيا مباشرا.',
                  neededEvidence: 'طرح العرض على 3 مشترين مستهدفين وملاحظة هل هذا الاعتراض يظهر فعلاً أم أن هناك مانعاً آخر.',
                  solvedByCopyAlone: false,
                },
              ]
            : [],
          unansweredObjections: [
            {
              objection: 'هل ما يفترضه البائع يطابق ما يتردد بشأنه المشتري الحقيقي عند الدفع؟',
              strategicAdvice: 'اختبر هذا الافتراض في محادثات بيع حقيقية قبل إنفاق وقت وميزانية على نصوص رد الاعتراض.',
            },
          ],
        };
      }
      return {
        actualObjections: data.actualObjectionsHeard?.trim()
          ? [
              {
                objection: data.actualObjectionsHeard.trim(),
                belief: 'عائق حقيقي ومباشر سمعه البائع من عملاء حقيقيين أثناء مسار البيع.',
                neededEvidence:
                  data.primaryObjectionCategory === 'price'
                    ? 'أرقام وإثباتات واضحة لعائد الاستثمار وتكلفة استمرار المشكلة مقارنة بالسعر.'
                    : 'تبسيط خطوات التنفيذ وتقديم ضمان مرحلي يزيل مخاطرة المجهود والوقت.',
                solvedByCopyAlone: false,
              },
            ]
          : [],
        assumedObjections: data.assumedObjections?.trim()
          ? [
              {
                objection: data.assumedObjections.trim(),
                belief: 'افتراض إضافي من البائع بجانب الاعتراضات الفعلية المسموعة.',
                neededEvidence: 'فصل ما هو مسموع يقيناً عما هو متوقع بالحدس.',
                solvedByCopyAlone: false,
              },
            ]
          : [],
        unansweredObjections: [
          {
            objection: 'ما هو العائق الخفي الذي لا يصرح به المشتري عند الانسحاب الصامت دون تعليق؟',
            strategicAdvice: 'تتبع مرحلة التردد في الفانل لمعرفة هل العائق ثقة في النتيجة أم صعوبة في بدء التطبيق.',
          },
        ],
      };
    })(),
    riskReductionStrategy: {
      recommendedApproachArabic: recommendedRiskApproach,
      guaranteeSuitabilityArabic: guaranteeSuitability,
      practicalSafeguardsArabic: practicalSafeguards,
    },
    pricingStrategicAdvice: {
      verdictArabic:
        diagnosis.pricingDiagnosisCategory === 'PRICE_SUPPORTED_BY_EVIDENCE'
          ? 'السعر مثبت تجارياً بالمبيعات ولا يمثل العائق الأساسي.'
          : diagnosis.pricingDiagnosisCategory === 'PRICE_NOT_YET_DIAGNOSABLE'
          ? 'السعر لم يُختبر بعد بما يكفي للحكم عليه، فلا تغيره بناءً على انطباعات عابرة.'
          : 'المشكلة ليست في الرقم المجرد، بل في فجوة إدراك العائد مقابل المخاطرة.',
      valueToPriceLogicArabic:
        'المشتري لا يقارن السعر بالصفر، بل يقارنه ببديلين: تكلفة استمرار المشكلة، وتكلفة الحلول البديلة الأخرى.',
      actionBeforeChangingPriceArabic:
        'اربط السعر مباشرة بقيمة ما يوفره المشتري من وقت أو مال قبل أن تفكر في أي خصم.',
    },
    differentiationMap: {
      sameAsAlternativesArabic: sameAsAlternatives,
      differentButIrrelevantArabic: diffIrrelevant,
      differentAndValuableArabic: diffValuable,
      potentiallyDefensibleArabic: diffDefensible,
    },
    salesMessageHierarchyArabic: [
      `1. تعريف المشتري وسياقه (${buyer})`,
      `2. تسمية المشكلة الحقيقية وألمها اليومي (${problem})`,
      '3. تكلفة التعايش مع الوضع الحالي وخسارة الفرص',
      `4. الوعد بالنتيجة المحددة القابلة للقياس (${outcome})`,
      `5. شرح الآلية التي تجعل التحول حقيقياً وموثوقاً (${mechanism})`,
      '6. لماذا يفشل هذا المشتري مع الحلول الأخرى المعتادة',
      '7. الإثبات التجاري والنتائج الموثقة',
      '8. معالجة الاعتراضات الصريحة والمخاوف الخفية',
      '9. نزع فتيل المخاطرة وتبسيط الخطوة الأولى',
      `10. الدعوة المباشرة للعمل (${ctaTitle})`,
    ],
    headlineDirections: [
      {
        angle: 'Outcome',
        angleArabic: 'زاوية النتيجة المباشرة',
        headlineArabic: `كيف تصل إلى ${outcome} بدون إهدار أشهر في التجربة والخطأ؟`,
        rationaleArabic: 'تخاطب مباشرة الرغبة في النتيجة دون الخوض في التفاصيل الفنية أولاً.',
      },
      {
        angle: 'Problem',
        angleArabic: 'زاوية المشكلة والألم الحالي',
        headlineArabic: `إذا كنت تعاني من ${problem}، فهذه الآلية تضع حداً لهذه الخسارة اليومية.`,
        rationaleArabic: 'تخلق تعاطفاً وتطابقاً ذهنياً مع العميل الذي يبحث عن حل لإحباطه الحالي.',
      },
      {
        angle: 'Mechanism',
        angleArabic: 'زاوية الآلية الفريدة',
        headlineArabic: `اكتشف كيف تساعدك ${mechanism} على الوصول إلى النتيجة خطوة بخطوة.`,
        rationaleArabic: 'تناسب المشترين الأكثر وعياً الذين جربوا حلولاً تقليدية سابقة وفشلت معهم.',
      },
      {
        angle: 'Cost of Status Quo',
        angleArabic: 'زاوية تكلفة الوضع الحالي',
        headlineArabic: `كم يكلفك تأجيل حل هذه المشكلة كل شهر في وقتك وأرباحك؟`,
        rationaleArabic: 'تخاطب جانب الخسارة المتراكمة وتوقظ الإلحاح في اتخاذ القرار فوراً.',
      },
      {
        angle: 'Specific Buyer',
        angleArabic: 'زاوية المشتري المحدد بالاسم والسياق',
        headlineArabic: `إلى كل ${buyer} يملك حلاً لكنه يواجه عائق التحويل والمبيعات.`,
        rationaleArabic: 'تجذب الانتباه فوراً بالفلترة المباشرة وتجعل القارئ يشعر أن الكلام موجه إليه حصراً.',
      },
    ],
    ctaDirection: {
      recommendedCTAArabic: ctaTitle,
      recommendedCTAType: ctaType,
      rationaleArabic: ctaRationale,
    },
    salesPageSkeleton: [
      {
        sectionTitleArabic: 'Hero Section (المقدمة والنداء الأولي)',
        strategicPurposeArabic: 'تحديد المشتري والوعد الأساسي في أول 5 ثوانٍ وإثارة الاهتمام بالآلية.',
        keyElementsArabic: ['العنوان الرئيسي (زاوية النتيجة)', 'العنوان الفرعي التوضيحي', 'زر النداء المباشر للعمل'],
      },
      {
        sectionTitleArabic: 'Problem Recognition (مرآة المشكلة)',
        strategicPurposeArabic: 'وصف واقع العميل بدقة تجعله يقول: "هذا الشخص يفهمني أفضل مني".',
        keyElementsArabic: ['الأعراض اليومية للمشكلة', 'تكلفة الاستمرار على نفس النهج'],
      },
      {
        sectionTitleArabic: 'The Mechanism (شرح الآلية)',
        strategicPurposeArabic: 'تفسير لماذا فشلت الطرق القديمة وكيف يضمن هذا النهج النتيجة.',
        keyElementsArabic: ['مخطط الآلية', 'الفارق الجوهري عن الحلول البديلة'],
      },
      {
        sectionTitleArabic: 'The Offer Stack (ما ستحصل عليه تحديداً)',
        strategicPurposeArabic: 'تقديم المكونات كحلول لعوائق التنفيذ وليس مجرد قائمة ملفات.',
        keyElementsArabic: coreComps.slice(0, 3),
      },
      {
        sectionTitleArabic: 'Proof & Trust (الأدلة والإثباتات)',
        strategicPurposeArabic: 'تحويل الشك إلى ثقة عبر دلائل حقيقية وواقعية.',
        keyElementsArabic: ['نماذج من النتائج', 'دراسة حالة مفصلة', 'سياق العمل'],
      },
      {
        sectionTitleArabic: 'Who It Is For / Not For (الفلترة الواضحة)',
        strategicPurposeArabic: 'حماية وقتك وبناء مصداقية عالية عبر إعلان من لا يناسبه العرض.',
        keyElementsArabic: ['من يجب أن يشتري فوراً', 'من لا نرحب بشرائه'],
      },
      {
        sectionTitleArabic: 'Risk Reversal & FAQ (نزع المخاطرة والأسئلة الشائعة)',
        strategicPurposeArabic: 'الإجابة على آخر الاعتراضات العالقة قبل خطوة الشراء النهائية.',
        keyElementsArabic: ['شروط الضمان والالتزام', 'أهم 5 اعتراضات في صيغة سؤال وجواب', 'زر الشراء النهائي'],
      },
    ],
    primaryExperiment: {
      hypothesisArabic: expHypothesis,
      whatToChangeArabic: expWhatToChange,
      whatToKeepConstantArabic: expWhatToKeep,
      observedEvidenceArabic: expObservedEvidence,
      decisionRuleArabic: expDecisionRule,
      whyThisHypothesisMattersArabic: expWhyMatters,
      testAudienceArabic: expTestAudience,
      evidenceToCollectArabic: expEvidenceToCollect,
      whatNotToConcludeArabic: expWhatNotToConclude,
    },
    nextThreeQuestionsArabic: nextQuestions,
    sevenDayValidationSprint: sprintDays,
  };
}

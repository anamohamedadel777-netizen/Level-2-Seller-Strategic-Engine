import React, { useState, useEffect } from 'react';
import { QuestionnaireData, FullOfferBlueprint, LeadCaptureData, OfferPath, OfferStage } from './types';
import { BrandHeader } from './components/BrandHeader';
import { OfferHero } from './components/OfferHero';
import { PathAndMaturitySelector } from './components/PathAndMaturitySelector';
import { QuestionnaireWizard } from './components/QuestionnaireWizard';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { ReportDashboard } from './components/ReportDashboard';
import { PrintView } from './components/PrintView';
import { StressTestsModal } from './components/StressTestsModal';
import { STRESS_TEST_CASES } from './lib/stressTests';
import { calculateDeterministicDiagnosis, generateDeterministicStrategicFallback } from './lib/scoringEngine';
import { validateFullQuestionnaire } from './lib/questionnaireValidation';

const LOCAL_STORAGE_DRAFT_KEY = 'ma_offer_lab_draft_v1';
const LOCAL_STORAGE_REPORT_KEY = 'ma_offer_lab_report_v1';
const LOCAL_STORAGE_UNLOCKED_KEY = 'ma_offer_lab_unlocked_v1';

const DEFAULT_QUESTIONNAIRE: QuestionnaireData = {
  offerPath: 'OFFER_PATH_UNSELECTED',
  offerStage: 'OFFER_STAGE_UNSELECTED',
  productName: '',
  productType: '',
  versionStatus: '',
  priceAmount: '',
  currency: 'USD',
  deliveryMethod: 'not_selected',
  isLive: 'NOT_SURE',
  hasPaidCustomers: 'NOT_SURE',
  salesVolumeRange: 'unselected',
  buyerRole: '',
  buyerStage: '',
  buyerSituation: '',
  buyerCurrentAlternative: '',
  buyerTrigger: '',
  coreProblem: '',
  problemEvidenceStatus: 'UNSELECTED',
  currentWorkaroundStatus: 'UNSELECTED',
  problemFrequency: 'UNSELECTED',
  costOfInaction: '',
  lossType: [],
  whyWorthPaying: '',
  beforeState: '',
  afterState: '',
  outcomeObservability: 'UNSELECTED',
  outcomeControllability: 'UNSELECTED',
  timeToValue: 'UNSELECTED',
  includedComponents: [],
  coreComponentsDescription: '',
  paddingComponentsDescription: '',
  valueDrivers: [],
  valueEvidenceStatus: 'UNSELECTED',
  coreComponentOutcomeLink: '',
  whyNotAlternatives: '',
  mechanismType: 'UNSELECTED',
  mechanismDescription: '',
  differentiationEvidenceStatus: 'UNSELECTED',
  evidenceTiersPresent: [],
  proofDetails: '',
  objectionEvidenceStatus: 'UNSELECTED',
  actualObjectionsHeard: '',
  assumedObjections: '',
  primaryObjectionCategory: 'UNSELECTED',
  pricingRationale: 'UNSELECTED',
  pricingEvidenceContext: 'UNSELECTED',
  hasAnyonePaidExactPrice: 'UNSELECTED',
  isPriceRepeatedObjection: 'UNSELECTED',
  checkoutStep: 'UNSELECTED',
  decisionEffortLevel: 'UNSELECTED',
  requiresApproval: 'UNSELECTED',
  hasNextStepClear: 'UNSELECTED',
  primaryPerceivedRisk: 'UNSELECTED',
  currentRiskReversals: [],
  trafficSources: [],
  isTrafficQualified: 'UNSELECTED',
};

export function App() {
  const [view, setView] = useState<'LANDING' | 'PATH_MATURITY' | 'QUESTIONNAIRE' | 'LOADING' | 'REPORT'>('LANDING');
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(DEFAULT_QUESTIONNAIRE);
  const [blueprint, setBlueprint] = useState<FullOfferBlueprint | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loadingStageText, setLoadingStageText] = useState<string>('');
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modals
  const [showStressTests, setShowStressTests] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // Check Local Storage on mount
  useEffect(() => {
    try {
      const savedDraftRaw = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (savedDraftRaw) {
        const parsed = JSON.parse(savedDraftRaw);
        const draftDate = new Date(parsed.timestamp || 0).getTime();
        const now = Date.now();
        // 7 days expiration
        if (now - draftDate < 7 * 24 * 60 * 60 * 1000 && parsed.data) {
          setHasSavedDraft(true);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        }
      }

      const savedReportRaw = localStorage.getItem(LOCAL_STORAGE_REPORT_KEY);
      if (savedReportRaw) {
        const parsedReport = JSON.parse(savedReportRaw);
        const reportDate = new Date(parsedReport.generatedAt || 0).getTime();
        const now = Date.now();
        // 30 days expiration
        if (now - reportDate < 30 * 24 * 60 * 60 * 1000) {
          setBlueprint(parsedReport);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_REPORT_KEY);
        }
      }

      const unlockedStatus = localStorage.getItem(LOCAL_STORAGE_UNLOCKED_KEY);
      if (unlockedStatus === 'true') {
        setIsUnlocked(true);
      }
    } catch {
      // Ignore local storage errors
    }
  }, []);

  // Autosave Draft
  useEffect(() => {
    if (view === 'QUESTIONNAIRE' || view === 'PATH_MATURITY') {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_DRAFT_KEY,
          JSON.stringify({
            data: questionnaire,
            timestamp: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore local storage quota errors
      }
    }
  }, [questionnaire, view]);

  // Resume Draft
  const handleResumeDraft = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          setQuestionnaire(parsed.data);
          setView('QUESTIONNAIRE');
        }
      }
    } catch {
      setView('PATH_MATURITY');
    }
  };

  // Reset / Clear Data
  const handleResetData = () => {
    if (window.confirm('هل تريد مسح بياناتك المحفوظة محلياً والبدء من جديد؟ (هذا الإجراء يمسح بيانات جهازك فقط)')) {
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REPORT_KEY);
      localStorage.removeItem(LOCAL_STORAGE_UNLOCKED_KEY);
      setQuestionnaire(DEFAULT_QUESTIONNAIRE);
      setBlueprint(null);
      setIsUnlocked(false);
      setHasSavedDraft(false);
      setView('LANDING');
    }
  };

  // Run Offer Analysis
  const handleRunAnalysis = async () => {
    setView('LOADING');

    // Real progressive stage messages
    const stages = [
      'جاري حساب هيكل العرض وأوزان أبعاد قرار الشراء...',
      'جاري تصنيف مستويات الأدلة السلوكية والتجارية...',
      'جاري تشخيص عنق الزجاجة الأساسي وفحص جودة الزيارات...',
      'جاري إجراء التفسير الاستراتيجي وهندسة صياغة الوعد...',
      'جاري إعداد Offer Architecture Blueprint وخطة الـ 7 أيام...',
    ];

    let stageIdx = 0;
    setLoadingStageText(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setLoadingStageText(stages[stageIdx]);
      }
    }, 800);

    try {
      const response = await fetch('/api/analyze-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaire }),
      });

      const json = await response.json();
      clearInterval(interval);

      if (json.success && json.data) {
        setBlueprint(json.data);
        localStorage.setItem(LOCAL_STORAGE_REPORT_KEY, JSON.stringify(json.data));
        setView('REPORT');
      } else {
        throw new Error(json.error || 'Server returned invalid response');
      }
    } catch (err: any) {
      clearInterval(interval);
      console.warn('API call failed or unavailable, checking client-side validation:', err);

      // Defense in depth: Client-side fallback validation (Point 12)
      const validation = validateFullQuestionnaire(questionnaire);
      if (!validation.valid) {
        console.warn('Questionnaire validation failed before client-side fallback:', validation.missing);
        setValidationError('الاستبيان غير مكتمل أو يحتوي على حقول لم يتم اختيارها. يرجى استكمال كافة الحقول المطلوبة قبل استخراج التقرير.');
        setView('QUESTIONNAIRE');
        return;
      }

      setValidationError(null);
      const deterministic = calculateDeterministicDiagnosis(questionnaire);
      const aiInterpretation = generateDeterministicStrategicFallback(questionnaire, deterministic);

      const clientBlueprint: FullOfferBlueprint = {
        deterministic,
        aiInterpretation,
        questionnaire,
        generatedAt: new Date().toISOString(),
      };

      setBlueprint(clientBlueprint);
      localStorage.setItem(LOCAL_STORAGE_REPORT_KEY, JSON.stringify(clientBlueprint));
      setView('REPORT');
    }
  };

  // Unlock Blueprint via Lead Capture
  const handleUnlockBlueprint = async (leadData: LeadCaptureData) => {
    try {
      await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
    } catch (e) {
      console.warn('Webhook dispatch failed, continuing locally:', e);
    }

    setIsUnlocked(true);
    localStorage.setItem(LOCAL_STORAGE_UNLOCKED_KEY, 'true');
  };

  // Load a Stress Test Case directly for live testing
  const handleLoadTestCase = (testId: string) => {
    const testCase = STRESS_TEST_CASES.find(t => t.id === testId);
    if (testCase) {
      setQuestionnaire(testCase.input);
      setView('QUESTIONNAIRE');
    }
  };

  return (
    <div className="min-h-screen bg-[#040405] text-[#FCFCFA] flex flex-col font-['Alexandria',sans-serif] selection:bg-[#F5BF1E]/30 selection:text-[#FBD052]">
      {/* Brand Header */}
      <BrandHeader
        onReset={handleResetData}
        onOpenStressTests={() => setShowStressTests(true)}
        hasBlueprint={Boolean(blueprint && isUnlocked)}
        onPrint={() => setShowPrintView(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {view === 'LANDING' && (
          <OfferHero
            onStart={() => setView('PATH_MATURITY')}
            hasSavedDraft={hasSavedDraft}
            onResumeDraft={handleResumeDraft}
          />
        )}

        {view === 'PATH_MATURITY' && (
          <PathAndMaturitySelector
            selectedPath={questionnaire.offerPath}
            selectedStage={questionnaire.offerStage}
            onSelectPath={(path: OfferPath) => setQuestionnaire(prev => ({ ...prev, offerPath: path }))}
            onSelectStage={(stage: OfferStage) => setQuestionnaire(prev => ({ ...prev, offerStage: stage }))}
            onNext={() => setView('QUESTIONNAIRE')}
          />
        )}

        {view === 'QUESTIONNAIRE' && (
          <div>
            {validationError && (
              <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="p-4 bg-[#23170D] border border-[#F5BF1E]/60 rounded-xl text-sm text-[#FBD052] flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5BF1E] font-bold">⚠️ تنبيه التحقق:</span>
                    <span>{validationError}</span>
                  </div>
                  <button
                    onClick={() => setValidationError(null)}
                    className="text-xs text-[#C8C5BA] hover:text-[#FCFCFA] underline cursor-pointer mr-4"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
            <QuestionnaireWizard
              data={questionnaire}
              onChange={setQuestionnaire}
              onSubmit={handleRunAnalysis}
              onBackToMaturity={() => setView('PATH_MATURITY')}
            />
          </div>
        )}

        {view === 'LOADING' && (
          <LoadingAnalysis currentStageText={loadingStageText} />
        )}

        {view === 'REPORT' && blueprint && (
          <ReportDashboard
            blueprint={blueprint}
            isUnlocked={isUnlocked}
            onUnlock={handleUnlockBlueprint}
            onPrint={() => setShowPrintView(true)}
            onBackToEdit={() => setView('QUESTIONNAIRE')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#4A2F15]/30 bg-[#040405] py-8 text-center text-xs text-[#797979]">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-[#C8C5BA]">
            Mohamed Adel — Sales Funnel Architect
          </p>
          <p className="text-[11px] text-[#797979]">
            مختبر هندسة العرض (Offer Architecture Lab) · جزء من المنظومة الاستراتيجية لصناع العروض والفانلز
          </p>
          <p className="text-[10px] text-[#797979]/70 pt-2">
            جميع البيانات المعالجة تخضع للتدقيق الحتمي وتصنيف الأدلة السلوكية الصارمة.
          </p>
        </div>
      </footer>

      {/* Print View Modal */}
      {showPrintView && blueprint && (
        <PrintView
          blueprint={blueprint}
          onClose={() => setShowPrintView(false)}
        />
      )}

      {/* Stress Tests Modal */}
      {showStressTests && (
        <StressTestsModal
          onClose={() => setShowStressTests(false)}
          onLoadTestCase={handleLoadTestCase}
        />
      )}
    </div>
  );
}

export default App;

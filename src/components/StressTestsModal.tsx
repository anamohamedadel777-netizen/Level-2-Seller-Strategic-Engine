import React, { useState } from 'react';
import { STRESS_TEST_CASES, StressTestResult } from '../lib/stressTests';
import { CheckCircle2, XCircle, Play, ShieldAlert, X } from 'lucide-react';

interface StressTestsModalProps {
  onClose: () => void;
  onLoadTestCase: (testId: string) => void;
}

export const StressTestsModal: React.FC<StressTestsModalProps> = ({
  onClose,
  onLoadTestCase,
}) => {
  const [results, setResults] = useState<StressTestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/stress-tests');
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
      }
    } catch {
      // If server route fails, import and run client-side
      const { runStressTests } = await import('../lib/stressTests');
      setResults(runStressTests());
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-[#23170D] border border-[#F5BF1E]/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-right max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4A2F15]/50 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#F5BF1E]" />
            <h3 className="text-lg font-bold text-[#FCFCFA] font-['Cairo']">
              مختبر فحوصات النزاهة الاستراتيجية (Stress Tests A–N)
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-[#797979] hover:text-[#FCFCFA] rounded-md hover:bg-[#040405]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#C8C5BA] leading-relaxed">
          فحص ومطابقة المحرك الاستراتيجي ضد الحالات المعتمدة: كشف الأوصاف الفضفاضة، تفوق التحديد الدقيق، امتصاص حالات عدم التأكد، منع تضخيم الإثبات إنشائياً، توثيق أثر المبيعات الحقيقية، منع إرسال الاستبيانات الفارغة، تقييد فرضيات المشكلة، تقييد القيمة المدركة بحد أقصى 60 عند غياب التحقق من المشتري، تقييد التمايز عند مجرد الاعتقاد، إلغاء نقاط تحديد المخاطرة المجردة واقتصارها على وسائل النزع الفعلية، وتقييد التسعير دون محادثات مبيعات حقيقية.
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-5 py-2.5 text-xs font-bold text-[#040405] bg-[#F5BF1E] hover:bg-[#FBD052] rounded-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 font-['Cairo']"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'جاري تشغيل الفحوصات...' : 'تشغيل كافة الفحوصات الاستراتيجية الآن'}</span>
          </button>

          {results && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم اجتياز {results.filter(r => r.passed).length} من {results.length} اختبارات بنجاح</span>
            </span>
          )}
        </div>

        {/* Test List */}
        <div className="space-y-3">
          {STRESS_TEST_CASES.map(tc => {
            const res = results?.find(r => r.id === tc.id);
            return (
              <div
                key={tc.id}
                className="p-4 bg-[#040405] border border-[#4A2F15]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FBD052]">{tc.id}</span>
                    <span className="font-bold text-[#FCFCFA]">{tc.name}</span>
                    {res && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.passed
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {res.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{res.passed ? 'ناجح' : 'فشل'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#797979]">{tc.descriptionArabic}</p>
                  <p className="text-[11px] text-[#C8C5BA]">
                    المعيار المتوقع: <span className="text-[#FBD052]">{tc.expectedAssertionArabic}</span>
                  </p>
                  {res && (
                    <div className="text-[10px] text-[#797979] font-mono pt-1">
                      Score: {res.offerStrengthScore} | Conf: {res.confidenceScore} | Bottleneck: {res.primaryBottleneck} | Sprint: {res.validationSprintMode}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onLoadTestCase(tc.id);
                      onClose();
                    }}
                    type="button"
                    className="px-3 py-1.5 text-xs text-[#C8C5BA] bg-[#23170D] border border-[#4A2F15] rounded hover:border-[#F5BF1E] hover:text-[#FCFCFA] transition-colors"
                  >
                    تجربة هذا العرض
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

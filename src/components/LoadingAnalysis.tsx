import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingAnalysisProps {
  currentStageText: string;
}

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ currentStageText }) => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Brand animated spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border-2 border-[#4A2F15] border-t-[#F5BF1E] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#F5BF1E]/10" />
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <span className="text-xs font-mono text-[#F5BF1E] tracking-wider uppercase">
          Engine Processing
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-[#FCFCFA] font-['Cairo']">
          جاري هندسة وتحليل العرض استراتيجياً
        </h3>
        <p className="text-sm text-[#C8C5BA] font-medium min-h-[24px] transition-all">
          {currentStageText || 'جاري فحص وتصنيف الأدلة...'}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#4A2F15]/30 max-w-sm text-xs text-[#797979] leading-relaxed">
        التحليل يطبق معايير استشارية صارمة لفصل مشاكل المنتج عن العرض عن الثقة عن جودة الزيارات.
      </div>
    </div>
  );
};

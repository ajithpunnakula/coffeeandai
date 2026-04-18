"use client";

interface MasteryCheckpointProps {
  domain: string;
  mastery: number;
  passed: boolean;
  weakConcepts: string[];
  onContinue: () => void;
  onReviewWeak: () => void;
  hasRemediationCards: boolean;
}

export default function MasteryCheckpoint({
  domain,
  mastery,
  passed,
  weakConcepts,
  onContinue,
  onReviewWeak,
  hasRemediationCards,
}: MasteryCheckpointProps) {
  const masteryPct = Math.round(mastery * 100);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
      <div className="p-6 sm:p-8 space-y-5">
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-gray-500">
            Checkpoint
          </span>
          <h3 className="text-lg font-bold text-gray-100 mt-1">{domain}</h3>
        </div>

        {/* Mastery bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Your mastery</span>
            <span className="font-semibold text-amber-400">{masteryPct}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Result */}
        {passed ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
            Nice work! You passed this section.
          </p>
        ) : (
          <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
            You didn&apos;t quite pass. Consider reviewing the material below.
          </p>
        )}

        {/* Weak concepts */}
        {weakConcepts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Areas to strengthen
            </span>
            <div className="flex flex-wrap gap-2">
              {weakConcepts.slice(0, 5).map((concept) => (
                <span
                  key={concept}
                  className="text-xs bg-red-500/10 text-red-300 border border-red-500/20 rounded-full px-3 py-1"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onContinue}
            className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all text-sm"
          >
            Continue
          </button>
          {hasRemediationCards && !passed && (
            <button
              onClick={onReviewWeak}
              className="flex-1 py-3 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-all text-sm"
            >
              Review Material
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

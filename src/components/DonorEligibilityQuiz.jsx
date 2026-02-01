import React, { useState } from 'react';
import { updateDonorEligibility } from '../lib/firestore';
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, RefreshCw, Info } from 'lucide-react';

export default function DonorEligibilityQuiz({ userId, onComplete, onClose }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null); // 'passed' | 'failed'
    const [failReasons, setFailReasons] = useState([]);

    const questions = [
        {
            key: 'medication',
            question: "Are you currently taking any medication (e.g., antibiotics, blood thinners)?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "Certain medications (antibiotics, blood thinners) may prevent you from donating. Please consult a doctor.",
            explanation: "Some medications can affect the recipient or your own health during donation."
        },
        {
            key: 'age_group',
            question: "Are you between 18 to 65 years of age?",
            type: 'boolean',
            correctAnswer: true,
            failMessage: "Donors must be between 18 and 65 years old.",
            explanation: "This age range ensures you are legally able to consent and physically mature enough to donate safely."
        },
        {
            key: 'weight_check',
            question: "Is your body weight at least 45 kg?",
            type: 'boolean',
            correctAnswer: true,
            failMessage: "Donors must weigh at least 45kg.",
            explanation: "You need a certain body mass to safely lose 450ml of blood without health risks."
        },
        {
            key: 'recent_donation',
            question: "Have you donated blood in the last 3 months?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "You must wait at least 3 months between blood donations.",
            explanation: "Your body needs this time to replenish its iron stores and red blood cells."
        },
        {
            key: 'health_today',
            question: "Have you had any infection, fever, cold, cough, weakness, dizziness, or fatigue today?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "You must be in good health and symptom-free to donate.",
            explanation: "Donating while sick can worsen your condition and transmit infections to the recipient."
        },
        {
            key: 'surgery_dental',
            question: "Have you undergone any surgery or major dental procedure recently (last 6–12 months)?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "Recent surgeries or major dental procedures require a recovery period before donating.",
            explanation: "Surgery increases the risk of infection and your body needs energy to heal fully first."
        },
        {
            key: 'sleep',
            question: "Did you have at least 6 hours of sleep last night?",
            type: 'boolean',
            correctAnswer: true,
            failMessage: "A minimum of 6 hours of sleep is required to ensure your safety during donation.",
            explanation: "Lack of sleep increases the risk of dizziness, fainting, and fatigue after donation."
        },
        {
            key: 'meal',
            question: "Did you eat a light (non-oily) meal 2–3 hours before donating?",
            type: 'boolean',
            correctAnswer: true,
            failMessage: "Eating a light meal beforehand helps prevent dizziness and maintains blood sugar.",
            explanation: "Donating on an empty stomach can cause a drop in blood sugar and lead to fainting."
        },
        {
            key: 'tattoo_piercing',
            question: "Have you had any tattoos, piercings, or acupuncture in the last 6 months?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "There is a 6-month waiting period after tattoos, piercings, or acupuncture.",
            explanation: "Needles can introduce infections like Hepatitis, which may not show up in tests immediately."
        },
        {
            key: 'alcohol',
            question: "Have you consumed alcohol in the last 24 hours?",
            type: 'boolean',
            correctAnswer: false,
            failMessage: "You must avoid alcohol for at least 24 hours before donating.",
            explanation: "Alcohol causes dehydration, which makes it harder for your body to recover after donating."
        }
    ];

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [questions[step].key]: val }));
    };

    const handleNext = async () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            calculateResult();
        }
    };

    const calculateResult = async () => {
        let reasons = [];
        
        for (const q of questions) {
            if (answers[q.key] !== q.correctAnswer) {
                reasons.push(q.failMessage);
            }
        }

        const isEligible = reasons.length === 0;
        setFailReasons(reasons);
        setResult(isEligible ? 'passed' : 'failed');

        // Update Database
        if (userId) {
            await updateDonorEligibility(userId, isEligible);
        }

        if (onComplete) onComplete(isEligible);
    };

    const handleRetake = () => {
        setStep(0);
        setAnswers({});
        setResult(null);
        setFailReasons([]);
    };

    if (result) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl max-h-[90vh] overflow-y-auto">
                    {result === 'passed' ? (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">You are Eligible!</h2>
                            <p className="text-slate-600">Great news! You meet all the basic requirements to donate blood.</p>
                            
                            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm text-left">
                                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                <p>Note: A doctor will re-verify donor eligibility before actual blood donation to ensure your safety and the recipient's safety.</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Not Eligible at this time</h2>
                            
                            <div className="text-left bg-red-50 p-4 rounded-xl space-y-2">
                                <p className="font-bold text-red-800 mb-2">Reasons:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                    {failReasons.map((reason, idx) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-slate-500 text-sm">
                                Don't worry! This is often temporary. Please check back later when you meet the criteria.
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Retake Quiz
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = questions[step];
    const canProceed = answers[currentQ.key] !== undefined && answers[currentQ.key] !== null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 rounded-t-2xl overflow-hidden">
                    <div
                        className="h-full bg-brand-500 transition-all duration-300 ease-out"
                        style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    ✕
                </button>

                <div className="mt-6 mb-6">
                    <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">Question {step + 1} of {questions.length}</span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">{currentQ.question}</h2>
                    
                    {/* Explanation Box */}
                    <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-start gap-3 text-blue-800 text-sm">
                        <Info className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>{currentQ.explanation}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAnswer(true)}
                            className={`py-4 px-6 rounded-xl border-2 font-bold transition-all ${answers[currentQ.key] === true
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleAnswer(false)}
                            className={`py-4 px-6 rounded-xl border-2 font-bold transition-all ${answers[currentQ.key] === false
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                        >
                            No
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 0}
                        className={`p-2 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-0`}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                    >
                        {step === questions.length - 1 ? 'Finish' : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
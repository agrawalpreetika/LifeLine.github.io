import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VoiceAssistant = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const parseEmergencyText = (transcript) => {
        const lowerText = transcript.toLowerCase();
        let detectedType = '';
        let detectedLoc = '';

        // 1. Improved Blood Group Parsing (Priority-Based)

        // Strategy: 
        // A. Remove spaces to handle "A B positive" -> "abpositive"
        // B. Use regex that prioritizes AB match first

        const cleanText = lowerText.replace(/\s+/g, '');

        // Regex to match blood groups: 
        // (ab|a|b|o) -> Matches AB first, then A, B, O
        // (?:...) -> Non-capturing group for the sign
        // (\+|plus|positive|\-|minus|negative) -> Matches sign

        const bloodRegex = /(ab|a|b|o)(?:\+|-|plus|positive|minus|negative)/i;
        const match = cleanText.match(bloodRegex);

        if (match) {
            // Reconstruct standard format
            const group = match[1].toUpperCase(); // AB, A, B, O
            const signRaw = match[0].substring(group.length).toLowerCase(); // The rest of the string

            const isPositive = signRaw.includes('+') || signRaw.includes('plus') || signRaw.includes('positive');
            const sign = isPositive ? '+' : '-';

            detectedType = `${group}${sign}`;
        }

        // Fallback: Check for "Universal Donor"
        if (!detectedType && lowerText.includes('universal donor')) {
            detectedType = 'O-';
        }

        // 2. Extract Location
        const locMatch = lowerText.match(/\b(in|at|near|from)\s+(.+)/i);
        if (locMatch && locMatch[2]) {
            detectedLoc = locMatch[2].replace(/[.,?!]/g, '').trim();
        }

        // 3. Detect Urgency
        const isUrgent = /urgent|emergency|critical|accident|help/.test(lowerText);

        return { detectedType, detectedLoc, isUrgent };
    };

    const handleVoiceSearch = () => {
        if (!isSupported) {
            toast.error("Voice search not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            toast('Listening for emergency request...', { icon: '🎙️', duration: 3000 });
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            console.log("Transcript:", transcript);

            if (event.results[0].isFinal) {
                const { detectedType, detectedLoc, isUrgent } = parseEmergencyText(transcript);

                if (isUrgent) {
                    toast("Urgent request detected!", { icon: '🚨' });
                }

                if (detectedType || detectedLoc) {
                    const params = new URLSearchParams();
                    if (detectedType) params.append('group', detectedType);
                    if (detectedLoc) params.append('city', detectedLoc);
                    if (isUrgent) params.append('urgent', 'true');

                    const toastId = toast.loading(`Searching for ${detectedType || 'donors'} in ${detectedLoc || 'your area'}...`);

                    // Delay slightly for UX
                    setTimeout(() => {
                        toast.dismiss(toastId); // Dismiss loading toast
                        navigate(`/search?${params.toString()}`, { replace: true });
                        // Reset state after navigation
                        setIsListening(false);
                    }, 800);
                } else {
                    toast.error("Could not understand blood type or location. Please try again.");
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone permission denied.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <button
            onClick={handleVoiceSearch}
            className={`fixed bottom-6 right-20 z-[100] p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${isListening
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-110 animate-pulse'
                : 'bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                }`}
            title="Emergency Voice Request"
            style={{ marginBottom: '0px' }} // Ensure it doesn't conflict with chatbot
        >
            {isListening ? (
                <Mic className="h-6 w-6" />
            ) : (
                <MicOff className="h-6 w-6 group-hover:scale-110 transition-transform" />
            )}
            {!isListening && (
                <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Voice Emergency
                </span>
            )}
        </button>
    );
};

export default VoiceAssistant;

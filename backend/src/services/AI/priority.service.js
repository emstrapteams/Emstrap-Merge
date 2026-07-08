const severityWeights = {
    CRITICAL: 400,
    HIGH: 300,
    MODERATE: 200,
    LOW: 100,
};

export const calculatePriority = (aiAnalysis) => {

    if (!aiAnalysis) {
        return {
            priority: 0,
            warningRequired: false,
        };
    }

    const severity =
        aiAnalysis.severity || "LOW";

    const confidence =
        aiAnalysis.confidence || 0;

    const priority = Math.round(
        severityWeights[severity] * confidence
    );

    // Ask for confirmation if AI confidence is below 60%
    // Ask for confirmation only when AI is uncertain
    // and also believes it may not be an emergency.
    const warningRequired = confidence < 0.60;
    return {
        priority,
        warningRequired,
    };

};
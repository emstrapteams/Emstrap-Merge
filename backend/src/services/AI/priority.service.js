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
    // OR AI predicts it is a non-emergency
    const warningRequired =
        confidence < 0.60 ||
        aiAnalysis.predicted_class === "non_emergency";

    return {
        priority,
        warningRequired,
    };

};
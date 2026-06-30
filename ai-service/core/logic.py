class EmergencyLogic:
    """
    Emergency Assessment Logic for mapping classification results to 
    Severity and Ambulance recommendations.
    """
    
    CLASS_TO_SEVERITY = {
        "accident": "HIGH",
        "fire": "CRITICAL",
        "non_emergency": "LOW"
    }
    
    SEVERITY_TO_AMBULANCE = {
        "LOW": "No Ambulance Required",
        "HIGH": "Advanced Life Support Ambulance",
        "CRITICAL": "ICU Ambulance"
    }
    
    @classmethod
    def get_assessment(cls, predicted_class, confidence):

       severity = cls.CLASS_TO_SEVERITY.get(
           predicted_class,
           "LOW"
        )

       ambulance = cls.SEVERITY_TO_AMBULANCE.get(
           severity,
           "No Ambulance Required"
        )

       return {
           "severity": severity,
           "recommended_ambulance": ambulance
        }
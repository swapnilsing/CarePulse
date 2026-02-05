import json
import math
import sys


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(value, upper))


def sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))


def build_recommendation(risk_band: str) -> str:
    if risk_band == "High":
        return "Urgent neurology referral, MRI review, and 3-month reassessment window recommended."
    if risk_band == "Moderate":
        return "Schedule advanced neurocognitive testing and repeat assessment within 6 months."
    return "Continue routine annual cognitive monitoring with preventive lifestyle guidance."


def predict(features: dict) -> dict:
    age = float(features.get("age", 65))
    mmse = float(features.get("mmse", 28))
    cdr = float(features.get("cdr", 0))
    apoe4_positive = bool(features.get("apoe4Positive", False))
    hippocampal_volume = features.get("hippocampalVolume")

    age_signal = clamp((age - 60) / 25, 0, 1)
    mmse_signal = clamp((30 - mmse) / 30, 0, 1)
    cdr_signal = clamp(cdr / 3, 0, 1)
    apoe_signal = 1 if apoe4_positive else 0

    hippocampal_signal = 0.4
    if hippocampal_volume is not None:
        hv = float(hippocampal_volume)
        hippocampal_signal = clamp((5000 - hv) / 2500, 0, 1)

    weighted_sum = (
        -1.8
        + (1.35 * age_signal)
        + (1.95 * mmse_signal)
        + (1.55 * cdr_signal)
        + (0.95 * apoe_signal)
        + (1.05 * hippocampal_signal)
    )

    risk_score = clamp(sigmoid(weighted_sum), 0.02, 0.99)
    confidence = clamp(0.72 + (risk_score * 0.24), 0.7, 0.96)

    key_factors = []
    if age >= 75:
        key_factors.append("Advanced age profile")
    if mmse <= 24:
        key_factors.append("Reduced MMSE cognitive score")
    if cdr >= 1:
        key_factors.append("Elevated CDR dementia staging")
    if apoe4_positive:
        key_factors.append("APOE4 positive marker")
    if hippocampal_volume is not None and float(hippocampal_volume) < 3500:
        key_factors.append("Low hippocampal volume trend")

    if not key_factors:
        key_factors.append("No dominant high-risk marker in current intake")

    if risk_score >= 0.7:
        risk_band = "High"
    elif risk_score >= 0.4:
        risk_band = "Moderate"
    else:
        risk_band = "Low"

    return {
        "riskScore": round(risk_score, 2),
        "confidence": f"{round(confidence * 100)}%",
        "riskBand": risk_band,
        "keyFactors": key_factors,
        "recommendation": build_recommendation(risk_band),
        "modelVersion": "carepulse-ml-v2",
    }


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}
    result = predict(payload)
    print(json.dumps(result))


if __name__ == "__main__":
    main()

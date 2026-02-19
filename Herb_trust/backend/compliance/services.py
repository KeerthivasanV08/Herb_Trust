from datetime import date
import hashlib
import json


# 🌍 Geo Validation
def validate_location(latitude, longitude, herb_type):
    """
    Validates if herb is grown in authentic geographical region.
    """
    herb_regions = {
        "Ashwagandha": {"lat_min": 8, "lat_max": 20},
        "Tulsi": {"lat_min": 5, "lat_max": 25},
    }

    if herb_type in herb_regions:
        region = herb_regions[herb_type]

        if region["lat_min"] <= latitude <= region["lat_max"]:
            return True

    return False


# 🧬 Digital Twin Potency Model
def predict_potency(harvest_date):
    """
    Predicts potency degradation over time.
    Starts at 100% on harvest date, degrades 1.5% per day.
    """
    today = date.today()
    days_passed = (today - harvest_date).days

    # Handle future dates (harvest date in future)
    if days_passed < 0:
        days_passed = 0

    # Degrade 1.5% per day
    potency = 100 - (days_passed * 1.5)

    # Cap between 0-100%
    if potency < 0:
        potency = 0
    elif potency > 100:
        potency = 100

    return round(potency, 2)


# ⚖ Compliance Decision
def compliance_decision(auth_score, geo_valid, potency):
    """
    Final decision logic based on all verification metrics.
    """
    if auth_score >= 75 and geo_valid and potency >= 60:
        return "Approved"

    if auth_score < 40:
        return "Fraud Suspected"

    return "Rejected"


# 🔐 Hash Generator (Blockchain Simulation)
def generate_hash(data):
    """
    Generates tamper-proof SHA-256 hash of batch verification data.
    """
    encoded_data = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(encoded_data).hexdigest()

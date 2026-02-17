from datetime import date
import hashlib
import json


# 🌍 Geo Validation
def validate_location(latitude, longitude, herb_type):

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

    today = date.today()
    days_passed = (today - harvest_date).days

    potency = 100 - (days_passed * 1.5)

    if potency < 0:
        potency = 0

    return round(potency, 2)


# ⚖ Compliance Decision
def compliance_decision(auth_score, geo_valid, potency):

    if auth_score >= 75 and geo_valid and potency >= 60:
        return "Approved"

    if auth_score < 40:
        return "Fraud Suspected"

    return "Rejected"


# 🔐 Hash Generator (Blockchain Simulation)
def generate_hash(data):

    encoded_data = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(encoded_data).hexdigest()


def predict_potency(harvest_date):
    """
    Predicts potency degradation over time.
    """

    today = date.today()
    days_passed = (today - harvest_date).days

    # Degrade 1.5% per day
    potency = 100 - (days_passed * 1.5)

    if potency < 0:
        potency = 0

    return round(potency, 2)
def compliance_decision(auth_score, geo_valid, potency):
    """
    Final decision logic.
    """

    if auth_score >= 75 and geo_valid and potency >= 60:
        return "Approved"

    if auth_score < 40:
        return "Fraud Suspected"

    return "Rejected"
def generate_hash(data):
    """
    Generates tamper-proof hash of batch verification.
    """

    encoded_data = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(encoded_data).hexdigest()
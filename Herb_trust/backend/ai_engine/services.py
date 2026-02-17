from transformers import pipeline

# Load model once when server starts
classifier = pipeline(
    "image-classification",
    model="google/vit-base-patch16-224"
)

def verify_herb(image_path):
    """
    Takes image path and returns authenticity score (0-100)
    """

    try:
        result = classifier(image_path)
        top_result = result[0]
        confidence_score = top_result["score"] * 100
        return round(confidence_score, 2)

    except Exception as e:
        print("AI Error:", e)
        return 0

def compile_raw_response(data, page_index, engine_name) -> dict:
     # combine data into a single response
    min_x = min([d['bbox']['topLeft']['x'] for d in data])
    min_y = min([d['bbox']['topLeft']['y'] for d in data])
    max_x = max([d['bbox']['bottomRight']['x'] for d in data])
    max_y = max([d['bbox']['bottomRight']['y'] for d in data])
    average_confidence = sum([d['confidence'] for d in data]) / len(data)
    combined_data = {
        "engine": engine_name,
        "number_of_tokens": len(data),
        "ocr_responses": [
            {
                "confidence": average_confidence,
                "text": " ".join([d['text'] for d in data]),
                "page_number": int(page_index),
                "bbox": {
                    "topLeft": {
                        "x": min_x,
                        "y": min_y
                    },
                    "bottomRight": {
                        "x": max_x,
                        "y": max_y
                    },
                    "topRight": {
                        "x": max_x,
                        "y": min_y
                    },
                    "bottomLeft": {
                        "x": min_x,
                        "y": max_y
                    }
                }
            }
        ]
    }
    
    return combined_data
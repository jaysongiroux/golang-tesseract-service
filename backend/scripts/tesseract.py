import sys
import io
import json
from PIL import Image
import pytesseract
from pytesseract import Output

def main():
    # get page index from argument
    page_index = sys.argv[1]
    
    # check if raw argument is provided
    raw = False
    if len(sys.argv) > 2:
        raw = sys.argv[2] == 'raw'
    
    image_bytes = io.BytesIO(sys.stdin.buffer.read())
    image = Image.open(image_bytes)

    data = []
    d = pytesseract.image_to_data(image , output_type=Output.DICT)
    for i in range(len(d['text'])):
        if d['text'][i] != '':
            width = d['width'][i]
            height = d['height'][i]
            data.append({
                'text': d['text'][i],
                'page_number': int(page_index),
                'bbox': {
                    'topLeft': {
                        'x': d['left'][i],
                        'y': d['top'][i]
                    },
                    'bottomLeft': {
                        'x': d['left'][i],
                        'y': d['top'][i] + height
                    },
                    'topRight': {
                        'x': d['left'][i] + width,
                        'y': d['top'][i]
                    },
                    'bottomRight': {
                        'x': d['left'][i] + width,
                        'y': d['top'][i] + height
                    }
                },
                'confidence': d['conf'][i]
                })
            
    if raw:
        # combine data into a single response
        min_x = min([d['bbox']['topLeft']['x'] for d in data])
        min_y = min([d['bbox']['topLeft']['y'] for d in data])
        max_x = max([d['bbox']['bottomRight']['x'] for d in data])
        max_y = max([d['bbox']['bottomRight']['y'] for d in data])
        average_confidence = sum([d['confidence'] for d in data]) / len(data)
        combined_data = {
            "confidence": average_confidence,
            "text": "",
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
        for d in data:
            combined_data["text"] += " "+d['text']
            
        
        print(json.dumps({
            "engine": "TESSERACT",
            "number_of_tokens": len(data),
            "ocr_responses": [combined_data]
        }))
        return
    
    # same as return since we are using a pipe
    print(json.dumps({"ocr_responses": data, "engine": "TESSERACT", "number_of_tokens": len(data)}))


if __name__ == "__main__":
    main()

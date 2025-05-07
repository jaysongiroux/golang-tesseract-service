import sys
import json
import easyocr
from utils.tools import compile_raw_response

def main():
    # get page index from argument
    page_index = sys.argv[1]
    
    # check if raw argument is provided
    raw = False
    if len(sys.argv) > 2:
        raw = sys.argv[2] == 'raw'
    
    image_bytes = sys.stdin.buffer.read()
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_bytes)
    data = []
    for bbox, text, confidence in result:
        data.append({
            'text': text,
            'page_number': int(page_index),
            'bbox': {
                'topLeft':{
                    'x': int(bbox[0][0]),
                    'y': int(bbox[0][1])
                },
                'bottomLeft': {
                    'x': int(bbox[1][0]),
                    'y': int(bbox[1][1])
                },
                'topRight': {
                    'x': int(bbox[2][0]),
                    'y': int(bbox[2][1])
                },
                'bottomRight': {
                    'x': int(bbox[3][0]),
                    'y': int(bbox[3][1])
                }
            },
            'confidence': confidence/100
        })
    
    if raw:
        combined_data = compile_raw_response(data, page_index, "EASYOCR")
        print(json.dumps(combined_data))
        return
    
    # same as return since we are using a pipe
    print(json.dumps({"ocr_responses": data, "engine": "EASYOCR", "number_of_tokens": len(data)}))


if __name__ == "__main__":
    main()

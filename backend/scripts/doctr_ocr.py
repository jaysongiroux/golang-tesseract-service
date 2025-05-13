from doctr.io import DocumentFile
from doctr.models import kie_predictor
import json
import sys
from utils.tools import compile_raw_response

detection_arch = 'db_resnet50'
recognition_arch = 'crnn_vgg16_bn'

def main():
    page_index = sys.argv[1]
    raw = False
    if len(sys.argv) > 2:
        raw = sys.argv[2] == 'raw'
    
     # load and download the models
    if page_index == 'load':
        _ = kie_predictor(detection_arch, recognition_arch, pretrained=True, detect_orientation=False)
        return
    
    # read image
    image_bytes = sys.stdin.buffer.read()
    
    # load model
    model = kie_predictor(detection_arch, recognition_arch, pretrained=True, detect_orientation=False)
    
    # predict
    doc = DocumentFile.from_images(image_bytes)
    result = model(doc)
        
    # compile data
    data = []
    for page in result.pages:
        words = page.predictions.get('words', [])
        pageX, pageY = page.dimensions
        for word in words:            
            xmin, ymin = word.geometry[0]
            xmax, ymax = word.geometry[1]
            
            # convert to absolute coordinates
            xmin = xmin * pageX
            ymin = ymin * pageY
            xmax = xmax * pageX
            ymax = ymax * pageY
            
            data.append({
                'text': word.value,
                'page_number': int(page_index),
                'confidence': word.confidence,
                'bbox': {
                    'topLeft': {
                        'x': int(xmin),
                        'y': int(ymin)
                    },
                    'bottomLeft': {
                        'x': int(xmin),
                        'y': int(ymax)
                    }, 
                    'topRight': {
                        'x': int(xmax),
                        'y': int(ymin)
                    },
                    'bottomRight': {
                        'x': int(xmax),
                        'y': int(ymax)
                    }
                }
            })
    
    if raw:
        combined_data = compile_raw_response(data, page_index, "DOCTR")
        print(json.dumps(combined_data))
        return
    
    # same as return since we are using a pipe
    print(json.dumps({"ocr_responses": data, "engine": "DOCTR", "number_of_tokens": len(data)}))
    
    
    
if __name__ == "__main__":
    main()
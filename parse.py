import re
import json

def parse_mcqs(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split roughly by ANSWER: X to get chunks. Or regex to match Question and Options and Answer.
    question_blocks = []
    
    # regex rule: 
    # Match a question (anything up to A.)
    # Then A. ... B. ... C. ... D. ...
    # Then ANSWER: [A-D]
    
    pattern = r'(?P<q>.*?)\s*A\.\s*(?P<a>.*?)\s*(?:B\.\s*)(?P<b>.*?)\s*(?:C\.\s*)(?P<c>.*?)\s*(?:D\.\s*)(?P<d>.*?)\s*(?:ANSWER:\s*)(?P<ans>[A-D])'
    
    matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
    
    mcqs = []
    for match in matches:
        q = match.group('q').strip()
        # Clean up question number if exists.
        q = re.sub(r'^\d+\.\s*', '', q)
        
        mcqs.append({
            'question': q,
            'options': {
                'A': match.group('a').strip(),
                'B': match.group('b').strip(),
                'C': match.group('c').strip(),
                'D': match.group('d').strip()
            },
            'answer': match.group('ans').strip().upper()
        })
        
    with open('mcqs.json', 'w', encoding='utf-8') as f:
        json.dump(mcqs, f, indent=4)
        print(f"Parsed {len(mcqs)} MCQs.")

if __name__ == '__main__':
    parse_mcqs('raw.txt')

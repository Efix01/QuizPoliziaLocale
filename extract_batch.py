import json

def extract_batch(file_path, start_id, end_id, output_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Ensure we are working with correct ID range, handling potential string/int issues
        batch = []
        for q in data:
            q_id = q.get('id')
            if q_id is not None:
                try:
                    q_id = int(q_id)
                    if start_id <= q_id <= end_id:
                        batch.append(q)
                except ValueError:
                    continue # Skip if ID is not an integer
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(batch, f, indent=2, ensure_ascii=False)
            
        print(f"Extracted {len(batch)} quizzes to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

import sys

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python extract_batch.py <input_file> <start_id> <end_id> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    start_id = int(sys.argv[2])
    end_id = int(sys.argv[3])
    output_file = sys.argv[4]
    
    extract_batch(input_file, start_id, end_id, output_file)

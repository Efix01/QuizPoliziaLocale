#!/bin/bash
find src -type f \( -name "*.tsx" -o -name "*.css" \) -exec sed -i '' \
  -e 's/#fafafa/#0f172a/gi' \
  -e 's/#ffffff/#1e293b/gi' \
  -e 's/#e5e7eb/#334155/gi' \
  -e 's/#111827/#f8fafc/gi' \
  -e 's/#4b5563/#cbd5e1/gi' \
  -e 's/#6b7280/#94a3b8/gi' \
  -e 's/#9ca3af/#64748b/gi' \
  {} +
echo "Done"

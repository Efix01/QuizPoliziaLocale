#!/bin/bash
find src -type f \( -name "*.tsx" -o -name "*.css" \) -exec sed -i '' \
  -e 's/#0f172a/#fafafa/gi' \
  -e 's/#1e293b/#ffffff/gi' \
  -e 's/#334155/#e5e7eb/gi' \
  -e 's/#f8fafc/#111827/gi' \
  -e 's/#cbd5e1/#4b5563/gi' \
  -e 's/#94a3b8/#6b7280/gi' \
  -e 's/#64748b/#9ca3af/gi' \
  {} +
echo "Done"

function normalizeKey(key) {
  // 1. Remove surrounding quotes and trim
  let normalized = key.trim().replace(/^"|"$/g, '').trim();

  // 2. Handle literal escape sequences if present (\n, \r)
  normalized = normalized.replace(/\\n/g, '\n').replace(/\\r/g, '');

  // 3. Normalize all line endings to \n and remove \r
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '');

  return normalized;
}

function joinSplitKey(env, prefix) {
  const parts = [];
  let i = 1;
  while (env[`${prefix}_P${i}`]) {
    parts.push(normalizeKey(env[`${prefix}_P${i}`]));
    i++;
  }
  return parts.length > 0 ? parts.join('') : null;
}

const testCases = [
    {
        name: "Standard with literal \\n",
        input: "-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----",
        expected: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----"
    },
    {
        name: "With mixed \\r\\n and \\n",
        input: "-----BEGIN PRIVATE KEY-----\r\nABC\n-----END PRIVATE KEY-----",
        expected: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----"
    },
    {
        name: "With surrounding quotes and literal \\n",
        input: '  "-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----"  ',
        expected: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----"
    },
    {
        name: "Split key with mixed formatting (per-part quoting)",
        isSplit: true,
        env: {
            BFS_PRIVATE_KEY_P1: ' "-----BEGIN PRIVATE KEY-----\\n" ',
            BFS_PRIVATE_KEY_P2: ' "ABC\\n-----END PRIVATE KEY-----" '
        },
        prefix: "BFS_PRIVATE_KEY",
        expected: "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----"
    }
];

let allPassed = true;
testCases.forEach(tc => {
    let result;
    if (tc.isSplit) {
        result = joinSplitKey(tc.env, tc.prefix);
    } else {
        result = normalizeKey(tc.input);
    }

    if (result === tc.expected) {
        console.log(`PASS: ${tc.name}`);
    } else {
        console.log(`FAIL: ${tc.name}`);
        console.log(`  Expected: [${tc.expected.replace(/\n/g, '\\n')}]`);
        console.log(`  Got:      [${result.replace(/\n/g, '\\n')}]`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log("\nAll normalization tests PASSED!");
} else {
    process.exit(1);
}

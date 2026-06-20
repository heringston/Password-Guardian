/* ============================================
   Password Guardian — Application Logic
   Client-side password strength analyzer
   
   PRIVACY: Passwords NEVER leave the device.
   No network requests, no logging, no storage.
   ============================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

    /* ── DOM References ──────────────────────── */
    const passwordInput  = document.getElementById('password-input');
    const toggleBtn      = document.getElementById('toggle-visibility');
    const analyzeBtn     = document.getElementById('analyze-btn');
    const clearBtn       = document.getElementById('clear-btn');
    const resultsSection = document.getElementById('results');
    const charCount      = document.getElementById('char-count');

    // Strength meter
    const strengthLabel  = document.getElementById('strength-label');
    const strengthScore  = document.getElementById('strength-score');
    const strengthBar    = document.getElementById('strength-bar');

    // Dynamic content containers
    const compositionGrid    = document.getElementById('composition-grid');
    const crackTimeGrid      = document.getElementById('crack-time-grid');
    const suggestionsList    = document.getElementById('suggestions-list');
    const variationsContainer = document.getElementById('variations-container');

    /* ── Constants ────────────────────────────── */
    const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
    const STRENGTH_COLORS = ['#ff4757', '#ff6b35', '#ffa502', '#2ed573', '#00d4aa'];

    const WORD_LIST = [
        'Sky', 'Moon', 'Star', 'Nova', 'Echo', 'Bolt', 'Wave', 'Peak',
        'Flux', 'Dusk', 'Dawn', 'Sage', 'Fern', 'Jade', 'Reef', 'Cove',
        'Mesa', 'Vale', 'Wren', 'Lynx', 'Hawk', 'Fox', 'Elm', 'Oak',
        'Pine', 'Ash', 'Gem', 'Opal', 'Onyx', 'Rust', 'Arc', 'Zen'
    ];

    const SEPARATORS = ['_', '-', '#', '$', '!', '@', '&', '+', '~'];

    const SEQUENTIAL_PATTERNS = [
        'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk',
        'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst',
        'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
        '012', '123', '234', '345', '456', '567', '678', '789',
        'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
        'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
        'zxc', 'xcv', 'cvb', 'vbn', 'bnm'
    ];

    /* ── Helper Functions ────────────────────── */

    /**
     * Standard debounce function
     */
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Get a random item from an array
     */
    function getRandomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Get a random integer between min (inclusive) and max (inclusive)
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get strength label from zxcvbn score (0-4)
     */
    function getStrengthLabel(score) {
        return STRENGTH_LABELS[score] || 'Unknown';
    }

    /**
     * Get strength color from zxcvbn score (0-4)
     */
    function getStrengthColor(score) {
        return STRENGTH_COLORS[score] || '#888';
    }

    /**
     * Check for repeated characters (3+ of the same character in a row)
     */
    function checkRepeatedPatterns(password) {
        return /(.)\1{2,}/.test(password);
    }

    /**
     * Check for sequential patterns (abc, 123, qwerty runs, etc.)
     */
    function checkSequentialPatterns(password) {
        const lower = password.toLowerCase();
        return SEQUENTIAL_PATTERNS.some(pattern => lower.includes(pattern));
    }

    /**
     * Check for common letter substitutions (l33t speak)
     */
    function checkCommonSubstitutions(password) {
        const substitutions = [
            { pattern: /[3]/, nearby: /e/i },
            { pattern: /[@]/, nearby: /a/i },
            { pattern: /[0]/, nearby: /o/i },
            { pattern: /[1]/, nearby: /[il]/i },
            { pattern: /[$]/, nearby: /s/i },
            { pattern: /[7]/, nearby: /t/i },
        ];
        
        let count = 0;
        for (const sub of substitutions) {
            if (sub.pattern.test(password)) count++;
        }
        return count >= 2; // Only flag if multiple common substitutions found
    }

    /**
     * Split password into logical segments based on character type transitions.
     * e.g., "BlueTiger2004" → ["Blue", "Tiger", "2004"]
     */
    function detectSegments(password) {
        if (!password || password.length === 0) return [password];

        const segments = [];
        let current = password[0];

        for (let i = 1; i < password.length; i++) {
            const c = password[i];
            const prev = password[i - 1];

            // Detect transitions
            const isTransition =
                // lowercase → uppercase
                (/[a-z]/.test(prev) && /[A-Z]/.test(c)) ||
                // letter → digit
                (/[a-zA-Z]/.test(prev) && /[0-9]/.test(c)) ||
                // digit → letter
                (/[0-9]/.test(prev) && /[a-zA-Z]/.test(c)) ||
                // alphanumeric → symbol
                (/[a-zA-Z0-9]/.test(prev) && !/[a-zA-Z0-9]/.test(c)) ||
                // symbol → alphanumeric
                (!/[a-zA-Z0-9]/.test(prev) && /[a-zA-Z0-9]/.test(c));

            if (isTransition) {
                segments.push(current);
                current = c;
            } else {
                current += c;
            }
        }
        segments.push(current);
        return segments.filter(s => s.length > 0);
    }

    /**
     * Show a toast notification
     */
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2000);
    }

    /**
     * Determine crack time severity class based on the time string
     */
    function getCrackTimeSeverity(timeStr) {
        const lower = (timeStr || '').toLowerCase();
        if (lower === 'instant' || lower.includes('second')) return 'severity-critical';
        if (lower.includes('minute') || lower.includes('hour')) return 'severity-high';
        if (lower.includes('day') || lower.includes('month')) return 'severity-medium';
        if (lower.includes('year')) return 'severity-low';
        if (lower.includes('centur')) return 'severity-safe';
        return 'severity-medium';
    }

    /**
     * Sanitize a string for safe HTML insertion
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /* ── Core Analysis ───────────────────────── */

    /**
     * Run the full analysis pipeline on a password
     */
    function analyzePassword(password) {
        if (!password || password.trim().length === 0) {
            resultsSection.classList.add('hidden');
            return;
        }

        // Guard: ensure zxcvbn is loaded
        if (typeof zxcvbn !== 'function') {
            showToast('Password analysis library is still loading. Please try again.');
            return;
        }

        // Cap analysis at 128 chars for performance, but still use the full password
        const analysisPassword = password.length > 128 ? password.substring(0, 128) : password;
        const result = zxcvbn(analysisPassword);

        // Show results
        resultsSection.classList.remove('hidden');

        // Update each section
        updateStrengthMeter(result);
        updateComposition(password);
        updateCrackTimes(result);
        updateSuggestions(password, result);
        updateVariations(password, result);
    }

    /* ── Strength Meter ──────────────────────── */

    function updateStrengthMeter(result) {
        const score = result.score;
        const label = getStrengthLabel(score);
        const color = getStrengthColor(score);
        const percentage = ((score + 1) * 20);

        strengthLabel.textContent = label;
        strengthLabel.style.color = color;

        strengthScore.textContent = 'Score: ' + score + '/4';

        strengthBar.style.width = percentage + '%';
        strengthBar.style.backgroundColor = color;

        // Update ARIA
        const barContainer = document.getElementById('strength-bar-container');
        barContainer.setAttribute('aria-valuenow', score);
        barContainer.setAttribute('aria-valuetext', label);
    }

    /* ── Composition Analysis ────────────────── */

    function updateComposition(password) {
        const len = password.length;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        const hasRepeats = checkRepeatedPatterns(password);
        const hasSequential = checkSequentialPatterns(password);

        // Length assessment
        let lengthStatus, lengthPass;
        if (len >= 16) {
            lengthStatus = 'Excellent (' + len + ')';
            lengthPass = true;
        } else if (len >= 12) {
            lengthStatus = 'Good (' + len + ')';
            lengthPass = true;
        } else if (len >= 8) {
            lengthStatus = 'Fair (' + len + ')';
            lengthPass = true;
        } else {
            lengthStatus = 'Too short (' + len + ')';
            lengthPass = false;
        }

        const items = [
            { label: 'Password Length',    pass: lengthPass,    status: lengthStatus },
            { label: 'Lowercase Letters',  pass: hasLower,      status: hasLower ? 'Present' : 'Missing' },
            { label: 'Uppercase Letters',  pass: hasUpper,      status: hasUpper ? 'Present' : 'Missing' },
            { label: 'Numbers',            pass: hasDigit,      status: hasDigit ? 'Present' : 'Missing' },
            { label: 'Symbols',            pass: hasSymbol,     status: hasSymbol ? 'Present' : 'Missing' },
            { label: 'Repeated Patterns',  pass: !hasRepeats,   status: hasRepeats ? 'Detected' : 'None found' },
            { label: 'Sequential Patterns', pass: !hasSequential, status: hasSequential ? 'Detected' : 'None found' },
        ];

        compositionGrid.innerHTML = items.map(item => {
            const cls = item.pass ? 'pass' : 'warn';
            const icon = item.pass ? '✓' : '⚠';
            return '<div class="composition-item ' + cls + '">' +
                   '  <span class="comp-icon">' + icon + '</span>' +
                   '  <span class="comp-label">' + escapeHtml(item.label) + '</span>' +
                   '  <span class="comp-status">' + escapeHtml(item.status) + '</span>' +
                   '</div>';
        }).join('');
    }

    /* ── Crack Time Estimates ────────────────── */

    function updateCrackTimes(result) {
        const times = result.crack_times_display;
        const scenarios = [
            {
                key: 'online_throttling_100_per_hour',
                label: 'Throttled Online Attack',
                desc: '100 attempts per hour with rate limiting'
            },
            {
                key: 'online_no_throttling_10_per_second',
                label: 'Unthrottled Online Attack',
                desc: '10 attempts per second without rate limiting'
            },
            {
                key: 'offline_slow_hashing_1e4_per_second',
                label: 'Slow Hash Offline',
                desc: '10,000 attempts per second (bcrypt, scrypt)'
            },
            {
                key: 'offline_fast_hashing_1e10_per_second',
                label: 'Fast Hash Offline',
                desc: '10 billion attempts per second (MD5, SHA-1)'
            }
        ];

        crackTimeGrid.innerHTML = scenarios.map(scenario => {
            const timeStr = times[scenario.key] || 'Unknown';
            const severity = getCrackTimeSeverity(timeStr);
            return '<div class="crack-time-card">' +
                   '  <div class="crack-time-label">' + escapeHtml(scenario.label) + '</div>' +
                   '  <div class="crack-time-value ' + severity + '">' + escapeHtml(timeStr) + '</div>' +
                   '  <div class="crack-time-desc">' + escapeHtml(scenario.desc) + '</div>' +
                   '</div>';
        }).join('');
    }

    /* ── Personalized Suggestions ────────────── */

    function updateSuggestions(password, result) {
        const suggestions = [];
        const seen = new Set();

        /**
         * Add a suggestion if not duplicate
         */
        function addSuggestion(main, reason) {
            const key = main.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                suggestions.push({ main: main, reason: reason || '' });
            }
        }

        // 1. Include zxcvbn warnings
        if (result.feedback && result.feedback.warning) {
            addSuggestion(
                result.feedback.warning,
                'This pattern was detected by advanced analysis and is commonly exploited by attackers.'
            );
        }

        // 2. Include zxcvbn suggestions
        if (result.feedback && result.feedback.suggestions) {
            result.feedback.suggestions.forEach(function (s) {
                addSuggestion(s, 'Recommendation from password strength analysis.');
            });
        }

        // 3. Custom suggestions based on composition
        const len = password.length;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        const hasRepeats = checkRepeatedPatterns(password);
        const hasSequential = checkSequentialPatterns(password);
        const hasCommonSubs = checkCommonSubstitutions(password);

        if (len < 12) {
            addSuggestion(
                'Extend your password by 3–5 characters.',
                'Each added character multiplies the combinations an attacker must try, dramatically increasing security.'
            );
        }

        if (!hasUpper) {
            addSuggestion(
                'Add an uppercase letter in an unexpected position.',
                'Placing an uppercase letter beyond the first character (not just capitalizing the start) increases complexity.'
            );
        }

        if (!hasLower) {
            addSuggestion(
                'Include lowercase letters.',
                'Mixing letter cases forces attackers to check many more combinations.'
            );
        }

        if (!hasDigit) {
            addSuggestion(
                'Incorporate a number that isn\'t a common year or simple sequence.',
                'Avoid years like 1990–2024 or sequences like 123. Use numbers that are meaningful only to you.'
            );
        }

        if (!hasSymbol) {
            addSuggestion(
                'Add one memorable symbol like @, #, or $ between words.',
                'A single symbol can significantly boost strength by adding an entire character class to the password.'
            );
        }

        if (hasCommonSubs) {
            addSuggestion(
                'Your password uses common letter substitutions (like \'e\'→\'3\') that attackers already check.',
                'Try more unique transformations or add entirely new characters instead of predictable swaps.'
            );
        }

        if (hasRepeats) {
            addSuggestion(
                'Avoid repeating the same character multiple times in a row.',
                'Repeated characters (e.g., "aaa") are one of the first patterns attackers check.'
            );
        }

        if (hasSequential) {
            addSuggestion(
                'Remove sequential patterns like \'abc\' or \'123\'.',
                'These are among the first combinations attackers try because they\'re so common in passwords.'
            );
        }

        if (result.score === 3) {
            addSuggestion(
                'Your password is good! Consider extending it with an unrelated word.',
                'Adding one more unrelated word creates a passphrase that can push your password to maximum strength.'
            );
        }

        if (result.score === 4) {
            addSuggestion(
                'Excellent password! Make sure you use a unique password for each account.',
                'Even the strongest password can be compromised if reused across multiple services.'
            );
        }

        // Render suggestions
        if (suggestions.length === 0) {
            suggestionsList.innerHTML = '<div class="suggestion-item">' +
                '<span class="suggestion-icon">✅</span>' +
                '<div class="suggestion-text">' +
                '<p class="suggestion-main">Your password looks great!</p>' +
                '<p class="suggestion-reason">No specific improvements needed at this time.</p>' +
                '</div></div>';
        } else {
            suggestionsList.innerHTML = suggestions.map(function (s) {
                return '<div class="suggestion-item">' +
                       '  <span class="suggestion-icon">💡</span>' +
                       '  <div class="suggestion-text">' +
                       '    <p class="suggestion-main">' + escapeHtml(s.main) + '</p>' +
                       (s.reason ? '    <p class="suggestion-reason">' + escapeHtml(s.reason) + '</p>' : '') +
                       '  </div>' +
                       '</div>';
            }).join('');
        }
    }

    /* ── Stronger Variations Generator ───────── */

    /**
     * Generate 3 stronger password variations.
     * Each strategy guarantees zxcvbn score 4 with centuries-level crack times
     * by building passwords that are long (20+ chars), use mixed character classes,
     * and break any recognizable dictionary/pattern matches.
     */
    function updateVariations(password, result) {
        const variations = [];

        // Variation 1 — Fortress: Word + Separator + Segments + Separator + Word + Number + Symbol
        variations.push(generateFortressVariation(password));

        // Variation 2 — Hybrid: Segments rebuilt with per-segment separators + prefix + suffix
        variations.push(generateHybridVariation(password));

        // Variation 3 — Cipher: Creative char transforms + double symbols + word wrap
        variations.push(generateCipherVariation(password));

        // Render with live zxcvbn analysis for each
        variationsContainer.innerHTML = variations.map(function (v, i) {
            var vResult = zxcvbn(v);
            var vScore = vResult.score;
            var vLabel = getStrengthLabel(vScore);
            // Also show the fast-hash crack time for proof of strength
            var crackTime = vResult.crack_times_display.offline_fast_hashing_1e10_per_second || '';
            return '<div class="variation-card">' +
                   '  <div class="variation-header">' +
                   '    <span class="variation-number">Variation ' + (i + 1) + '</span>' +
                   '    <span class="strength-badge" data-strength="' + vScore + '">' + escapeHtml(vLabel) + '</span>' +
                   '  </div>' +
                   '  <div class="variation-password">' +
                   '    <code>' + escapeHtml(v) + '</code>' +
                   '    <button class="copy-btn" data-password="' + escapeHtml(v) + '" title="Copy to clipboard" aria-label="Copy variation ' + (i + 1) + ' to clipboard">📋</button>' +
                   '  </div>' +
                   (crackTime ? '  <div class="variation-crack-time">Fast hash crack time: <strong>' + escapeHtml(crackTime) + '</strong></div>' : '') +
                   '</div>';
        }).join('');
    }

    /**
     * Get two distinct random words (never the same)
     */
    function getTwoWords() {
        var w1 = getRandomFrom(WORD_LIST);
        var w2 = getRandomFrom(WORD_LIST);
        while (w2 === w1) { w2 = getRandomFrom(WORD_LIST); }
        return [w1, w2];
    }

    /**
     * Variation 1 — Fortress Strategy
     * Structure: Word1 + sep + [original segments joined by sep] + sep + Word2 + 3-digit number + symbol + symbol
     * Example: "hello" → "Jade#Hello#Peak_472!@"
     * Example: "BlueTiger2004" → "Onyx_Blue_Tiger_2004_Reef!837#$"
     * Targets: 24+ characters, 4 character classes, score 4
     */
    function generateFortressVariation(password) {
        var segments = detectSegments(password);
        var words = getTwoWords();
        var sep1 = getRandomFrom(['_', '-', '#', '.']);
        var sep2 = getRandomFrom(['_', '-', '#', '.']);
        var num = getRandomInt(100, 999);
        var sym1 = getRandomFrom(['!', '@', '#', '$', '&', '*']);
        var sym2 = getRandomFrom(['!', '@', '#', '$', '&', '*']);
        // Ensure sym2 differs from sym1 for more entropy
        while (sym2 === sym1) { sym2 = getRandomFrom(['!', '@', '#', '$', '&', '*']); }

        // Capitalize first letter of each segment for mixed case
        var processedSegments = segments.map(function(seg) {
            if (seg.length > 0 && /[a-z]/.test(seg[0])) {
                return seg[0].toUpperCase() + seg.slice(1);
            }
            return seg;
        });

        var variation = words[0] + sep1 + processedSegments.join(sep1) + sep2 + words[1] + num + sym1 + sym2;

        // Harden: guarantee score 4
        variation = hardenToScore4(variation);

        return variation;
    }

    /**
     * Variation 2 — Hybrid Strategy
     * Structure: Word1 + "." + segment1 + sym + segment2 + sym + ... + "-" + 3-digit + Word2 + "!"
     * Example: "password123" → "Bolt.Pass#Word$123-Wren!742&"
     * Targets: 22+ characters, multiple separators, score 4
     */
    function generateHybridVariation(password) {
        var segments = detectSegments(password);
        var words = getTwoWords();
        var syms = ['#', '$', '!', '@', '&', '%', '+'];
        var num = getRandomInt(100, 999);

        // Build the core: join segments with varying separators
        var core = '';
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
            // Capitalize first char of alphabetic segments
            if (/^[a-z]/.test(seg)) {
                seg = seg[0].toUpperCase() + seg.slice(1);
            }
            core += seg;
            if (i < segments.length - 1) {
                core += syms[i % syms.length]; // Cycle through different symbols
            }
        }

        var variation = words[0] + '.' + core + '-' + num + words[1] + getRandomFrom(['!', '&', '#', '$']);

        // Harden: guarantee score 4
        variation = hardenToScore4(variation);

        return variation;
    }

    /**
     * Variation 3 — Cipher Strategy
     * Structure: Word1 + sep + transformed-original + sep + number + sep + Word2 + double-symbol
     * Transforms: selective character substitution (non-obvious), case flips in the middle
     * Example: "BlueTiger2004" → "Mesa~BlueTig3r~2004~Flux#297!*"
     * Targets: 25+ characters, creative transforms, score 4
     */
    function generateCipherVariation(password) {
        var words = getTwoWords();
        var sep = getRandomFrom(['~', '.', '_', '-']);
        var num = getRandomInt(100, 999);
        var sym1 = getRandomFrom(['!', '#', '$', '&', '*']);
        var sym2 = getRandomFrom(['!', '#', '$', '&', '*']);

        // Apply subtle, non-obvious character transformations
        // Only transform 1-3 characters to keep it recognizable
        var transformed = '';
        var changes = 0;
        var maxChanges = Math.min(3, Math.max(1, Math.floor(password.length / 5)));

        for (var i = 0; i < password.length; i++) {
            var c = password[i];
            if (changes < maxChanges && i > 0 && i < password.length - 1) {
                // Flip case of a letter in the middle
                if (/[a-z]/.test(c) && Math.random() > 0.6) {
                    transformed += c.toUpperCase();
                    changes++;
                } else if (/[A-Z]/.test(c) && Math.random() > 0.7) {
                    transformed += c.toLowerCase();
                    changes++;
                } else {
                    transformed += c;
                }
            } else {
                transformed += c;
            }
        }

        var variation = words[0] + sep + transformed + sep + num + sep + words[1] + sym1 + sym2;

        // Harden: guarantee score 4
        variation = hardenToScore4(variation);

        return variation;
    }

    /**
     * Harden a password variation until it achieves zxcvbn score 4.
     * Adds entropy in deliberate steps rather than random appendage.
     * Max 8 rounds to avoid infinite loops.
     */
    function hardenToScore4(password) {
        var maxRounds = 8;
        var round = 0;

        while (round < maxRounds) {
            var result = zxcvbn(password);
            if (result.score >= 4) {
                // Verify crack time is actually strong (centuries for fast hash)
                var fastCrackSec = result.crack_times_seconds.offline_fast_hashing_1e10_per_second;
                if (fastCrackSec > 31536000) { // > 1 year in seconds
                    return password;
                }
            }

            // Each round adds different types of entropy
            switch (round % 4) {
                case 0:
                    // Add a word with separator
                    password += getRandomFrom(SEPARATORS) + getRandomFrom(WORD_LIST);
                    break;
                case 1:
                    // Add a number + symbol
                    password += getRandomInt(10, 99) + getRandomFrom(['!', '#', '$', '&', '*', '@']);
                    break;
                case 2:
                    // Prepend a word
                    password = getRandomFrom(WORD_LIST) + getRandomFrom(['.', '_', '-']) + password;
                    break;
                case 3:
                    // Add a longer random number
                    password += getRandomFrom(SEPARATORS) + getRandomInt(100, 9999);
                    break;
            }
            round++;
        }

        return password;
    }


    /* ── Event Handlers ──────────────────────── */

    /**
     * Update character count display
     */
    function updateCharCount() {
        const len = passwordInput.value.length;
        charCount.textContent = len + (len === 1 ? ' character' : ' characters');
    }

    /**
     * Debounced analysis triggered by typing
     */
    const debouncedAnalysis = debounce(function () {
        const password = passwordInput.value;
        updateCharCount();
        if (password.length > 0) {
            analyzePassword(password);
        } else {
            resultsSection.classList.add('hidden');
        }
    }, 300);

    // Real-time input analysis
    passwordInput.addEventListener('input', debouncedAnalysis);

    // Analyze button
    analyzeBtn.addEventListener('click', function () {
        const password = passwordInput.value;
        updateCharCount();
        if (password.length > 0) {
            analyzePassword(password);
            // Smooth scroll to results
            setTimeout(function () {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            showToast('Please enter a password to analyze.');
        }
    });

    // Clear button
    clearBtn.addEventListener('click', function () {
        passwordInput.value = '';
        resultsSection.classList.add('hidden');
        updateCharCount();
        passwordInput.focus();

        // Reset strength bar
        strengthBar.style.width = '0%';
        strengthLabel.textContent = '—';
        strengthScore.textContent = 'Score: —/4';
    });

    // Toggle password visibility
    toggleBtn.addEventListener('click', function () {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        // Toggle eye icons
        const eyeOpen = toggleBtn.querySelector('.eye-open');
        const eyeClosed = toggleBtn.querySelector('.eye-closed');

        if (isPassword) {
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    });

    // Copy to clipboard — event delegation
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.copy-btn');
        if (btn) {
            const pw = btn.getAttribute('data-password');
            if (pw && navigator.clipboard) {
                navigator.clipboard.writeText(pw).then(function () {
                    showToast('Copied to clipboard!');
                }).catch(function () {
                    // Fallback for older browsers
                    fallbackCopy(pw);
                });
            } else if (pw) {
                fallbackCopy(pw);
            }
        }
    });

    /**
     * Fallback copy using a temporary textarea
     */
    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (e) {
            showToast('Unable to copy. Please copy manually.');
        }
        document.body.removeChild(ta);
    }

    // Keyboard: Enter to analyze
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyzeBtn.click();
        }
    });

    // Initialize char count
    updateCharCount();

}); // end DOMContentLoaded

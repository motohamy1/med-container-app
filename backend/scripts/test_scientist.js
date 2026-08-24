const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const AutonomousScientist = require('../services/autonomousScientistService');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runDiagnostic() {
    console.log('🧪 Starting Autonomous Scientist Diagnostic...\n');

    // 1. Check Database Readiness
    console.log('--- Phase 1: Database Readiness ---');
    try {
        const tables = ['knowledge_gaps', 'knowledge_review_queue', 'scientific_ledger', 'specialty_topics'];
        for (const table of tables) {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                console.warn(`⚠️ Table "${table}" check failed: ${error.message}`);
                console.log(`👉 Action: Ensure you have run the SQL setup for "${table}".`);
            } else {
                console.log(`✅ Table "${table}" is accessible.`);
            }
        }
    } catch (e) {
        console.error('❌ Supabase connection failed. Check your .env file.');
        return;
    }

    // 2. Insert a Mock Gap (if none exist)
    console.log('\n--- Phase 2: Mock Gap Injection ---');
    const { data: existingGaps } = await supabase.from('knowledge_gaps').select('id').eq('status', 'PENDING');
    if (!existingGaps || existingGaps.length === 0) {
        console.log('📥 No pending gaps found. Injecting a test gap: "management of monkeypox in 2025"');
        await supabase.from('knowledge_gaps').insert({
            query: 'management of monkeypox in 2025',
            category: 'infectious',
            status: 'PENDING'
        });
    } else {
        console.log(`✅ Found ${existingGaps.length} pending gaps to process.`);
    }

    // 3. Trigger One Cycle
    console.log('\n--- Phase 3: Research Cycle Execution ---');
    console.log('🚀 Triggering runResearchCycle(). This involves AI calls and PMC searches...');
    const startTime = Date.now();

    try {
        const results = await AutonomousScientist.runResearchCycle();
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('\n--- Phase 4: Results ---');
        console.log(`⏱️ Duration: ${duration}s`);
        console.log(`✅ Gaps Hunted: ${results.gapsHunted}`);
        console.log(`✅ Topics Audited: ${results.topicsAudited}`);

        if (results.gapsHunted > 0 || results.topicsAudited > 0) {
            console.log('\n🎉 SUCCESS: The scientist found new information!');
            console.log('👉 Check your "knowledge_review_queue" table in Supabase to see the new clinical protocols.');
        } else {
            console.log('\nℹ️ CYCLE COMPLETE: No new updates were necessary for this batch.');
        }

    } catch (err) {
        console.error('\n❌ Research cycle failed during execution:', err.message);
    }

    process.exit(0);
}

runDiagnostic();
